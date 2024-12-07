## Developers

### Managing Dependencies for Developing Acorn

There are several cargo and holochain dependencies you need to manage when you change any of the holochain aspects of Acorn:

- [`holochain-runner`](https://github.com/lightningrodlabs/holochain-runner)
  - a rust binary that bundles a preconfigured conductor to simplify the app packaging process.
- [`electron-holochain`](https://github.com/lightningrodlabs/electron-holochain)
  - an electron template which includes `holochain-runner`, meant to reduce boilerplate around building desktop happs. All that's required are the UI and `.happ` files.
- [`hdk_crud`](https://github.com/lightningrodlabs/hdk_crud)
  - a generic zome utility crate for defining entry types and automatically generating CRUD for each of them. Used by `acorn-happ`.
- [`acorn-happ`](https://github.com/lightningrodlabs/acorn-happ)
  - all of the zome logic lives here. Uses `hdk_crud` to define all the Acorn entry types, like outcomes, edges, etc.

### Building the frontend

There are two build targets:

- desktop
- Weave app

### Run Locally and Develop on your Computer

_Prerequisites_

- Have `nodejs` (v20) and `yarn` (v1, classic) installed on your system

Then run

- `yarn install`
- `yarn run dev`

In the future, just run `yarn run dev` anytime to develop.

When you run `yarn run dev` a `user-data/` directory is created and this is where user data including private keys, and also data generated through use of the app is stored.

You can run `yarn run user-data-reset` if you have user data in development, but you want to clear it, and start over with fresh identities.

> NOTE: if you see a blank screen once electron launches the app, refresh the page (using View -> Reload or Cmd/Ctrl-R) to see app contents.

#### Commands that are more specific to your use case:

You can run the web process and the electron processes separately, instead of running `yarn run dev` which combines them.

**web** (user interface)

- `yarn run web`

**electron**

- `yarn run electron`

#### Multi-User Testing

run the following commands in separate terminal instances (must have a running instance of acorn for the first user, either by running `yarn run dev` or the below commands without the `2`):

- `yarn run web(2,3,4)`
- `yarn run electron(2,3,4)`

After running these commands, a `user-data/` directory is created with user data. It too can be cleared by running `yarn run user-data-reset`.

### Building / Packaging

To build:

- `yarn run build`

The packaged executables can be found in `frontend/electron/out`.

In order to get cross-platform builds, just tag your repository like `v1.0.0-alpha` and push the tag to Github. CI will automatically start running a build, under the "Release" action.

> Macos: You will need to have set the following environment variables as repository secrets:
>
> - APPLE_CERTIFICATE_BASE64
> - APPLE_CERTIFICATE_PASS
> - APPLE_DEV_IDENTITY
> - APPLE_ID_EMAIL
> - APPLE_ID_PASSWORD
> - APPLE_TEAM_ID
>
> The first two should be set as equivalents of `MACOS_CERTIFICATE` = `APPLE_CERTIFICATE_BASE64` and `MACOS_CERTIFICATE_PWD` = `APPLE_CERTIFICATE_PASS` as found in the following article, which also provides other instruction regarding this: https://localazy.com/blog/how-to-automatically-sign-macos-apps-using-github-actions

### Versioning

Each version of the app will either change, or not change, the paths to the user data folders in use by the application.

The user data will be located under `acorn` in the platform specific appData folder, as specified by `appData` here: https://www.electronjs.org/docs/latest/api/app#appgetpathname

It is then in a specific sub-folder that relates to one of two types of data:

- source chain and DHT -> `databases-${INTEGRITY_VERSION_NUMBER}`
- private keys -> `keystore-${KEYSTORE_VERSION_NUMBER}`

INTEGRITY_VERSION_NUMBER and KEYSTORE_VERSION_NUMBER are defined in `electron/src/holochain.ts` and can be modified as needed in order to jump to new versions of holochain, or a new app DNA.

You can tweak INTEGRITY_VERSION_NUMBER and KEYSTORE_VERSION_NUMBER independently.

INTEGRITY_VERSION_NUMBER should be incremented when a new DNA is in use, or when a new version of holochain which is not backwards compatible with prior versions is bumped to. In the case of new happ files being used, this occurs when the version number of the happ release in [./scripts/download-happs.sh](./scripts/download-happs.sh) changes. It will cause users to have to go through the migration process.

KEYSTORE_VERSION_NUMBER should be incremented if the version of lair-keystore changes, and has a new key format. Or if you otherwise want users to have to switch and generate new keys.

## Happ Code

The happ code has been separated into its own repository with its own release process. This has been done even though developing new features can sometimes involve the modification of that code, as well as the frontend and desktop wrapper code.

The repo is here: https://github.com/lightningrodlabs/acorn-happ.

After making changes, and performing a release, just edit [./scripts/download-happs.sh](./scripts/download-happs.sh) to point to the new release, and then run `yarn run download-happs` to download the new release.

As mentioned above, INTEGRITY_VERSION_NUMBER should be incremented when the happ release has been updated.

## Dependencies

This project uses [holochain-runner](https://github.com/lightningrodlabs/holochain-runner) and [electron](https://www.electronjs.org/docs/latest/api/app)

## Technical Overview

Acorn functions at a high level according to these patterns:

- an 'electron' wrapper is responsible for
  - creating a 'BrowserWindow' application window through which users interact with the HTML/JS/CSS GUI of Acorn
  - starting up and stopping background processes for Holochain related services, including the main holochain engine, and the holochain "keystore" which handles cryptographic signing functions. It is necessary for these background processes to be running while the application is open, and for them to stop when it is closed/quit, because the GUI must talk to these components in order for it to perform any of its primary functions such as reading and writing data.
- The `holochain` binary shipped by the holochain organization is **not** directly bundled, and executed. An alternative approach is taken for the needs of Acorn. This alternative approach involves the compilation of a custom binary to run the core Holochain engine, the "conductor", which is achieved by importing shared code from the `holochain` binary source code. It relies on a general library that was developed with Acorn in mind, the [holochain-runner](https://github.com/lightningrodlabs/holochain-runner/). This strategy was taken to optimize performance and cut down on cross-language (js <-> rust) complexity. Due to this architecture, the electron js code does not need to call any functions of the `admin websocket` typically exposed by `holochain` to manage the Conductor state. This also improves code development simplicity, as it minimizes the surface area/complexity of the electron side code, and keeps it "thin".
  - This custom binary also helps the GUI / electron application know about the status of the Conductor. It does this by subscribing to events emitted from the `holochain-runner`, and forwarding those events to the GUI via electron's IPC messages.
- Within the application, here is how Acorn utilizes Holochain:
  - A new user will need a new private/public key pair to represent their unique identity within Acorn. This will be generated automatically on the first launch of Acorn. Acorn will look in the following folder on the users computer to determine whether this is the first launch or a re-launch (`-X` would be replaced by "integrity version" numbers such as `1`, and `-Y` would be replaced by "keystore version" numbers such as `1`, both are the numbers associated in the [Versioning](#versioning) section of this doc):
    - Linux: `~/.config/Acorn/databases-X` and `~/.config/Acorn/keystore-Y`
    - MacOS: `~/Library/Application Support/Acorn/databases-X` and `~/Library/Application Support/Acorn/keystore-Y`
    - Windows: coming soon...
  - In Holochain, there is a pattern of a Conductor running 'apps', where an app is a collection of Cells (which are DNA + Agent), all configured to be running under the same Agent private keys
    - Instead of installing many DNAs within an "app", Acorn installs many/multiple "apps" each with one Cell.
    - On initial launch, the first "app" containing a Cell is automatically installed and activated, as all users need it to operate the app and onboard themselves. It is the "profile" app. It is responsible for sharing data globally between all Acorn users to do with users profile metadata.
    - In order to create a "Project" within Acorn, a whole new "app" containing one Cell is installed and activated. _By taking the unique 5 word secret phrase generated in the UI and injecting it into the DNA as a "uid" key/value, we create a unique secure network and DHT for that Project, which is guessable/joinable only by those who know that same secret phrase, which can be shared with them via chat channels outside of Acorn._
    - When the UI calls into the Conductor to list out which "apps" are installed, it receives back a list like this: `["main-app", "acorn-project-206088-uid-pickle-glandular-cache-jugular-battered", "acorn-project-664715-uid-twinky-mockup-foothold-skiing-handed", "acorn-project-918455-uid-puffball-alkalize-freckles-drier-flame"]` which distinguishes between apps which are project apps, any with the prefix "acorn-project" and the 1 app which is not, which is called "main-app". It uses this distinction to make all the necessary Zome calls into that 1 Cell within each project app to find the Project metadata (`ProjectMeta` in the code) and list it out in the UI on the Dashboard.
- All user data is either stored in the previously mentioned platform specific "application data" folder, and also in the chromekit/electron "localstorage" memory. Only very simple things such as preferences for Trackpad or Mouse are currently stored in "localstorage", the rest is in the application support folder, namespaced by the version number you are currently running.
