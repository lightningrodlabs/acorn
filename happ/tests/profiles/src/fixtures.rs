// in this file, you will see instances of setting up a type alias, such as `type OptionVecString = Option<Vec<String>>;`
// this is done to enable passing those to constructor functions for fixturators, like
// ```
// fixturator!(
//      Outcome;
//        constructor fn new(..., OptionVecString, ...);
//  );
// ```
#[cfg(test)]
pub(crate) mod fixtures {
    use ::fixt::prelude::*;
    use hdk::prelude::*;
    use holo_hash::{AgentPubKeyB64, ActionHashB64};
    use profiles::profile::{Profile, Status as ProfileStatus};

    fixturator!(
      ProfileStatus;
      unit variants [ Online Away Offline ] empty Offline;
    );
    fixturator!(
      Profile;
        constructor fn new(String, String, String, ProfileStatus, String, AgentPubKeyB64, bool);
    );
}
