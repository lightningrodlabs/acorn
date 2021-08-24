use embedded_holochain_runner::*;
use structopt::StructOpt;
use tokio::signal::unix::{signal, SignalKind};

const PROFILES_DNA: &'static [u8] = include_bytes!("../../dna/workdir/profiles.dna");

#[derive(Debug, StructOpt)]
#[structopt(
  name = "acorn-conductor",
  about = "run the profiles dna pre-installed, and boot fine on second launch"
)]
struct Opt {
  #[structopt(
    default_value = "databases",
    help = "configuration values for `app_id` and `app_ws_port`
will be overridden if an existing
configuration is found at this path"
  )]
  datastore_path: String,

  #[structopt(long, default_value = "main-app")]
  app_id: String,

  #[structopt(long, default_value = "8888")]
  app_ws_port: u16,

  #[structopt(long, default_value = "1234")]
  admin_ws_port: u16,

  #[structopt(long, default_value = "keystore")]
  keystore_path: String,

  // community
  #[structopt(
    long,
    default_value = "kitsune-proxy://SYVd4CF3BdJ4DS7KwLLgeU3_DbHoZ34Y-qroZ79DOs8/kitsune-quic/h/165.22.32.11/p/5779/--"
  )]
  proxy_url: String,
}

fn main() {
  // Create the runtime
  // we want to use multiple threads
  let rt = tokio::runtime::Builder::new_multi_thread()
    // we use both IO and Time tokio utilities
    .enable_all()
    // give our threads a descriptive name (they'll be numbered too)
    .thread_name("acorn-tokio-thread")
    // build the runtime
    .build()
    // panic if we cannot (we cannot run without it)
    .expect("can build tokio runtime");
  let _guard = rt.enter();

  let (sender, mut receiver) = tokio::sync::mpsc::channel::<StateSignal>(10);
  tokio::task::spawn(async move {
    while let Some(signal) = receiver.recv().await {
      println!("{}", state_signal_to_stdout(&signal));
    }
  });

  let opt = Opt::from_args();
  // String is like "CellNick"/"SlotId"
  let dnas: Vec<(Vec<u8>, String)> = vec![
    (PROFILES_DNA.into(), "profiles-slot".into()),
  ];

  // An infinite stream of hangup signals.
  let mut stream = signal(SignalKind::terminate()).unwrap();

  tokio::task::block_in_place(|| {
    rt.block_on(async {
      let shutdown_sender = async_main(HcConfig {
        app_id: opt.app_id,
        dnas,
        admin_ws_port: opt.admin_ws_port,
        app_ws_port: opt.app_ws_port,
        datastore_path: opt.datastore_path,
        keystore_path: opt.keystore_path,
        proxy_url: opt.proxy_url,
        event_channel: Some(sender),
      })
      .await;
      // wait for SIGTERM
      stream.recv().await;
      println!("got sigterm");
      // send shutdown signal
      shutdown_sender.send(true).unwrap();
      println!("sent shutdown signal");
    })
  });
}

fn state_signal_to_stdout(signal: &StateSignal) -> i16 {
  match signal {
    StateSignal::IsFirstRun => 0,
    StateSignal::IsNotFirstRun => 1,
    // IsFirstRun events
    StateSignal::CreatingKeys => 2,
    StateSignal::RegisteringDna => 3,
    StateSignal::InstallingApp => 4,
    StateSignal::EnablingApp => 5,
    StateSignal::AddingAppInterface => 6,
    // Done/Ready Event
    StateSignal::IsReady => 7,
  }
}
