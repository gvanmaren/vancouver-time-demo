import {
  property,
  subclass,
} from "@arcgis/core/core/accessorSupport/decorators";

import { tsx } from "@arcgis/core/widgets/support/widget";

import Expand from "@arcgis/core/widgets/Expand";
import LayerList from "@arcgis/core/widgets/LayerList";
import AppStore from "../stores/AppStore";
import Header from "./Header";
import { Widget } from "./Widget";

type AppProperties = Pick<App, "store">;

@subclass("arcgis-core-template.App")
class App extends Widget<AppProperties> {
  @property()
  store: AppStore;

  postInitialize(): void {
    const view = this.store.view;
    const layerList = new LayerList({ view });
    view.ui.add(
      new Expand({
        view,
        content: layerList,
      }),
      "bottom-right",
    );
  }

  render() {
    return (
      <div>
        <Header store={this.store}></Header>
      </div>
    );
  }
}

export default App;
