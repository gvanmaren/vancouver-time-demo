import WebScene from "@arcgis/core/WebScene";
import * as kernel from "@arcgis/core/kernel";
import SceneView from "@arcgis/core/views/SceneView";
import App from "./components/App";
import AppStore from "./stores/AppStore";

console.log(`Using ArcGIS Maps SDK for JavaScript v${kernel.fullVersion}`);

// setAssetPath("https://js.arcgis.com/calcite-components/1.0.0-beta.77/assets");

const params = new URLSearchParams(document.location.search.slice(1));

const webSceneId = params.get("webscene") || "b02375c6bbe8490cac558193ecabf83c";

const map = new WebScene({
  portalItem: {
    id: webSceneId,
    // portal: {
    //   url: portalUrl,
    // },
  },
});

const view = new SceneView({
  container: "viewDiv",
  map,
});

view.popup.defaultPopupTemplateEnabled = true;

(window as any)["view"] = view;

const store = new AppStore({
  view,
});

const app = new App({
  container: "app",
  store,
});
