
## Developers

### Run Locally and Develop on your Computer

_Prerequisites_

- Have rust language (stable) installed on your system
- Have nodejs version 14 installed on your system

Then run

- `npm run install-deps`
- `npm run dev`

In the future, just run `npm run dev` anytime to develop.

When you run `npm run dev` a `user-data/` directory is created and this is where user data including private keys, and also data generated through use of the app is stored.

You can run `npm run user-data-reset` if you have user data in development, but you want to clear it, and start over with fresh identities.

> NOTE: if you see a blank screen once electron launches the app, refresh the page (using View -> Reload or Cmd/Ctrl-R) to see app contents.

#### Commands that are more specific to your use case:

**dna**

- Have rust language (stable) installed on your system, then...
- `npm run happ-install`: installs wasm32 compilation target for rust as well as the Holochain CLI
- `npm run happ-pack`: compiles zomes into wasm, packages each one into a dna using Holochain CLI, and packages profiles.dna into a happ 
- `npm run happ-reset`: runs `happ-pack` and clears user data (Run this anytime you change the code in `happ` folder during development)

To test backend:

- `npm run happ-test`: runs unit tests

**web** (user interface)

- Use nodejs version 14
- `npm run web-install`
- `npm run web`

**electron**

- `npm run electron-install`
- `npm run electron`

#### Multi-User Testing
run the following commands in separate terminal instances (must have a running instance of acorn for the first user, either by running `npm run dev` or the below commands without the `2`):

- `npm run web2`
- `npm run electron2`

After running these commands, a `user2-data/` directory is created with user data. It too can be cleared by running `npm run user-data-reset`.

### Building / Packaging

To build:

- `npm run build`

The packaged executables can be found in `frontend/electron/out`.

In order to get cross-platform builds, just tag your repository like `v0.0.1` and push the tag to Github. CI will automatically start running a build, under the "Release" action.

> Macos: You will need to have set the following environment variables as repository secrets:
> - APPLE_CERTIFICATE_BASE64
> - APPLE_CERTIFICATE_PASS
> - APPLE_DEV_IDENTITY
> - APPLE_ID_EMAIL
> - APPLE_ID_PASSWORD
> 
> The first two should be set as equivalents of `MACOS_CERTIFICATE` = `APPLE_CERTIFICATE_BASE64` and `MACOS_CERTIFICATE_PWD` = `APPLE_CERTIFICATE_PASS` as found in the following article, which also provides other instruction regarding this: https://localazy.com/blog/how-to-automatically-sign-macos-apps-using-github-actions


### Versioning

Each version of the app will either change, or not change, the paths to the user data folders in use by the application. 

The user data will be located under `mova` in the platform specific appData folder, as specified by `appData` here: https://www.electronjs.org/docs/latest/api/app#appgetpathname

It is then in a specific sub-folder that relates to one of two types of data: 
- source chain and DHT -> `databases-${DATABASES_VERSION_NUMBER}`
- private keys -> `keystore-${KEYSTORE_VERSION_NUMBER}`

DATABASES_VERSION_NUMBER and KEYSTORE_VERSION_NUMBER are defined in `frontend/electron/src/holochain.ts` and can be modified as needed in order to jump to new versions of holochain, or a new app DNA.

You can tweak DATABASES_VERSION_NUMBER and KEYSTORE_VERSION_NUMBER independently. 

DATABASES_VERSION_NUMBER should be incremented when a new DNA is in use. It will cause users to have to re-create profiles and re-instate data they've previously added.

KEYSTORE_VERSION_NUMBER should be incremented if the version of lair-keystore changes, and has a new key format. Or if you otherwise want users to have to switch and generate new keys.


## Dependency Versions Information

This project is currently using:

> Holochain Revision: [v0.0.141  May 24, 2022](https://github.com/holochain/holochain/releases/tag/holochain-0.0.141)
> 
> Lair Keystore Revision: [v0.0.10 Apr 25, 2022](https://github.com/holochain/lair/releases/tag/v0.0.10)
>
> HDK [v0.0.134](https://docs.rs/hdk/0.0.134/hdk/index.html)
> https://docs.rs/hdk/0.0.122/hdk/index.html
> 
> https://github.com/Sprillow/holochain-runner/releases/tag/v0.0.38

and electron version 12 [https://www.electronjs.org/](https://www.electronjs.org/)

## Technical Overview

Acorn functions at a high level according to these patterns:

- an 'electron' wrapper is responsible for
  - creating a 'BrowserWindow' application window through which users interact with the HTML/JS/CSS GUI of Acorn
  - starting up and stopping background processes for Holochain related services, including the main holochain engine, and the holochain "keystore" which handles cryptographic signing functions. It is necessary for these background processes to be running while the application is open, and for them to stop when it is closed/quit, because the GUI must talk to these components in order for it to perform any of its primary functions such as reading and writing data.
- The `holochain` binary shipped by the holochain organization is **not** directly bundled, and executed. An alternative approach is taken for the needs of Acorn. This alternative approach involves the compilation of a custom binary to run the core Holochain engine, the "conductor", which is achieved by importing shared code from the `holochain` binary source code. This is found in the [conductor](./conductor) folder. It relies on a general library that was developed with Acorn in mind, the [holochain-runner](https://github.com/Sprillow/holochain-runner/). This strategy was taken to optimize performance and cut down on cross-language (js <-> rust) complexity. Due to this architecture, the electron js code does not need to call any functions of the `admin websocket` typically exposed by `holochain` to manage the Conductor state. This also improves code development simplicity, as it minimizes the surface area/complexity of the electron side code, and keeps it "thin".
  - This custom binary also helps the GUI / electron application know about the status of the Conductor. It does this by subscribing to events emitted from the `embedded-holochain-runner`, and forwarding those events to the GUI via electron's IPC messages.
- Within the application, here is how Acorn utilizes Holochain:
  - A new user will need a new private/public key pair to represent their unique identity within Acorn. This will be generated automatically on the first launch of Acorn. Acorn will look in the following folder on the users computer to determine whether this is the first launch or a re-launch (`-X-Y-Z` would be replaced by version numbers such as for `v0.5.1` it would be `-0-5-1`):
    - Linux: `~/.config/Acorn/databases-X-Y-Z` and `~/.config/Acorn/keystore-X-Y-Z`
    - MacOS: `~/Library/Application Support/Acorn/databases-X-Y-Z` and `~/Library/Application Support/Acorn/keystore-X-Y-Z`
    - Windows: coming soon...
  - In Holochain, there is a pattern of a Conductor running 'apps', where an app is a collection of Cells (which are DNA + AGent), all configured to be running under the same Agent private keys
    - Instead of installing many DNAs within an "app", Acorn installs many/multiple "apps" each with one Cell.
    - On initial launch, the first "app" containing a Cell is automatically installed and activated, as all users need it to operate the app and onboard themselves. It is the "profile" app. It is responsible for sharing data globally between all Acorn users to do with users profile metadata.
    - In order to create a "Project" within Acorn, a whole new "app" containing one Cell is installed and activated. _By taking the unique 5 word secret phrase generated in the UI and injecting it into the DNA as a "uid" key/value, we create a unique secure network and DHT for that Project, which is guessable/joinable only by those who know that same secret phrase, which can be shared with them via chat channels outside of Acorn._
    - When the UI calls into the Conductor to list out which "apps" are installed, it receives back a list like this: `["main-app", "acorn-project-206088-uid-pickle-glandular-cache-jugular-battered", "acorn-project-664715-uid-twinky-mockup-foothold-skiing-handed", "acorn-project-918455-uid-puffball-alkalize-freckles-drier-flame"]` which distinguishes between apps which are project apps, any with the prefix "acorn-project" and the 1 app which is not, which is called "main-app". It uses this distinction to make all the necessary Zome calls into that 1 Cell within each project app to find the Project metadata (`ProjectMeta` in the code) and list it out in the UI on the Dashboard.
- All user data is either stored in the previously mentioned platform specific "application data" folder, and also in the chromekit/electron "localstorage" memory. Only very simple things such as preferences for Trackpad or Mouse are currently stored in "localstorage", the rest is in the application support folder, namespaced by the version number you are currently running.
