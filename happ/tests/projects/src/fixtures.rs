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
    use holo_hash::{AgentPubKeyB64, HeaderHashB64};
    use projects::project::outcome::crud::{Outcome, Scope, AchievementStatus, SmallsEstimate};
    use projects::project::{
        connection::crud::Connection,
        entry_point::crud::EntryPoint,
        outcome::crud::TimeFrame,
        outcome_comment::crud::OutcomeComment,
        outcome_member::crud::OutcomeMember,
        outcome_vote::crud::OutcomeVote,
        member::entry::Member,
        project_meta::crud::{PriorityMode, ProjectMeta},
    };

    fixturator!(
      Connection;
        constructor fn new(HeaderHashB64, HeaderHashB64, i64, bool);
    );

    fixturator!(
      EntryPoint;
        constructor fn new(String, AgentPubKeyB64, f64, HeaderHashB64, bool);
    );

    fixturator!(
      OutcomeMember;
        constructor fn new(HeaderHashB64, AgentPubKeyB64, AgentPubKeyB64, f64, bool);
    );

    fixturator!(
      OutcomeComment;
        constructor fn new(HeaderHashB64, String, AgentPubKeyB64, f64, bool);
    );

    fixturator!(
      OutcomeVote;
        constructor fn new(HeaderHashB64, f64, f64, f64, f64, AgentPubKeyB64, f64, bool);
    );

    fixturator!(
      Member;
        constructor fn new(AgentPubKeyB64);
    );

    fixturator!(
      ProjectMeta;
        constructor fn new(AgentPubKeyB64, f64, String, OptionString, String, bool, PriorityMode, VecHeaderHashB64);
    );

    type VecHeaderHashB64 = Vec<HeaderHashB64>;
    type OptionAgentPubKeyB64 = Option<AgentPubKeyB64>;
    type OptionString = Option<String>;
    type Optionf64 = Option<f64>;
    type Optionu32 = Option<u32>;
    type OptionVecString = Option<Vec<String>>;
    type OptionTimeFrame = Option<TimeFrame>;

    fixturator!(
      PriorityMode;
      unit variants [ Universal Vote ] empty Universal;
    );

    fixturator!(
      TimeFrame;
      constructor fn new(f64, f64);
    );

    fixturator!(
      Scope;
      enum [ Small Uncertain ];
      curve Empty Scope::Uncertain(fixt!(SmallsEstimate));
      curve Unpredictable match ScopeVariant::random() {
        ScopeVariant::Small => Scope::Small(fixt!(AchievementStatus)),
        ScopeVariant::Uncertain => Scope::Uncertain(fixt!(SmallsEstimate)),
      };
      curve Predictable match ScopeVariant::nth(get_fixt_index!()) {
        ScopeVariant::Small => Scope::Small(AchievementStatusFixturator::new_indexed(Predictable, get_fixt_index!()).next().unwrap()),
        ScopeVariant::Uncertain => Scope::Uncertain(SmallsEstimateFixturator::new_indexed(Predictable, get_fixt_index!()).next().unwrap()),

      };
    );


    fixturator!(
      AchievementStatus;
      unit variants [NotAchieved Achieved] empty Achieved;
    );

    fixturator!(
      SmallsEstimate;
      constructor fn new(Optionu32);
    );

    fixturator!(
      VecHeaderHashB64;
      curve Empty {
          Vec::new()
      };
      curve Unpredictable {
        vec![HeaderHashB64Fixturator::new(Unpredictable).next().unwrap()]
      };
      curve Predictable {
        vec![HeaderHashB64Fixturator::new(Predictable).next().unwrap()]
      };
    );

    fixturator!(
      OptionAgentPubKeyB64;
      curve Empty {
          None
      };
      curve Unpredictable {
        Some(AgentPubKeyB64Fixturator::new(Unpredictable).next().unwrap())
      };
      curve Predictable {
        Some(AgentPubKeyB64Fixturator::new(Predictable).next().unwrap())
      };
    );

    fixturator!(
      OptionString;
      curve Empty {
          None
      };
      curve Unpredictable {
        Some(fixt!(String))
      };
      curve Predictable {
        Some(fixt!(String, Predictable))
      };
    );

    fixturator!(
      Optionu32;
      curve Empty {
          None
      };
      curve Unpredictable {
        Some(fixt!(u32))
      };
      curve Predictable {
        Some(fixt!(u32, Predictable))
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
      Outcome;
        constructor fn new(String, AgentPubKeyB64, OptionAgentPubKeyB64, f64, Optionf64, Scope, OptionVecString, String, OptionTimeFrame, bool);
    );
}
