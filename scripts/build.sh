#!/bin/bash

# assumes that 
# dna/workdir/projects.dna
# and
# dna/workdir/profiles.dna
# are already pre-compiled and up to date
# In CI this is handled via .github/workflows/release.yml
# where it calls install-hc-tools and and dna-pack

# ensure all necessary binaries are packaged in the app
rm -rf electron/binaries
mkdir electron/binaries
cp dna/workdir/projects.dna electron/binaries/projects.dna
cp dna/workdir/profiles.dna electron/binaries/profiles.dna
bash scripts/copy-binaries.sh

# ui
rm -rf electron/web
npm run web-build
cp -r web/dist electron/web

# build the electron application
cd electron
npm run build

