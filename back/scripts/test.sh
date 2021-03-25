#!/usr/bin/env bash
cargo test -j 2 --manifest-path back/zomes/projects/Cargo.toml --lib --features="mock"