```
export type AssetLocationAndInfo = {
    appletHash: AppletHash;
    assetInfo: AssetInfo;
    /**
     * Only set if Moss is run in applet development mode and the applet is running in hot-reloading mode
     */
    appletDevPort?: number;
};

export type AssetInfo = {
    name: string;
    icon_src: string;
};

export type AppletInfo = {
    appletBundleId: string;
    appletName: string;
    appletIcon: string;
    groupsHashes: Array<DnaHash>;
};
```
