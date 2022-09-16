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
import ReactDOM from 'react-dom'

import { AcornAppletApplet } from "./acorn_applet-applet";

const acorn_appletApplet: WeApplet = {
  async appletRenderers(
    appWebsocket: AppWebsocket,
    adminWebsocket: AdminWebsocket,
    weServices: WeServices,
    appletAppInfo: InstalledAppletInfo[]
  ): Promise<AppletRenderers> {
    return {
      full(element: HTMLElement, registry: CustomElementRegistry) {
        registry.define("acorn_applet-applet", AcornAppletApplet);
        element.innerHTML = `<acorn_applet-applet></acorn_applet-applet>`;
        const appletElement = element.querySelector("acorn_applet-applet") as any;

        appletElement.appWebsocket =  appWebsocket;
        appletElement.profilesStore = weServices.profilesStore;
        appletElement.appletAppInfo = appletAppInfo;
        const root = ReactDOM.createRoot(appletElement);
        // set up store inside <Acorn
        // store contains callback and signalling setup
        // create store
        //call other functions to put config info in store, then pass into react component
        root.render(<Acorn store={}/>);
      },
      blocks: [],
    };
  },
};

export default acorn_appletApplet;
