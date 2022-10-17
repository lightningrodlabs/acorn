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
import ReactDOM from "react-dom"
import AppProvided from './app-provided'

const acornApplet: WeApplet = {
  async appletRenderers(
    appWebsocket: AppWebsocket,
    adminWebsocket: AdminWebsocket,
    weServices: WeServices,
    appletAppInfo: InstalledAppletInfo[]
  ): Promise<AppletRenderers> {
    return {
      full(element: HTMLElement, registry: CustomElementRegistry) {
        ReactDOM.render(
          React.createElement(AppProvided, {appWs: appWebsocket, adminWs: adminWebsocket}, null),
          element
        );
      },
      blocks: [],
    };
  },
};

export default acornApplet;
