#!/bin/bash

# crash on error, don't continue
set -e

yarn workspace acorn-ui build
cd web
npx bestzip ./dist.zip ./dist/*
cd ../

cd we-applet
hc web-app pack .