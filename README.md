# Acorn - built with Holochain

### _Acorn is in alpha testing_

[**Join our Acorn test group**](https://forms.gle/Ani18rJhDuAGv9LQ8)

[**Check out the Acorn overview**](https://github.com/h-be/acorn-docs)

[**Check out our releases**](https://github.com/h-be/acorn/releases)


## Developers

### To Run Locally and Develop on your Computer
To set up fresh: 

__dna__
- Have rust language (stable) installed on your system
- Have WebAssembly compile target for Rust installed
- `npm run dna-install`
- `npm run dna-pack`

To test backend:

- `npm run dna-test`

__web__ (user interface)

- Use nodejs version 14
- `npm run web-install`
- `npm run web`

__electron__

- `npm run electron-install`
- `npm run electron`

#### Second User

- `npm run web2`
- `npm run electron2`


To build:

- `npm run build`

## Technical Overview

Acorn functions at a high level according to these patterns: 
- an 'electron' wrapper is responsible for
  - creating a 'BrowserWindow' application window through which users interact with the HTML/JS/CSS GUI of Acorn
  -  starting up and stopping background processes for Holochain related services, including the main holochain engine, and the holochain "keystore" which handles cryptographic signing functions. It is necessary for these background processes to be running while the application is open, and for them to stop when it is closed/quit, because the GUI must talk to these components in order for it to perform any of its primary functions such as reading and writing data.
- The `holochain` binary shipped by the holochain organization is **not** directly bundled, and executed. An alternative approach is taken for the needs of Acorn. This alternative approach involves the compilation of a custom binary to run the core Holochain engine, the "conductor", which is achieved by importing shared code from the `holochain` binary source code. This is found in the [conductor](./conductor) folder. It relies on a general library that was developed with Acorn in mind, the [embedded-holochain-runner](https://github.com/Sprillow/embedded-holochain-runner/). This strategy was taken to optimize performance and cut down on cross-language (js <-> rust) complexity. Due to this architecture, the electron js code does not need to call any functions of the `admin websocket` typically exposed by `holochain` to manage the Conductor state. This also improves code development simplicity, as it minimizes the surface area/complexity of the electron side code, and keeps it "thin".
  - This custom binary also helps the GUI / electron application know about the status of the Conductor. It does this by subscribing to events emitted from the `embedded-holochain-runner`, and forwarding those events to the GUI via electron's IPC messages.
- Within the application, here is how Acorn utilizes Holochain:
  - A new user will need a new private/public key pair to represent their unique identity within Acorn. This will be generated automatically on the first launch of Acorn. Acorn will look in the following folder on the users computer to determine whether this is the first launch or a re-launch (`-X-Y-Z` would be replaced by version numbers such as for `v0.5.1` it would be `-0-5-1`):
    - Linux: `~/.config/Acorn/databases-X-Y-Z` and `~/.config/Acorn/keystore-X-Y-Z`
    - MacOS: `~/Library/Application Support/Acorn/databases-X-Y-Z` and `~/Library/Application Support/Acorn/keystore-X-Y-Z`
    - Windows: coming soon...
  - In Holochain, there is a pattern of a Conductor running 'apps', where an app is a collection of Cells (which are DNA + AGent), all configured to be running under the same Agent private keys
    - Instead of installing many DNAs within an "app", Acorn installs many/multiple "apps" each with one Cell. 
    - On initial launch, the first "app" containing a Cell is automatically installed and activated, as all users need it to operate the app and onboard themselves. It is the "profile" app. It is responsible for sharing data globally between all Acorn users to do with users profile metadata. 
    - In order to create a "Project" within Acorn, a whole new "app" containing one Cell is installed and activated. *By taking the unique 5 word secret phrase generated in the UI and injecting it into the DNA as a "uid" key/value, we create a unique secure network and DHT for that Project, which is guessable/joinable only by those who know that same secret phrase, which can be shared with them via chat channels outside of Acorn.*
    - When the UI calls into the Conductor to list out which "apps" are installed, it receives back a list like this: `["main-app",
    "acorn-project-206088-uid-pickle-glandular-cache-jugular-battered", "acorn-project-664715-uid-twinky-mockup-foothold-skiing-handed",
    "acorn-project-918455-uid-puffball-alkalize-freckles-drier-flame"]` which distinguishes between apps which are project apps, any with the prefix "acorn-project" and the 1 app which is not, which is called "main-app". It uses this distinction to make all the necessary Zome calls into that 1 Cell within each project app to find the Project metadata (`ProjectMeta` in the code) and list it out in the UI on the Dashboard. 
- All user data is either stored in the previously mentioned platform specific "application data" folder, and also in the chromekit/electron "localstorage" memory. Only very simple things such as preferences for Trackpad or Mouse are currently stored in "localstorage", the rest is in the application support folder, namespaced by the version number you are currently running.
