# Code Kits

Open-source code for use-case specific web applications that integrate with ArcGIS. This repository contains a template for building code kits using the [ArcGIS Maps SDK for JavaScript](https://developers.arcgis.com/javascript/). Besides it uses the following frameworks:

- [Calcite Design System](https://developers.arcgis.com/calcite-design-system/)
- [Vite](https://vite.dev/)
- [React](https://react.dev/)

## Prerequisites

- Node.js 18.0+

The template comes set up with Prettier for formatting. Take a look at their [editor integration docs](https://prettier.io/docs/en/editors) to integrate it into your development environment.

## Run projects locally

To start, run for example:

```
npm install
npm run dev
```

Then open your browser at http://localhost:3000/

## Create productive build

To build all apps in the repository, use:

```
npm run build
```

The `dist` folder then contains all the files for the web app which can be copied to a web server.

## Deployment

The project can be deployed using [GitHub Actions](https://github.com/features/actions), the [`build-deploy.yml`](./.github/workflows/build-deploy.yml)) workflow does all the work of publishing.

## Licensing

Copyright 2025 Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

A copy of the license is available in the repository's [license.txt](./license.txt) file.
