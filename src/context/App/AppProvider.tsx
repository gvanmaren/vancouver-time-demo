/**
 * Copyright 2026 Esri
 *
 * Licensed under the Apache License Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { watch, whenOnce } from "@arcgis/core/core/reactiveUtils";
import Graphic from "@arcgis/core/Graphic";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import { ReactNode, useCallback, useEffect, useReducer, useState } from "react";
import { securityStaff } from "../../layers";
import { useAuth } from "../AuthContext";
import { useScene } from "../Scene/useScene";
import { AppContext } from "./app-context";

import { PointSymbol3DSupportedSymbolLayerTypes } from "@arcgis/core/symbols/PointSymbol3D";
import * as symbolUtils from "@arcgis/core/symbols/support/symbolUtils";
import { SymbolUnion } from "@arcgis/core/symbols/types";
import Glow from "@arcgis/core/webscene/Glow";
import SunLighting from "@arcgis/core/webscene/SunLighting";

type LiveState = {
  canGoLive: boolean;
  isLive: boolean;
  isChangingLiveState: boolean;
};

type LiveActions = {
  type: "AUTHENTICATED" | "DONE_CHANGING_LIVE_STATE" | "SET_CHANGING_LIVE_STATE";
};

const liveReducer = (state: LiveState, action: LiveActions): LiveState => {
  if (action.type === "AUTHENTICATED") {
    return { ...state, canGoLive: true };
  } else if (!state.canGoLive) {
    throw new Error("Cannot change live state if not authenticated");
  }
  switch (action.type) {
    case "DONE_CHANGING_LIVE_STATE":
      return { ...state, isChangingLiveState: false };
    case "SET_CHANGING_LIVE_STATE":
      return { ...state, isLive: !state.isLive, isChangingLiveState: true };
    default:
      return state;
  }
};

function timeout(timeoutInMilliseconds: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, timeoutInMilliseconds);
  });
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const scene = useScene();
  const auth = useAuth();
  const portalTitle = scene.webScene.portalItem?.title ?? "";

  const [showStartupDialog, setShowStartupDialog] = useState(false);
  const [title, setTitle] = useState("");

  const [liveState, dispatchLiveState] = useReducer(liveReducer, {
    canGoLive: false,
    isLive: false,
    isChangingLiveState: false,
  });

  useEffect(() => {
    if (auth.user) {
      dispatchLiveState({ type: "AUTHENTICATED" });
    }
  }, [auth.user]);

  useEffect(() => {
    setTitle(portalTitle);
  }, [portalTitle]);

  // useEffect(() => {
  //   if (!scene.loading && scene.isViewReady) {
  //     const view = scene.view;
  //     const slides = scene.webScene.presentation.slides;
  //     if (slides.length) {
  //       const randomSlide = slides.getItemAt(Math.floor(slides.length * Math.random()));
  //       void randomSlide?.applyTo(view, { animate: false });

  //       setTitle(`${portalTitle} - ${randomSlide?.title.text ?? ""}`);
  //     }
  //   }
  // }, [portalTitle, scene]);

  useEffect(() => {
    if (scene.isViewReady && !scene.loading) {
      window.onkeydown = (e: KeyboardEvent) => {
        const view = scene.view;
        const index = Number.parseInt(e.key);
        const slides = scene.webScene.presentation.slides;
        if (0 < index && index <= slides.length) {
          const slide = slides.getItemAt(index - 1);

          if (slide) {
            void slide.applyTo(view);
          }
        }
      };
      return () => {
        window.onkeydown = null;
      };
    }
  }, [scene]);

  useEffect(() => {
    if (!scene.loading) {
      const featureLayer = scene.webScene.allLayers.find(
        l =>
          l.type === "feature" &&
          (l as FeatureLayer).portalItem?.id === "aa14bd819cec4ed3aea0cd449c9178f5"
      ) as FeatureLayer | undefined;

      if (featureLayer) {
        const graphicsLayer = new GraphicsLayer({
          title: `${featureLayer.title} - animated`,
          visible: featureLayer.visible,
        });
        scene.webScene.add(graphicsLayer);
        scene.webScene.remove(featureLayer);

        const abortController = new AbortController();

        const query = featureLayer.createQuery();
        query.returnGeometry = true;
        void featureLayer
          .queryFeatures(query, { signal: abortController.signal })
          .then(({ features }) => {
            features.forEach(feature => {
              void (async () => {
                const renderer = featureLayer.renderer ?? undefined;

                const symbol = await symbolUtils.getDisplayedSymbol(feature, { renderer });

                graphicsLayer.add(
                  new Graphic({
                    geometry: feature.geometry,
                    symbol,
                  })
                );
              })();
            });
          });

        // --- Pulse ---

        const patchGraphics = (strength: number) => {
          graphicsLayer.graphics.forEach(graphic => {
            if (graphic.symbol) {
              patchSymbol(graphic.symbol, strength);
            }
          });
        };

        let pulsating = false;
        const stopPulse = () => {
          if (pulsating) {
            pulsating = false;
            patchGraphics(0.6);
          }
        };

        const startPulse = () => {
          pulsating = true;
          const startMs = performance.now();
          let pulseLastApplyMs = 0;
          const baseGlow = (() => {
            const lighting = scene.isViewReady && scene.view.environment.lighting;
            if (lighting && lighting.type !== "sun") {
              return 0.6;
            }
            const sun = lighting as SunLighting;
            return sun.glow?.intensity ?? 0.6;
          })();

          const step = () => {
            if (!pulsating) {
              return;
            }
            const elapsed = (performance.now() - startMs) / 1000;
            const pulse = 0.5 + 0.5 * Math.sin(elapsed * 2 * Math.PI);

            // Throttle renderer re-apply (stairs)
            const now = performance.now();

            const last = pulseLastApplyMs;
            if (now - last > 150) {
              pulseLastApplyMs = now;
              const strength = 0.6 + 0.6 * pulse;
              patchGraphics(strength);
            }

            // Pulse glow intensity
            const lighting = scene.isViewReady && scene.view.environment.lighting;
            if (lighting && lighting.type === "sun") {
              const sun = lighting as SunLighting;
              sun.glow = sun.glow ?? new Glow({ intensity: baseGlow });
              sun.glow.intensity = baseGlow * (0.7 + 0.6 * pulse);
            }

            requestAnimationFrame(step);
          };

          requestAnimationFrame(step);
        };

        const handler = watch(
          () => graphicsLayer.visible,
          visible => {
            if (visible) {
              startPulse();
            } else {
              stopPulse();
            }
          },
          { initial: true }
        );

        return () => {
          abortController.abort();
          handler.remove();
          scene.webScene.remove(graphicsLayer);
          scene.webScene.add(featureLayer);
        };
      }
    }
  }, [scene]);

  const toggleLiveMode = useCallback(() => {
    if (scene.isViewReady && liveState.canGoLive && !liveState.isChangingLiveState) {
      const isLive = liveState.isLive;

      dispatchLiveState({ type: "SET_CHANGING_LIVE_STATE" });

      const streamLayers = [securityStaff];

      const view = scene.view;

      if (isLive) {
        scene.webScene.removeMany(streamLayers);
        void timeout(1000).finally(() => dispatchLiveState({ type: "DONE_CHANGING_LIVE_STATE" }));
      } else {
        scene.webScene.addMany(streamLayers);
        void (async () => {
          const lvs = await Promise.all(streamLayers.map(l => view.whenLayerView(l)));
          await Promise.all([
            timeout(1000),
            ...lvs.map(async lv => await whenOnce(() => !lv.dataUpdating)),
          ]).finally(() => dispatchLiveState({ type: "DONE_CHANGING_LIVE_STATE" }));
        })();
      }
    }
  }, [liveState, scene]);

  return (
    <AppContext.Provider
      value={{ title, showStartupDialog, setShowStartupDialog, toggleLiveMode, ...liveState }}
    >
      {children}
    </AppContext.Provider>
  );
};

const patchSymbol = (sym: SymbolUnion | undefined, strength: number): void => {
  if (sym?.type !== "point-3d") {
    return;
  }

  const layers = sym.symbolLayers;

  const patchLayer = (layer: PointSymbol3DSupportedSymbolLayerTypes) => {
    if (!layer.material) {
      return;
    }
    const currentMaterial = layer.material;
    const base = typeof currentMaterial === "object" ? currentMaterial : {};

    layer.material = {
      ...base,
      emissive: { source: "color", strength },
    };
  };

  layers.forEach(patchLayer);
};

export default AppProvider;
