#!/bin/bash
# Compile the WASM
cargo build --release --target wasm32-unknown-unknown --manifest-path dna/zomes/projects/Cargo.toml
cargo build --release --target wasm32-unknown-unknown --manifest-path dna/zomes/profiles/Cargo.toml
# Pack DNAs
hc dna pack --output=dna/workdir/profiles.dna dna/workdir/dna/profiles
hc dna pack --output=dna/workdir/projects.dna dna/workdir/dna/projects