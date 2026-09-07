# The `validate.rs` files in this tree are DEAD CODE

**Nothing in this directory tree validates anything.** Read this before you
assume otherwise, and before you try to revive any of it.

## What is here

There are **eleven `validate.rs` files, 771 lines**, split across two crates:

| file | lines | `#[hdk_extern]`s |
|---|---|---|
| `projects_integrity/src/project/validate.rs` | 101 | 0 (shared helpers) |
| `projects_integrity/src/project/connection/validate.rs` | 40 | 3 |
| `projects_integrity/src/project/entry_point/validate.rs` | 45 | 3 |
| `projects_integrity/src/project/member/validate.rs` | 33 | 3 |
| `projects_integrity/src/project/outcome/validate.rs` | 105 | 3 |
| `projects_integrity/src/project/outcome_comment/validate.rs` | 95 | 3 |
| `projects_integrity/src/project/outcome_member/validate.rs` | 50 | 3 |
| `projects_integrity/src/project/outcome_vote/validate.rs` | 90 | 3 |
| `projects_integrity/src/project/project_meta/validate.rs` | 65 | 3 |
| `projects_integrity/src/project/tag/validate.rs` | 46 | 3 |
| `projects/src/project/validate.rs` (the **coordinator**) | 101 | 0 |
| **total** | **771** | **27** |

## Why none of it runs

Every `mod.rs` in this tree that could reach one carries the declaration
**commented out**:

```
$ grep -rn 'pub mod validate' happs/happ/zomes
projects_integrity/src/project/mod.rs:11:                // pub mod validate;
projects_integrity/src/project/connection/mod.rs:2:      // pub mod validate;
projects_integrity/src/project/entry_point/mod.rs:2:     // pub mod validate;
projects_integrity/src/project/member/mod.rs:2:          // pub mod validate;
projects_integrity/src/project/outcome/mod.rs:2:         // pub mod validate;
projects_integrity/src/project/outcome_comment/mod.rs:2: // pub mod validate;
projects_integrity/src/project/outcome_member/mod.rs:2:  // pub mod validate;
projects_integrity/src/project/outcome_vote/mod.rs:2:    // pub mod validate;
projects_integrity/src/project/project_meta/mod.rs:2:    // pub mod validate;
projects_integrity/src/project/tag/mod.rs:2:             // pub mod validate;
```

Ten hits, all commented. `projects/src/project/validate.rs` is not referenced by
even a commented `mod` line. So none of these files is in either crate's module
tree, none is compiled, and none of the 27 `#[hdk_extern]`s exists in the shipped
wasm. `grep -c hdk_extern` on both integrity `lib.rs` files returns **0**: the
happ declares no `validate` callback at all, and the conductor therefore accepts
every entry and every link from every agent. See the trust-model section of
`RELEASE.md`.

## Why they are being left dead rather than revived

1. **They target the Holochain 0.0.x API and could not compile if uncommented.**
   They use `ValidateData`, `validate_data.element.header().author()`,
   `HeaderHash`, `must_get_header` and `WasmError::Guest(..)` — none of which has
   existed since Holochain 0.0.x. Porting them to hdi 0.8 is a rewrite, not an
   uncommenting.

2. **They have zero test coverage.** There is no tryorama suite, no sweettest
   suite and no `tests/` directory anywhere in this repo, and `hdk_crud`'s
   `run-test.sh` has had nothing to run for years. Acorn's `deferred: true`
   clone-per-project topology also makes a fixture non-trivial to write. Porting
   771 lines of validators with no harness onto a DNA that is about to be frozen
   risks shipping *wrong* rules — and a wrong validator is worse than none,
   because it permanently rejects legitimate writes and cannot be fixed without
   starting another network.

3. **At least one of them contradicts what Acorn is for.**
   `validate_value_matches_original_author_for_edit` (in
   `projects_integrity/src/project/validate.rs:34`, called from the
   `outcome_vote` and `outcome_comment` validators) enforces "only the original
   author may update this". Enabling it would forbid the collaborative editing of
   other people's outcomes that Acorn exists to do. Reviving these files is a
   **product** decision, not a mechanical port.

## If you want Acorn to validate

That is a separate, test-backed piece of work with a tryorama suite as a
precondition, and it lands on a **future DNA line** — validation is hashed into
the DNA, so rules cannot be added to a frozen happ. Do not port these files
in-place on this line.

**Do not delete them either.** They are the only surviving record of what Acorn's
authors believed the rules should be, and that record is the useful input to
whoever writes the real ones.

---

*This file is deliberately not a comment in a compiled source file. Any edit to
a `.rs` file in an integrity zome moves line numbers, `wasm_error!` embeds
`::core::line!()`, and the wasm bytes — and therefore the DNA hash and the
network — would change. A markdown file beside the code costs nothing.*
