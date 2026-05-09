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
import { whenOnce } from "@arcgis/core/core/reactiveUtils";
import { ReactNode, useCallback, useEffect, useReducer, useState } from "react";
import { securityStaff } from "../../layers";
import { useAuth } from "../AuthContext";
import { useScene } from "../Scene/useScene";
import { AppContext } from "./app-context";

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

export default AppProvider;
