#!/bin/bash

# bump this in tandem with bumping the INTEGRITY_VERSION_NUMBER
curl -sL --ssl-no-revoke https://github.com/lightningrodlabs/acorn-happ/releases/download/v6.0.0/profiles.happ -o electron/binaries/profiles.happ
curl -sL --ssl-no-revoke https://github.com/lightningrodlabs/acorn-happ/releases/download/v6.0.0/projects.happ -o electron/binaries/projects.happ