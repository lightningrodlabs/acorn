#!/bin/bash
# Compile the WASM
CARGO_TARGET_DIR=dna/zomes/target cargo build --release --target wasm32-unknown-unknown --manifest-path dna/Cargo.toml
# Pack DNAs
hc dna pack --output=dna/workdir/profiles.dna dna/workdir/dna/profiles
hc dna pack --output=dna/workdir/projects.dna dna/workdir/dna/projects