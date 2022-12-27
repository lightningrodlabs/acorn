#!/bin/bash
# Compile the WASM
cargo build --release --target wasm32-unknown-unknown --manifest-path happ/zomes/projects/Cargo.toml
cargo build --release --target wasm32-unknown-unknown --manifest-path happ/zomes/projects_integrity/Cargo.toml
cargo build --release --target wasm32-unknown-unknown --manifest-path happ/zomes/profiles/Cargo.toml
cargo build --release --target wasm32-unknown-unknown --manifest-path happ/zomes/profiles_integrity/Cargo.toml
# Pack DNAs
hc dna pack --output=happ/workdir/profiles.dna happ/workdir/dna/profiles
hc dna pack --output=happ/workdir/projects.dna happ/workdir/dna/projects

# Pack hApp
hc app pack --output=happ/workdir/profiles/profiles.happ happ/workdir/profiles
hc app pack --output=happ/workdir/projects/projects.happ happ/workdir/projects