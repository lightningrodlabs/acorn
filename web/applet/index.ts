import {
  AdminWebsocket,
  AppWebsocket,
  InstalledAppInfo,
  InstalledCell,
} from "@holochain/client";
import {
  WeApplet,
  AppletRenderers,
  WeServices,
  InstalledAppletInfo,
} from "@lightningrodlabs/we-applet";
import React from 'react'
// import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client"
// @ts-ignore
import AppProvided from '../src/app-provided'

const acorn_appletApplet: WeApplet = {
  async appletRenderers(
    appWebsocket: AppWebsocket,
    adminWebsocket: AdminWebsocket,
    weServices: WeServices,
    appletAppInfo: InstalledAppletInfo[]
  ): Promise<AppletRenderers> {
    return {
      full(element: HTMLElement, registry: CustomElementRegistry) {
        // const root = ReactDOM.createRoot(element);
        const root = createRoot(element);
        root.render(React.createElement(AppProvided, {appWs: appWebsocket, adminWs: adminWebsocket}, null));
      },
      blocks: [],
    };
  },
};

export default acorn_appletApplet;
