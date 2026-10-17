# Changelog

## 14.0.0

- Holochain 0.7.1 (hdk 0.7.1 / hdi 0.8.1). This is a new network: it needs Moss 0.16.0-rc.1 or later and cannot see projects from 13.0.x. A group has to upgrade together. To keep a project, Export it on 13.0.x and import the JSON into a project created on 14.0.x (this round trip is untested).
- recv_remote_signal cap grant uses the Holochain 0.7.1 `CapGrantEntry` shape.
- Libraries: @holochain/client 0.21.1, @holochain-open-dev/profiles 0.702, utils 0.701, @theweave/api 0.7.0-rc.1, @theweave/cli 0.16.0-rc.2.
- Added a two-agent tryorama test of the projects zome (`yarn test:happ`).

## Unreleased

- added a Factory Reset file menu option, to reset the entire state, including your keys, of your current version
- added migration error handling to smooth the version migration process
- added the ability to override a migrated project so that it can be used again, if it was migrated by accident or if something went wrong
