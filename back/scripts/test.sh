#!/usr/bin/env bash
cargo test -j 2 --manifest-path zomes/deepkey/Cargo.toml --lib --features="mock"