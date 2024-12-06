#!/bin/bash

# bump this in tandem with bumping the INTEGRITY_VERSION_NUMBER
# -q is just "quiet" without the logs
wget -q https://github.com/lightningrodlabs/acorn-happ/releases/download/v15.0.0/acorn.happ -O ./acorn.happ
wget -q https://github.com/lightningrodlabs/acorn-happ/releases/download/v15.0.0/projects.happ -O ./projects.happ
