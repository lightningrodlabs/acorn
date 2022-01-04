#!/bin/bash

# install dependencies
sudo apt-get install -y build-essential libssl-dev pkg-config

# install rust and webassembly
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustup target install wasm32-unknown-unknown

# install lair-keystore and hc
npm run dna-install-deps
# turn zomes into webassembly into zipped dna files
npm run dna-pack
# compile the main conductor, which bundles the dna
cargo build --release
mkdir electron/binaries
cp target/release/acorn-conductor electron/binaries/acorn-conductor
# create a throwaway directory for hosting the source chain
mkdir user2-data
# run the conductor
npm run dna-dev
