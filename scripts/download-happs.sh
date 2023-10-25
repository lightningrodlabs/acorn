#!/bin/bash

mkdir -p electron/binaries
# bump this in tandem with bumping the INTEGRITY_VERSION_NUMBER
# -q is just "quiet" without the logs
wget -q https://github.com/lightningrodlabs/acorn-happ/releases/download/v12.0.0/profiles.happ -O electron/binaries/profiles.happ
wget -q https://github.com/lightningrodlabs/acorn-happ/releases/download/v12.0.0/projects.happ -O electron/binaries/projects.happ
