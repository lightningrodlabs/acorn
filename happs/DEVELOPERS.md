
## Developers

_Prerequisites_

1. Install rust language (stable) installed on your system
2. `./scripts/install-hc-tools.sh`: installs wasm32 compilation target for rust as well as the Holochain CLI

OR

1. Install nix and use `nix develop` to load all the build dependencies

**Happ**

- `./scripts/happ-pack.sh`: compiles zomes into wasm, packages each one into a dna using Holochain CLI, and packages profiles.dna into a happ 

## Releasing

`git tag vX.0.0`

`git push origin tag vX.0.0`

That's it. Github actions will build and publish the release to the github releases page.
It will upload two dna files, and two happ files to the release. At time of writing the total build and release time cycle is about 20 minutes.

Once having released, head over to Acorn repo itself and look for the `download-happs.sh` script and bump the number to your desired release number. Then run the script to update the happs in the Acorn repo.