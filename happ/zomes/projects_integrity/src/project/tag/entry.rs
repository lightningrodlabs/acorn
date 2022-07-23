use hdi::prelude::*;

// An connection. This is an arrow on the SoA Tree which directionally links
// two outcomes.
#[hdk_entry_helper]
#[serde(rename_all = "camelCase")]
#[derive(Clone, PartialEq)]
pub struct Tag {
    pub background_color: String,
    pub text: String,
}

impl Tag {
    pub fn new(background_color: String, text: String) -> Self {
        Self {
            background_color,
            text,
        }
    }
}
