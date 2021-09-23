#!/bin/bash

# compile the rust code to WASM
# and package the WASM into DNA files
# sh scripts/dna-pack.sh


# ensure all necessary binaries are packaged in the app
rm -rf electron/binaries
mkdir electron/binaries
cp dna/workdir/projects.dna electron/binaries/projects.dna
cp dna/workdir/profiles.dna electron/binaries/profiles.dna
sh scripts/copy-binaries.sh

# ui
rm -rf electron/web
npm run web-build
cp -r web/dist electron/web

# built the electron application
cd electron
npm run build

