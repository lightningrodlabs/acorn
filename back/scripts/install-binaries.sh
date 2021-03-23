#!/bin/bash

HOLOCHAIN_GITHUB=https://github.com/holochain/holochain.git
REV=181baec40af0375a9d4e86a5953c44dc91e5cfe4

cargo install --force holochain \
  --git $HOLOCHAIN_GITHUB \
  --rev $REV
cargo install --force holochain_cli \
  --git $HOLOCHAIN_GITHUB \
  --rev $REV