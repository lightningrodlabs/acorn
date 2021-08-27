#!/bin/bash

# install wasm32 compilation target
rustup target install wasm32-unknown-unknown

# install `hc` cli tool
cargo install holochain_cli \
  --git https://github.com/holochain/holochain.git \
  --rev a6ac0439670ba367c723a80d3b8bc7c419aa5f6e
