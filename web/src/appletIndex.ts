import {
  AdminWebsocket,
  AppWebsocket,
  InstalledCell,
} from "@holochain/client";
import {
  WeApplet,
  AppletRenderers,
  WeServices,
  AppletInfo,
} from "@lightningrodlabs/we-applet";
import React from 'react'
import ReactDOM from "react-dom"
import AppProvided from './app-provided'
import style from '!!raw-loader!../applet-dist/cssBundle.css'
import './variables.scss'

const acornApplet: WeApplet = {
  async appletRenderers(
    appWebsocket: AppWebsocket,
    adminWebsocket: AdminWebsocket,
    weStore: WeServices,
    appletInfo: AppletInfo[]
  ): Promise<AppletRenderers> {
    return {
      full(element: HTMLElement, registry: CustomElementRegistry) {
        console.log('imported style: ', style)
        element.attachShadow({ mode: 'open' });
        const { shadowRoot } = element;
        const container = document.createElement('div');
        container.className = 'acorn-we-applet';
        container.style.width = '100%';
        container.style.height = '100%';
        let styleTag = document.createElement('style');
        styleTag.innerHTML = style
        shadowRoot.appendChild(styleTag)

        shadowRoot.appendChild(container)
        ReactDOM.render(
          React.createElement(AppProvided, {appWs: appWebsocket, adminWs: adminWebsocket, weStore, appletInfo, isWeApplet: true}, null),
          container
        );
      },
      blocks: [],
    };
  },
};

export default acornApplet;
