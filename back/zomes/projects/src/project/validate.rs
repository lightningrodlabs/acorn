use crate::project::error::Error;
use hdk::prelude::*;

pub fn entry_from_element_create_only<E: TryFrom<SerializedBytes, Error = SerializedBytesError>>(
    element: &Element,
) -> Result<E, Error> {
    match element.header() {
        // Only creates are allowed
        Header::Create(_) => match element.entry().to_app_option() {
            Ok(Some(entry)) => Ok(entry),
            Ok(None) => Err(Error::EntryMissing),
            Err(e) => return Err(Error::Wasm(e.into())),
        },
        _ => Err(Error::WrongHeader),
    }
}

pub fn entry_from_element_create_or_update<
    E: TryFrom<SerializedBytes, Error = SerializedBytesError>,
>(
    element: &Element,
) -> Result<E, Error> {
    match element.header() {
        Header::Create(_) | Header::Update(_) => match element.entry().to_app_option() {
            Ok(Some(entry)) => Ok(entry),
            Ok(None) => Err(Error::EntryMissing),
            Err(e) => return Err(Error::Wasm(e.into())),
        },
        _ => Err(Error::WrongHeader),
    }
}
