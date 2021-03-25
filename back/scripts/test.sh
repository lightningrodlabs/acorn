#!/usr/bin/env bash
cargo test -j 2 --manifest-path ../zomes/projects/Cargo.toml --lib --features="mock"