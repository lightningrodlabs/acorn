#!/bin/bash

# install wasm32 compilation target
rustup target install wasm32-unknown-unknown

# install `hc` cli tool
# KEEP THIS IN SYNC
cargo install holochain_cli --version 0.1.0 --locked
