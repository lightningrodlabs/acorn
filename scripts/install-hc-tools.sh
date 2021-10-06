#!/bin/bash

# install wasm32 compilation target
rustup target install wasm32-unknown-unknown

# install `hc` cli tool
# use the version from Oct 6, 2021 to match version
# 0.0.109 of holochain + hdk
# KEEP THIS IN SYNC
cargo install holochain_cli --version 0.0.10
