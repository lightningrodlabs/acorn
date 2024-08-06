#!/bin/bash

# crash on error, don't continue
set -e

yarn workspace acorn-ui build
npx bestzip web/dist.zip web/dist/*
cd we-applet
hc web-app pack .