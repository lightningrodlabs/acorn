#!/bin/bash

mkdir -p electron/binaries
# bump this in tandem with bumping the INTEGRITY_VERSION_NUMBER
wget https://github.com/lightningrodlabs/acorn-happ/releases/download/v13.0.0/profiles.happ -O electron/binaries/profiles.happ
wget https://github.com/lightningrodlabs/acorn-happ/releases/download/v13.0.0/projects.happ -O electron/binaries/projects.happ
