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
import "@esri/calcite-components/dist/components/calcite-button";
import "@esri/calcite-components/dist/components/calcite-checkbox";
import "@esri/calcite-components/dist/components/calcite-dialog";
import "@esri/calcite-components/dist/components/calcite-label";

import styles from "./styles.module.css";

import { useEffect, useRef, useState } from "react";
import { useApp } from "../../context/App/useApp";
import splash from "./DESCRIPTION.md";

import { useScene } from "../../context/Scene/useScene";
import { LoadingState, useLoading } from "../../hooks/loading-hook";

const StartupDialog = () => {
  const app = useApp();
  const { webScene } = useScene();
  const loading = useLoading();
  const initialSkipPerformedRef = useRef(false);

  const [skipStartupDialog, setSkipStartipDialogState] = useState(
    localStorage.getItem("skipStartupDialog") === "true"
  );

  const toggleSkipStartupDialog = () => {
    const skip = !skipStartupDialog;
    localStorage.setItem("skipStartupDialog", `${skip}`);
    setSkipStartipDialogState(skip);
  };

  const isLoading = loading.state !== "done";

  const itemControl = !isLoading && webScene.portalItem?.itemControl;
  const canUpdate = itemControl === "admin" || itemControl === "update";

  const [updatingWebScene, setUpdatingWebScene] = useState(false);

  useEffect(() => {
    if (loading.state === "done" && !initialSkipPerformedRef.current) {
      initialSkipPerformedRef.current = true;
      if (skipStartupDialog) {
        app.setShowStartupDialog(false);
      }
    }
  }, [app, loading.state, skipStartupDialog]);

  async function updateWebScene() {
    setUpdatingWebScene(true);

    try {
      const portalItem = webScene.portalItem;
      if (portalItem) {
        portalItem.description = splash;
        await portalItem.update();
      }
    } finally {
      setUpdatingWebScene(false);
    }
  }

  return (
    <calcite-dialog
      slot="dialogs"
      open={app.showStartupDialog}
      modal
      escapeDisabled
      outsideCloseDisabled
      closeDisabled={isLoading}
      heading="Vancouver Time Demo"
      oncalciteDialogClose={() => app.setShowStartupDialog(false)}
    >
      <div className={styles.startupDialogContent}>
        {isLoading ? <Loader state={loading.state}></Loader> : <Description></Description>}
      </div>
      {canUpdate
        ? [
            <calcite-button
              key="update-web-scene"
              disabled={updatingWebScene}
              loading={updatingWebScene}
              slot="footer-start"
              kind="neutral"
              onClick={() => {
                void updateWebScene();
              }}
            >
              Update web scene
            </calcite-button>,
          ]
        : []}
      <calcite-label slot="footer-end" layout="inline-space-between">
        <calcite-checkbox
          checked={skipStartupDialog}
          disabled={isLoading}
          oncalciteCheckboxChange={toggleSkipStartupDialog}
        ></calcite-checkbox>
        Hide on startup
      </calcite-label>

      <calcite-button
        key="close-startup-dialog"
        disabled={isLoading}
        slot="footer-end"
        onClick={() => {
          app.setShowStartupDialog(false);
        }}
      >
        Close
      </calcite-button>
    </calcite-dialog>
  );
};

const stateMessage = (state: LoadingState) => {
  switch (state) {
    case "scene":
      return "Loading scene...";
    case "preload-views":
      return "Preload viewpoints";
    case "done":
      return "";
  }
};

const Loader = ({ state }: { state: LoadingState }) => {
  const message = stateMessage(state);

  return <calcite-loader label={message} text={message}></calcite-loader>;
};

const Description = () => {
  const descriptionDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (descriptionDiv.current) {
      descriptionDiv.current.innerHTML = splash;
    }
  }, [descriptionDiv]);

  return <div ref={descriptionDiv}></div>;
};

export default StartupDialog;
