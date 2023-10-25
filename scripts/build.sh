#!/bin/bash

set -e

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
bash scripts/download-happs.sh
bash scripts/copy-binaries.sh

# ui
rm -rf electron/web
npm run web-build
cp -r web/dist electron/web

# build the electron application
npm run build -w electron

