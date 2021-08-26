use crate::project::{
  error::Error,
  project_meta::crud::ProjectMeta,
  validate::validate_value_matches_create_author,
};
use hdk_crud::{resolve_dependency, ResolvedDependency};
use hdk::prelude::*;

#[hdk_extern]
pub fn validate_create_entry_project_meta(
  validate_data: ValidateData,
) -> ExternResult<ValidateCallbackResult> {
  Ok(
    // element must have an entry that must deserialize correctly
    match ProjectMeta::try_from(&validate_data.element) {
      Ok(proposed_entry) => {
        // `address` must match header author
        validate_value_matches_create_author(&proposed_entry.creator_address.0, &validate_data)
      }
      Err(_e) => Error::EntryMissing.into(),
    },
  )
}

#[hdk_extern]
pub fn validate_update_entry_project_meta(
  validate_data: ValidateData,
) -> ExternResult<ValidateCallbackResult> {
  Ok(
    // element must have an entry that must deserialize correctly
    match ProjectMeta::try_from(&validate_data.element) {
      Ok(project_meta) => match validate_data.element.header() {
        Header::Update(header) => {
          match resolve_dependency::<ProjectMeta>(header.original_header_address.clone().into())? {
            Ok(ResolvedDependency(_, orig_project_meta)) => {
              if project_meta.creator_address == orig_project_meta.creator_address
                && project_meta.created_at == orig_project_meta.created_at
                && project_meta.passphrase == orig_project_meta.passphrase
              {
                ValidateCallbackResult::Valid
              } else {
                Error::ProjectMetaEditableFields.into()
              }
            }
            Err(e) => e,
          }
        }
        _ => {
          // Holochain passed the wrong header!
          #[allow(unreachable_code)]
          return unreachable!();
        }
      },
      Err(_e) => Error::EntryMissing.into(),
    },
  )
}

#[hdk_extern]
/// Deletes aren't allowed
pub fn validate_delete_entry_project_meta(_: ValidateData) -> ExternResult<ValidateCallbackResult> {
  Ok(Error::DeleteAttempted.into())
}
