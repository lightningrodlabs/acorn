#!/bin/bash

# install wasm32 compilation target
rustup target install wasm32-unknown-unknown

# install `hc` cli tool
# use the version from August 18, 2021 to match version
# 0.0.103 of holochain + hdk
# KEEP THIS IN SYNC
cargo install holochain_cli --version 0.0.4
