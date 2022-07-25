#!/bin/bash

# install wasm32 compilation target
rustup target install wasm32-unknown-unknown

# install `hc` cli tool
# KEEP THIS IN SYNC
cargo install holochain_cli --version 0.0.47
cargo install lair_keystore --version 0.2.0