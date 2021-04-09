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

    #[error("Attempted to update an Edge")]
    UpdateAttempted,

    #[error("Wasm error {0}")]
    Wasm(WasmError)
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