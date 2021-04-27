#!/bin/bash

HOLOCHAIN_GITHUB=https://github.com/holochain/holochain.git
REV=a6ac0439670ba367c723a80d3b8bc7c419aa5f6e

cargo install kitsune_p2p_proxy \
  --git $HOLOCHAIN_GITHUB \
  --rev $REV
# cargo install holochain \
#   --git $HOLOCHAIN_GITHUB \
#   --rev $REV
# cargo install holochain_cli \
#   --git $HOLOCHAIN_GITHUB \
#   --rev $REV
# cargo install \
#   --git https://github.com/holochain/lair.git
#   --tag v0.0.1-alpha.12