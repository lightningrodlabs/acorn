#!/bin/bash
# Compile the WASM
cargo build --release --target wasm32-unknown-unknown --manifest-path happ/zomes/projects/Cargo.toml
cargo build --release --target wasm32-unknown-unknown --manifest-path happ/zomes/projects_integrity/Cargo.toml
# Pack DNAs
hc dna pack --output=happ/workdir/projects.dna happ/workdir/dna/projects

# Pack hApp
hc app pack --output=happ/workdir/acorn_applet.happ happ/workdir/applet