#!/bin/bash

HOLOCHAIN_GITHUB=https://github.com/holochain/holochain.git
REV=a6ac0439670ba367c723a80d3b8bc7c419aa5f6e

cargo install holochain_cli \
  --git $HOLOCHAIN_GITHUB \
  --rev $REV
