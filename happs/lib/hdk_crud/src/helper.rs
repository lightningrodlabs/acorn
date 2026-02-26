use hdk::prelude::*;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ZomeFnInput<T> {
    pub input: T,
    #[serde(default)]
    pub local: Option<bool>,
}

impl<T> ZomeFnInput<T> {
    pub fn get_strategy(&self) -> GetStrategy {
        match self.local.unwrap_or(true) {
            true => GetStrategy::Local,
            false => GetStrategy::Network,
        }
    }

    pub fn get_options(&self) -> GetOptions {
        match self.local.unwrap_or(true) {
            true => GetOptions::local(),
            false => GetOptions::network(),
        }
    }
}
