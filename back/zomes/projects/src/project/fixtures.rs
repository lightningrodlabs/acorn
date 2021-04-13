#[cfg(test)]
pub(crate) mod fixtures {
    use crate::project::goal::crud::{Goal, Hierarchy, Status};
    use crate::project::{edge::crud::Edge, entry_point::crud::EntryPoint, goal::crud::TimeFrame};
    use ::fixt::prelude::*;
    use dna_help::{WrappedAgentPubKey, WrappedHeaderHash};
    use hdk::prelude::*;

    // why can't I put this one in dna_help crate?
    fixturator!(
      WrappedHeaderHash;
        constructor fn new(HeaderHash);
    );

    fixturator!(
      WrappedAgentPubKey;
        constructor fn new(AgentPubKey);
    );

    fixturator!(
      Edge;
        constructor fn new(WrappedHeaderHash, WrappedHeaderHash, f64);
    );

    fixturator!(
      EntryPoint;
        constructor fn new(String, WrappedAgentPubKey, f64, WrappedHeaderHash);
    );

    type OptionWrappedAgentPubKey = Option<WrappedAgentPubKey>;
    type Optionf64 = Option<f64>;
    type OptionVecString = Option<Vec<String>>;
    type OptionTimeFrame = Option<TimeFrame>;

    fixturator!(
      TimeFrame;
      constructor fn new(f64, f64);
    );

    fixturator!(
      Status;
      unit variants [ Uncertain Incomplete InProcess Complete InReview ] empty Uncertain;
    );

    fixturator!(
      Hierarchy;
      unit variants [Root Trunk Branch Leaf NoHierarchy ] empty NoHierarchy;
    );

    fixturator!(
      OptionWrappedAgentPubKey;
      curve Empty {
          None
      };
      curve Unpredictable {
        Some(WrappedAgentPubKeyFixturator::new(Unpredictable).next().unwrap())
      };
      curve Predictable {
        Some(WrappedAgentPubKeyFixturator::new(Predictable).next().unwrap())
      };
    );

    fixturator!(
      Optionf64;
      curve Empty {
          None
      };
      curve Unpredictable {
        Some(fixt!(f64))
      };
      curve Predictable {
        Some(fixt!(f64, Predictable))
      };
    );

    fixturator!(
      OptionVecString;
      curve Empty {
          None
      };
      curve Unpredictable {
        Some(Vec::new())
      };
      curve Predictable {
        Some(Vec::new())
      };
    );

    fixturator!(
      OptionTimeFrame;
      curve Empty {
          None
      };
      curve Unpredictable {
        Some(TimeFrameFixturator::new(Unpredictable).next().unwrap())
      };
      curve Predictable {
        Some(TimeFrameFixturator::new(Predictable).next().unwrap())
      };
    );

    fixturator!(
      Goal;
        constructor fn new(String, WrappedAgentPubKey, OptionWrappedAgentPubKey, f64, Optionf64, Hierarchy, Status, OptionVecString, String, OptionTimeFrame);
    );
}
