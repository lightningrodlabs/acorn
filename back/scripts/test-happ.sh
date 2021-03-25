#!/usr/bin/env bash
cargo test -j 2 --manifest-path back/zomes/projects/Cargo.toml --lib --features="mock"
cargo test -j 2 --manifest-path back/zomes/profiles/Cargo.toml --lib --features="mock"
cargo test -j 2 --manifest-path back/crates/dna_help/Cargo.toml --lib --features="mock"