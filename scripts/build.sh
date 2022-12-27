#!/bin/bash

# assumes that 
# dna/workdir/projects.dna
# and
# dna/workdir/profiles.happ
# are already pre-compiled and up to date
# In CI this is handled via .github/workflows/release.yml
# where it calls install-hc-tools and and happ-pack

# ensure all necessary binaries are packaged in the app
rm -rf electron/binaries
mkdir electron/binaries
cp happ/workdir/projects/projects.happ electron/binaries/projects.happ
cp happ/workdir/profiles/profiles.happ electron/binaries/profiles.happ
bash scripts/copy-binaries.sh

# ui
rm -rf electron/web
npm run web-build
cp -r web/dist electron/web

# build the electron application
cd electron
npm run build

