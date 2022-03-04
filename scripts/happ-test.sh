#!/usr/bin/env bash
# --nocapture makes sure the logging output is visible
cargo test -j 2 --manifest-path happ/tests/Cargo.toml --lib --features="mock" -- --nocapture
[ $? -eq 0 ]  || exit 1