#!/usr/bin/env bash
# --nocapture makes sure the logging output is visible
cargo test -j 2 --manifest-path dna/zomes/projects/Cargo.toml --lib --features="mock" -- --nocapture
cargo test -j 2 --manifest-path dna/zomes/profiles/Cargo.toml --lib --features="mock" -- --nocapture
cargo test -j 2 --manifest-path dna/crates/dna_help/Cargo.toml --lib --features="mock" -- --nocapture