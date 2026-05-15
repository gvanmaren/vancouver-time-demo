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
import StreamLayer from "@arcgis/core/layers/StreamLayer";
import LabelClass from "@arcgis/core/layers/support/LabelClass";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer";
import IconSymbol3DLayer from "@arcgis/core/symbols/IconSymbol3DLayer";
import LabelSymbol3D from "@arcgis/core/symbols/LabelSymbol3D";
import PointSymbol3D from "@arcgis/core/symbols/PointSymbol3D";
import TextSymbol3DLayer from "@arcgis/core/symbols/TextSymbol3DLayer";

const makeIconSymbol = (href: string) =>
  new PointSymbol3D({
    symbolLayers: [
      new IconSymbol3DLayer({
        resource: { href },
        size: 24,
        outline: { color: [255, 255, 255], size: 1.5 },
      }),
    ],
  });

export const securityStaff = new StreamLayer({
  url: "https://us4-iot.arcgis.com/dedicated/bc1qjuyagnrebxvh/streams/arcgis/rest/services/Vancouver__fan_zone_tracking/StreamServer",
  elevationInfo: {
    mode: "absolute-height",
    offset: 2, // meters above the surface/buildings
  },

  renderer: new UniqueValueRenderer({
    field: "unittype",
    uniqueValueInfos: [
      {
        value: "Traffic Control",
        label: "Traffic Control",
        symbol: makeIconSymbol("./traffic-control.png"),
      },
      {
        value: "Foot Patrol",
        label: "Foot Patrol",
        symbol: makeIconSymbol("./foot-patrol.png"),
      },
      {
        value: "Paramedic",
        label: "Paramedic",
        symbol: makeIconSymbol("./paramedic.png"),
      },
      {
        value: "Command Post",
        label: "Command Post",
        symbol: makeIconSymbol("./command-post.png"),
      },
    ],
    defaultSymbol: new PointSymbol3D({
      symbolLayers: [
        new IconSymbol3DLayer({
          resource: { primitive: "circle" },
          material: { color: [0, 122, 194] },
          outline: { color: [255, 255, 255], size: 1.5 },
          size: 14,
        }),
      ],
    }),
    defaultLabel: "Unknown",
  }),

  /* renderer: new SimpleRenderer({
    symbol: new PointSymbol3D({
      symbolLayers: [
        new IconSymbol3DLayer({
          resource: { primitive: "circle" },
          material: { color: [0, 122, 194] },
          outline: { color: [255, 255, 255], size: 1.5 },
          size: 14,
        }),
      ],
    }),
  }), */

  labelsVisible: true,
  labelingInfo: [
    new LabelClass({
      labelExpressionInfo: {
        expression: "$feature.unitid",
      },
      symbol: new LabelSymbol3D({
        symbolLayers: [
          new TextSymbol3DLayer({
            material: { color: "white" },
            halo: { color: [0, 0, 0], size: 1 },
            size: 10,
          }),
        ],
      }),
      labelPlacement: "above-center",
      maxScale: 0,
      minScale: 0,
    }),
  ],
});
