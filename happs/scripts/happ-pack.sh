#!/bin/bash
# Compile the WASM
cargo build --release --target-dir happs/target --target wasm32-unknown-unknown --manifest-path happs/Cargo.toml

# Pack DNAs
hc dna pack --output=happs/happ/workdir/profiles.dna happs/happ/workdir/dna/profiles
hc dna pack --output=happs/happ/workdir/projects.dna happs/happ/workdir/dna/projects

# Pack hApp
hc app pack --output=happs/happ/workdir/acorn.happ happs/happ/workdir
hc app pack --output=happs/happ/workdir/projects/projects.happ happs/happ/workdir/projects