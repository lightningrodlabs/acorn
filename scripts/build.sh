#!/bin/bash

# backend
# . scripts/install-hc-tools.sh
# . scripts/dna-pack.sh
# cargo build --release
# rm -rf electron/binaries
# mkdir electron/binaries
# cp dna/workdir/projects.dna electron/binaries/projects.dna
# cp target/release/acorn-conductor electron/binaries/acorn-conductor
# cp $(which lair-keystore) electron/binaries/lair-keystore
# ui
# rm -rf electron/web
# npm run web-build
# cp -r web/dist electron/web
cd electron
npm run build

