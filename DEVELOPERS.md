## Developers

This is a monorepo that includes the frontend and backend code for Acorn. All zomes and rust crates are contained in this repo. The main zome code is in `./happs/happ` where a widely used rust crate `hdk_crud` has been moved to `./happs/lib` for easier maintenance.

Note, there are two build targets and thus two development modes:

- Acorn Desktop (app packaging is currently managed by a separate repo [acorn-desktop](https://github.com/lightningrodlabs/acorn-desktop))
- Acorn Moss Tool

## setup

- you must have nix installed, then run `nix develop` at the root. This will setup a nix shell environment with all the required environment packages (holochain, node, etc)
- run `yarn install`
- build the happs by running `yarn run pack-happs`

### Acorn Desktop

When you are running the app locally for the desktop version, you need to run two separate commands.

- In the first terminal window run `yarn run desktop:ui`
- In the second terminal window run `yarn run desktop:happ`

This will launch the ui and a electron app with the holochain conductor preconfigured and the acorn happ loaded.

If you want multiple instances to test multi-agent scenarios run `yarn run desktop:happ -n 2` (or any number)

Alternatively, instead of launching the ui separately, you can run `yarn run build-webhapp` and then `yarn run desktop:webhapp`. This will launch a fully packaged webhapp in a preconfigured electron environment.

### Acorn Moss Tool

- In the first terminal window run `yarn run moss:ui`
- In the second terminal window run `yarn run moss:happ`

If you want 2 agents, open a 3rd terminal window and run `yarn run moss:happ2`

If you want to test the full webhapp, run `yarn run build-webhapp` then run `yarn run moss:webhapp`. If you want a second agent, run `yarn run moss:webhapp2`.

### Building / Packaging Desktop App

#### Step 1: Release webhapp on github

First, the webapp needs to be released on github from where it can later be pulled by the CI of the `[acorn-desktop](https://github.com/lightningrodlabs/acorn-desktop)` repository.

To release the webhapp, update the version number of acorn in the project, including in the root level `package.json` (see [Versioning](#versioning) below), to the version that you want to release Acorn under. Then checkout the `release` branch, merge `main` into the `release` branch and push. This should trigger CI to build and release the webhapp file on github as a draft release. You can then double-check the draft release and if everything looks fine, publish it.

#### Step 2: Build the Desktop App

Then, clone the `[acorn-desktop](https://github.com/lightningrodlabs/acorn-desktop)` repo. Update the link to the webhapp in the `kangaroo.config.ts` file and trigger a release by following the instructions in the README. This should trigger a github action which automatically fetches the webhapp from the previous step and builds and releases multi-platform versions of Acorn, signed and ready to download on the [release page](https://github.com/lightningrodlabs/acorn-desktop/releases).

### Building / Packaging Moss Tool

To build the Moss tool, all you need to do is building the webhapp. You can either build it locally or through CI as described [above](#step-1-release-webhapp-on-github). TO build it locally, run:

- `yarn run build-webhapp`

This will create an `acorn.webhapp` file in the `./happs/happ/workdir` directory.

Then publish this to the weave tool curation list, following the instruction [here](https://github.com/lightningrodlabs/weave-tool-curation/blob/main/0.14/README.md). You can view an example PR of this [here](https://github.com/lightningrodlabs/weave-tool-curation/pull/40).

### Versioning

When you are bumping a version, do a global search for the version number and replace it with the new one. You can see an example commit of this [here](https://github.com/lightningrodlabs/acorn/pull/374/commits/fffe15395ee489d25a0aab7fbc48d674bee97991).
