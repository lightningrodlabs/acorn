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
// import './variables.scss'
// import * as thing from './global.scss'
// import style from '!!raw-loader!./global.scss'
// import style from '!!raw-loader!./styles.scss'
// import style from '!!raw-loader!./routes/Dashboard/Dashboard.scss'
import style from '!!raw-loader!../applet-dist/cssBundle.css'


const acornApplet: WeApplet = {
  async appletRenderers(
    appWebsocket: AppWebsocket,
    adminWebsocket: AdminWebsocket,
    weServices: WeServices,
    appletAppInfo: InstalledAppletInfo[]
  ): Promise<AppletRenderers> {
    return {
      full(element: HTMLElement, registry: CustomElementRegistry) {
        console.log('imported style: ', style)
        element.attachShadow({ mode: 'open' });
        const { shadowRoot } = element;
        const container = document.createElement('div');
        let styleTag = document.createElement('style');
        styleTag.innerHTML = style
        shadowRoot.appendChild(styleTag)

        shadowRoot.appendChild(container)
        ReactDOM.render(
          React.createElement(AppProvided, {appWs: appWebsocket, adminWs: adminWebsocket}, null),
          // element
          container
        );
      },
      blocks: [],
    };
  },
};

export default acornApplet;
