use hdi::prelude::*;

/*
  UncertainScope
*/

#[derive(Serialize, Deserialize, Debug, SerializedBytes, Clone, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct UncertainScope {
    pub smalls_estimate: SmallsEstimate,
    pub time_frame: Option<TimeFrame>,
    pub in_breakdown: bool,
}

impl UncertainScope {
    pub fn new(
        smalls_estimate: SmallsEstimate,
        time_frame: Option<TimeFrame>,
        in_breakdown: bool,
    ) -> Self {
        Self {
            smalls_estimate,
            time_frame,
            in_breakdown,
        }
    }
}

/*
  SmallsEstimate
*/

#[derive(Serialize, Deserialize, Debug, SerializedBytes, Clone, PartialEq)]
pub struct SmallsEstimate(pub Option<u32>);

impl SmallsEstimate {
    pub fn new(estimate: Option<u32>) -> Self {
        Self(estimate)
    }
}

/*
  TimeFrame
*/

#[derive(Serialize, Deserialize, Debug, SerializedBytes, Clone, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct TimeFrame {
    from_date: f64,
    to_date: f64,
}

impl TimeFrame {
    pub fn new(from_date: f64, to_date: f64) -> Self {
        Self { from_date, to_date }
    }
}
