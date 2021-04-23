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

    #[error("Should only use your own AgentPubKey to claim you created this entry")]
    CorruptCreateAgentPubKeyReference,

    #[error("user_edit_hash is Some but should be None during create")]
    SomeNotNoneDuringCreate,

    #[error("user_edit_hash is None but should be Some during edit")]
    NoneNotSomeDuringEdit,

    #[error("Should only use your own AgentPubKey to claim you edited this entry")]
    CorruptEditAgentPubKeyReference,

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