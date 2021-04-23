use hdk::prelude::*;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum Error {
    #[error("Element with invalid header")]
    WrongHeader,

    #[error("Element is missing its Entry")]
    EntryMissing,

    #[error("Parent and Child entries are not different")]
    IdenticalParentChild,

    #[error("Should not use an AgentPubKey other than your own here")]
    CorruptAgentPubKeyReference,

    #[error("Updates not allowed for this entry type")]
    UpdateAttempted,

    #[error("Deserialization Failed")]
    DeserializationFailed,

    #[error("Wasm Error {0}")]
    Wasm(WasmError),
}

impl From<Error> for ValidateCallbackResult {
    fn from(e: Error) -> Self {
        ValidateCallbackResult::Invalid(e.to_string())
    }
}

impl From<Error> for ExternResult<ValidateCallbackResult> {
    fn from(e: Error) -> Self {
        Ok(e.into())
    }
}