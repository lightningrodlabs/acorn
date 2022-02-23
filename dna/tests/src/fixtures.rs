// in this file, you will see instances of setting up a type alias, such as `type OptionVecString = Option<Vec<String>>;`
// this is done to enable passing those to constructor functions for fixturators, like
// ```
// fixturator!(
//      Goal;
//        constructor fn new(..., OptionVecString, ...);
//  );
// ```
#[cfg(test)]
pub(crate) mod fixtures {
    use ::fixt::prelude::*;
    use hdk::prelude::*;
    use holo_hash::{AgentPubKeyB64, HeaderHashB64};
    use profiles::profile::{Profile, Status as ProfileStatus};
    use projects::project::goal::crud::{Goal, Scope, AchievementLevel, TimeEstimate};
    use projects::project::{
        edge::crud::Edge,
        entry_point::crud::EntryPoint,
        goal::crud::TimeFrame,
        goal_comment::crud::GoalComment,
        goal_member::crud::GoalMember,
        goal_vote::crud::GoalVote,
        member::entry::Member,
        project_meta::crud::{PriorityMode, ProjectMeta},
    };

    fixturator!(
      Edge;
        constructor fn new(HeaderHashB64, HeaderHashB64, i64, bool);
    );

    fixturator!(
      EntryPoint;
        constructor fn new(String, AgentPubKeyB64, f64, HeaderHashB64, bool);
    );

    fixturator!(
      GoalMember;
        constructor fn new(HeaderHashB64, AgentPubKeyB64, AgentPubKeyB64, f64, bool);
    );

    fixturator!(
      GoalComment;
        constructor fn new(HeaderHashB64, String, AgentPubKeyB64, f64, bool);
    );

    fixturator!(
      GoalVote;
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
      curve Empty Scope::Uncertain(fixt!(TimeEstimate));
      curve Unpredictable match ScopeVariant::random() {
        ScopeVariant::Small => Scope::Small(fixt!(AchievementLevel)),
        ScopeVariant::Uncertain => Scope::Uncertain(fixt!(TimeEstimate)),
      };
      curve Predictable match ScopeVariant::nth(get_fixt_index!()) {
        ScopeVariant::Small => Scope::Small(AchievementLevelFixturator::new_indexed(Predictable, get_fixt_index!()).next().unwrap()),
        ScopeVariant::Uncertain => Scope::Uncertain(TimeEstimateFixturator::new_indexed(Predictable, get_fixt_index!()).next().unwrap()),

      };
    );


    fixturator!(
      AchievementLevel;
      unit variants [Incomplete Complete] empty Complete;
    );

    fixturator!(
      TimeEstimate;
      constructor fn new(String);
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
        constructor fn new(String, AgentPubKeyB64, OptionAgentPubKeyB64, f64, Optionf64, Scope, OptionVecString, String, OptionTimeFrame, bool);
    );
    fixturator!(
      ProfileStatus;
      unit variants [ Online Away Offline ] empty Offline;
    );
    fixturator!(
      Profile;
        constructor fn new(String, String, String, ProfileStatus, String, AgentPubKeyB64, bool);
    );
}
