#!/usr/bin/env bash
# --nocapture makes sure the logging output is visible
cargo test -j 2 --manifest-path happ/tests/profiles/Cargo.toml --lib --features="mock" -- --nocapture
cargo test -j 2 --manifest-path happ/tests/projects/Cargo.toml --lib --features="mock" -- --nocapture
[ $? -eq 0 ]  || exit 1