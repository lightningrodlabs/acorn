#!/usr/bin/env bash
# --nocapture makes sure the logging output is visible
cargo test -j 2 --lib --features="mock" -- --nocapture