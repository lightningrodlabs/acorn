#!/bin/bash

HOLOCHAIN_GITHUB=https://github.com/holochain/holochain.git
REV=a6ac0439670ba367c723a80d3b8bc7c419aa5f6e

cargo install holochain_cli \
  --git $HOLOCHAIN_GITHUB \
  --rev $REV
# v0.0.1-alpha.12
cargo install \
  --git https://github.com/holochain/lair.git
  --rev 3bd7105108ab241d6719e200dd15905cd3e74da1