use crate::ui_enum::UIEnum;
use hdi::prelude::*;
use std::fmt;

/*
  SmallScope
*/

#[derive(Serialize, Deserialize, Debug, SerializedBytes, Clone, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct SmallScope {
    pub achievement_status: AchievementStatus,
    pub target_date: Option<f64>,
    pub task_list: Vec<SmallTask>,
}

impl SmallScope {
    pub fn new(
        achievement_status: AchievementStatus,
        target_date: Option<f64>,
        task_list: Vec<SmallTask>,
    ) -> Self {
        Self {
            achievement_status,
            target_date,
            task_list,
        }
    }
}

/*
  SmallTask
*/
#[derive(Serialize, Deserialize, Debug, SerializedBytes, Clone, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct SmallTask {
    complete: bool,
    task: String,
}

impl SmallTask {
    pub fn new(complete: bool, task: String) -> Self {
        Self { complete, task }
    }
}

/*
  AchievementStatus
*/

#[derive(Serialize, Deserialize, Debug, SerializedBytes, Clone, PartialEq)]
#[serde(from = "UIEnum")]
#[serde(into = "UIEnum")]
pub enum AchievementStatus {
    Achieved,
    NotAchieved,
}
impl From<UIEnum> for AchievementStatus {
    fn from(ui_enum: UIEnum) -> Self {
        match ui_enum.0.as_str() {
            "NotAchieved" => Self::NotAchieved,
            "Achieved" => Self::Achieved,
            _ => Self::NotAchieved,
        }
    }
}
impl From<AchievementStatus> for UIEnum {
    fn from(achievement_level: AchievementStatus) -> Self {
        Self(achievement_level.to_string())
    }
}
impl fmt::Display for AchievementStatus {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}
