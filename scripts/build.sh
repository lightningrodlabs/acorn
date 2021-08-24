#!/bin/bash

# backend
. scripts/install-hc-tools.sh
. scripts/dna-pack.sh

rm -rf electron/binaries
mkdir electron/binaries
cp dna/workdir/projects.dna electron/binaries/projects.dna
cp dna/workdir/profiles.dna electron/binaries/profiles.dna

# DO PLATFORM SPECIFIC BINARIES HERE
# cp ....../holochain-runner electron/binaries/holochain-runner
# cp $(which lair-keystore) electron/binaries/lair-keystore

# ui
rm -rf electron/web
npm run web-build
cp -r web/dist electron/web
cd electron
npm run build

