use projects::project::{
  error::Error, member::entry::Member, validate::validate_value_matches_create_author,
};
use hdk::prelude::*;

#[hdk_extern]
fn validate_create_entry_member(
  validate_data: ValidateData,
) -> ExternResult<ValidateCallbackResult> {
  Ok(
    // element must have an entry that must deserialize correctly
    match Member::try_from(&validate_data.element) {
      Ok(proposed_entry) => {
        // `address` must match header author
        validate_value_matches_create_author(&proposed_entry.address.0, &validate_data)
      }
      Err(_e) => Error::EntryMissing.into(),
    },
  )
}

#[hdk_extern]
/// Updates aren't allowed
fn validate_update_entry_member(_: ValidateData) -> ExternResult<ValidateCallbackResult> {
  Ok(Error::UpdateAttempted.into())
}

#[hdk_extern]
/// Deletes aren't allowed
fn validate_delete_entry_member(_: ValidateData) -> ExternResult<ValidateCallbackResult> {
  Ok(Error::DeleteAttempted.into())
}

#[cfg(test)]
pub mod tests {
  use projects::project::error::Error;
  use projects::project::fixtures::fixtures::MemberFixturator;
  use ::fixt::prelude::*;
  use hdk_crud::WrappedAgentPubKey;
  use hdk::prelude::*;
  use holochain_types::prelude::ValidateDataFixturator;

  #[test]
  fn test_validate_create_entry_member() {
    let mut validate_data = fixt!(ValidateData);
    let create_header = fixt!(Create);
    let mut member = fixt!(Member);
    *validate_data.element.as_header_mut() = Header::Create(create_header.clone());

    // without an Element containing an Entry, validation will fail
    assert_eq!(
      super::validate_create_entry_member(validate_data.clone()),
      Error::EntryMissing.into(),
    );

    // with an entry with a random
    // `address` it will fail (not the agent committing)
    *validate_data.element.as_entry_mut() =
      ElementEntry::Present(member.clone().try_into().unwrap());
    assert_eq!(
      super::validate_create_entry_member(validate_data.clone()),
      Error::CorruptCreateAgentPubKeyReference.into(),
    );

    // make the `address` field valid by making it equal the
    // AgentPubKey of the agent committing
    member.address = WrappedAgentPubKey::new(create_header.author.as_hash().clone());
    *validate_data.element.as_entry_mut() =
      ElementEntry::Present(member.clone().try_into().unwrap());

    // we should see that the ValidateCallbackResult
    // is valid
    assert_eq!(
      super::validate_create_entry_member(validate_data.clone()),
      Ok(ValidateCallbackResult::Valid),
    );
  }

  #[test]
  fn test_validate_update_entry_member() {
    let mut validate_data = fixt!(ValidateData);
    let update_header = fixt!(Update);
    *validate_data.element.as_header_mut() = Header::Update(update_header.clone());
    assert_eq!(
      super::validate_update_entry_member(validate_data),
      Error::UpdateAttempted.into(),
    );
  }

  #[test]
  fn test_validate_delete_entry_member() {
    let mut validate_data = fixt!(ValidateData);
    let delete_header = fixt!(Delete);
    *validate_data.element.as_header_mut() = Header::Delete(delete_header.clone());
    assert_eq!(
      super::validate_delete_entry_member(validate_data),
      Error::DeleteAttempted.into(),
    );
  }
}
