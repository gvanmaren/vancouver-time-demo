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
import { useEffect, useState } from "react";
import { useScene } from "../context/Scene/useScene";

export type LoadingState = "scene" | "preload-views" | "done";

export function useLoading() {
  const scene = useScene();
  const [state, setState] = useState<LoadingState>("scene");

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    void (async () => {
      try {
        await scene.waitForWebScene;
        const { view } = await scene.waitForView;
        signal.throwIfAborted();

        setState("preload-views");

        await whenOnce(() => !view.updating);
        signal.throwIfAborted();
        setState("done");
      } catch (e) {
        if (!signal.aborted) {
          throw e;
        }
      }
    })();

    return () => controller.abort();
  }, [scene]);

  return {
    state,
  };
}
