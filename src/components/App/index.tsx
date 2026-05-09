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
import "@arcgis/map-components/dist/components/arcgis-compass";
import "@arcgis/map-components/dist/components/arcgis-expand";
import "@arcgis/map-components/dist/components/arcgis-layer-list";
import "@arcgis/map-components/dist/components/arcgis-navigation-toggle";
import "@arcgis/map-components/dist/components/arcgis-zoom";

import "@esri/calcite-components/components/calcite-button";
import "@esri/calcite-components/components/calcite-chip";
import "@esri/calcite-components/components/calcite-menu";
import "@esri/calcite-components/components/calcite-menu-item";
import "@esri/calcite-components/components/calcite-navigation";
import "@esri/calcite-components/components/calcite-navigation-logo";
import "@esri/calcite-components/components/calcite-navigation-user";
import "@esri/calcite-components/dist/components/calcite-chip";
import "@esri/calcite-components/dist/components/calcite-shell";
import "@esri/calcite-components/dist/components/calcite-switch";

import NavigationBar from "../NavigationBar";
import Scene from "../Scene";
import StartupDialog from "../StartupDialog";

const App = () => {
  return (
    <>
      <calcite-shell>
        <StartupDialog></StartupDialog>
        <NavigationBar></NavigationBar>
        <Scene>
          <arcgis-zoom slot="top-left"></arcgis-zoom>
          <arcgis-navigation-toggle slot="top-left"></arcgis-navigation-toggle>
          <arcgis-compass slot="top-left"></arcgis-compass>

          <arcgis-expand slot="top-right">
            <arcgis-layer-list></arcgis-layer-list>
          </arcgis-expand>
        </Scene>
      </calcite-shell>
    </>
  );
};

export default App;
