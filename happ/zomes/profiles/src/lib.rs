use hdk::prelude::*;

pub mod profile;

use hdk_crud::signals::create_receive_signal_cap_grant;
use profile::{Profile, AGENTS_PATH};

#[hdk_extern]
fn init(_: ()) -> ExternResult<InitCallbackResult> {
    Path::from(AGENTS_PATH).ensure()?;
    create_receive_signal_cap_grant()?;
    Ok(InitCallbackResult::Pass)
}

entry_defs![Profile::entry_def(), PathEntry::entry_def()];
