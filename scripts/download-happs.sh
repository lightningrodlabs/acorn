#!/bin/bash

# bump this in tandem with bumping the INTEGRITY_VERSION_NUMBER
curl https://github.com/lightningrodlabs/acorn-happ/releases/download/v6.0.0/profiles.happ -o electron/binaries/profiles.happ
curl https://github.com/lightningrodlabs/acorn-happ/releases/download/v6.0.0/projects.happ -o electron/binaries/projects.happ