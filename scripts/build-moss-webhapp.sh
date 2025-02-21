#!/bin/bash

# crash on error, don't continue
set -e

yarn workspace acorn-ui build
yarn run zip-ui

cd weave-tool
hc web-app pack .