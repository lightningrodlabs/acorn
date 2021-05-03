#!/bin/bash

# backend
. scripts/install-hc-tools.sh
. scripts/dna-pack.sh
cargo build --release
rm -rf electron/binaries
mkdir electron/binaries
cp target/release/acorn electron/binaries/acorn
cp $(which lair-keystore) electron/binaries/lair-keystore
# ui
rm -rf electron/web
npm run web-build
cp -r web/dist electron/web

