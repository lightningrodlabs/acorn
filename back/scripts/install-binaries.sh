#!/bin/bash

HOLOCHAIN_GITHUB=https://github.com/holochain/holochain.git
REV=3a47f9798c6175997d27d450a7c4a0b92d17d4da

cargo install --force holochain \
  --git $HOLOCHAIN_GITHUB \
  --rev $REV
cargo install --force holochain_cli \
  --git $HOLOCHAIN_GITHUB \
  --rev $REV