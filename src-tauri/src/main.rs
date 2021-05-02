#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use embedded_holochain_runner::*;
use tauri::Manager;

const PROFILES_DNA: &'static [u8] = include_bytes!("../../back/workdir/profiles.dna");

fn main() {
  // String is like "CellNick"/"SlotId"
  let dnas: Vec<(Vec<u8>, String)> = vec![(PROFILES_DNA.into(), "profiles-slot".into())];
  let (sender, mut receiver) = tokio::sync::mpsc::channel::<StateSignal>(10);
  let (broadcast_sender, _) = tokio::sync::broadcast::channel::<StateSignal>(16);

  // Create the runtime
  let rt = // we want to use multiple threads
  tokio::runtime::Builder::new_multi_thread()
  // we use both IO and Time tokio utilities
  .enable_all()
  // give our threads a descriptive name (they'll be numbered too)
  .thread_name("holochain-tokio-thread")
  // build the runtime
  .build()
  // panic if we cannot (we cannot run without it)
  .expect("can build tokio runtime");
  let _guard = rt.enter();

  let cloned_sender = broadcast_sender.clone();
  tokio::spawn(async move {
    while let Some(signal) = receiver.recv().await {
      println!("{:?}", signal.clone());
      match cloned_sender.send(signal) {
        Ok(_) => {}
        Err(e) => {
          println!("error with send {:?}", e.to_string());
        }
      };
    }
  });

  let _handle = tokio::spawn(
    async_main(HcConfig {
      // TODO: change these two to use directories crate
          datastore_path: String::from("databases"),
          keystore_path: String::from("keystore"),
          app_id: String::from("main-app"),
          dnas,
          admin_ws_port: 1234,
          app_ws_port: 8888,
          // community
          proxy_url: String::from("kitsune-proxy://SYVd4CF3BdJ4DS7KwLLgeU3_DbHoZ34Y-qroZ79DOs8/kitsune-quic/h/165.22.32.11/p/5779/--"),
          event_channel: Some(sender),
      }));

  tauri::Builder::default()
    .on_page_load(move |window, _| {
      if window.label().to_string() == String::from("splashscreen") {
        let mut r = broadcast_sender.subscribe();
        rt.block_on(async move {
          while let Ok(signal) = r.recv().await {
            match signal {
              StateSignal::IsReady => {
                match window
                  .windows()
                  .into_iter()
                  .find(|(label, _win)| label.to_string() == String::from("main"))
                {
                  Some((_label, main_window)) => {
                    // now that IsReady, reload the screen to connect
                    // the websocket connections
                    main_window.eval("window.location.reload()").unwrap();
                    match main_window.show() {
                      Ok(_) => {
                        println!("show main window");
                        // refresh
                      }
                      Err(e) => {
                        println!("why couldn't show main window? {:?}", e);
                      }
                    };
                  }
                  None => {
                    println!("why couldn't find main window?");
                  }
                };
                // window = splash_window here
                match window.hide() {
                  Ok(_) => {
                    println!("hid splash window");
                  }
                  Err(e) => {
                    println!("why couldn't hide splash window? {:?}", e);
                  }
                };
                break;
              }
              _ => {
                println!("splashscreen heard a non IsReady signal {:?}", signal);
              }
            }
          }
        });
      }
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

/*

// let window = window.clone();
      // window
      //   .emit(
      //     &"bootstrap".to_string(),
      //     Some(serde_json::to_string(&uncode_config).unwrap()),
      //   )
      //   .expect("failed to emit");

// .invoke_handler(tauri::generate_handler![close_splashscreen])
    // .create_window(
    //   "splash".into(),
    //   WindowUrl::App(PathBuf::from("splashscreen.html")),
    //   |_, attrs| {
    //     println!("calling create_window");
    //     let mut splash_window_config = WindowConfig::default();
    //     splash_window_config.width = 800f64;
    //     splash_window_config.height = 450f64;
    //     splash_window_config.decorations = false;
    //     splash_window_config.resizable = false;
    //     splash_window_config.always_on_top = true;
    //     splash_window_config.visible = true;
    //     let windowbuilder = WindowBuilder::with_config(splash_window_config);
    //     (windowbuilder, attrs)
    //   },
    // )
    // .create_window(
    //   "main".into(),
    //   WindowUrl::App(PathBuf::from("/")),
    //   |_, attrs| {
    //     let mut main_window_config = WindowConfig::default();
    //     main_window_config.width = 1920f64;
    //     main_window_config.height = 1080f64;
    //     main_window_config.visible = false;
    //     let windowbuilder = WindowBuilder::with_config(main_window_config);
    //     (windowbuilder, attrs)
    //   },
    // )


// .setup(|app| {
    //   Ok(())
    //   // app.
    // })
    // .setup(|_app| Ok(()))

*/
