#[cfg(test)]
pub(crate) mod fixtures {
    //   use projects::project::goal::crud::{Goal, Hierarchy, Status};
    //   use projects::project::{
    //     edge::crud::Edge, entry_point::crud::EntryPoint, goal::crud::TimeFrame,
    //     goal_comment::crud::GoalComment, goal_member::crud::GoalMember, goal_vote::crud::GoalVote,
    //     member::entry::Member, project_meta::crud::{ProjectMeta, PriorityMode},
    //   };
    use ::fixt::prelude::*;
    use hdk::prelude::*;
    use hdk_crud::{WrappedAgentPubKey, WrappedHeaderHash};
    use profiles::profile::{Profile, Status};

    fixturator!(
      Status;
      unit variants [ Online Away Offline ] empty Offline;
    );
    fixturator!(
      WrappedAgentPubKey;
        constructor fn new(AgentPubKey);
    );

    fixturator!(
      Profile;
        // constructor fn new(String, String, String, Status, String, WrappedAgentPubKey, bool);
    );
}
