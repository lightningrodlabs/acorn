#!/bin/bash

# Like build-webhapp.sh, but the UI is the STANDALONE bundle
# (webpack.standalone.js: __HARNESS__ defined, env-driven conductor ports) so
# the packed webhapp's chat panel lights up when served by a harness host —
# the acorn-desktop (Kangaroo) embedding, or web/dev-harness/host.js.
# The plain build-webhapp.sh (webpack.prod.js) remains the Moss/webhapp release
# path, where the harness stays hidden.

# crash on error, don't continue
set -e

yarn standalone:build
yarn run zip-ui

cd happs/happ/workdir
hc web-app pack .
