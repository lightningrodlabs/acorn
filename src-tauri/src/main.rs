#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::{convert::TryFrom, path::PathBuf};

use embedded_holochain_runner::*;
use tauri::{
  api::config::WindowConfig, runtime::window::PendingWindow, Manager, Params, WebviewAttributes,
  Window, WindowBuilder, WindowUrl,
};
use url::Url;

// const PROFILES_DNA: &'static [u8] = include_bytes!("../../back/workdir/profiles.dna");

#[tauri::command(with_window)]
fn close_splashscreen<M: Params>(window: Window<M>) {
  // Close splashscreen
  let maybe_splashscreen = window
    .windows()
    .into_iter()
    .find(|(label, _win)| label.to_string() == String::from("splash"));
  if let Some((_label, splash)) = maybe_splashscreen {
    splash.close().unwrap();
  }
  // Show main window
  let maybe_main = window
    .windows()
    .into_iter()
    .find(|(label, _win)| label.to_string() == String::from("main"));
  if let Some((_label, main)) = maybe_main {
    main.show().unwrap();
  }
}

// use tauri::Manager;
fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![close_splashscreen])
    .create_window(
      "splash".into(),
      WindowUrl::App(PathBuf::from("splashscreen.html")),
      |_, attrs| {
        let mut splash_window_config = WindowConfig::default();
        splash_window_config.width = 800f64;
        splash_window_config.height = 450f64;
        splash_window_config.decorations = false;
        splash_window_config.resizable = false;
        splash_window_config.always_on_top = true;
        let windowbuilder = WindowBuilder::with_config(splash_window_config);
        (windowbuilder, attrs)
      },
    )
    .on_page_load(|i, _| {
      println!("page loaded {:?}", i.label());
    })
    .setup(|app| {
      let mut window_config = WindowConfig::default();
      window_config.width = 1920f64;
      window_config.height = 1080f64;
      let attrs =
        WebviewAttributes::new(WindowUrl::App(PathBuf::from("")));
      let window = PendingWindow::with_config(window_config, attrs, "main".into());
      app.create_window(window).unwrap();
      Ok(())
      // app.
    })
    .setup(|_app| {
      // main-app
      // String is like "CellNick"/"SlotId"
    //   let dnas: Vec<(Vec<u8>, String)> = vec![(PROFILES_DNA.into(), "profiles".into())];
    //   // Create the runtime
    //   let rt = // we want to use multiple threads
    //   tokio::runtime::Builder::new_multi_thread()
    //       // we use both IO and Time tokio utilities
    //       .enable_all()
    //       // give our threads a descriptive name (they'll be numbered too)
    //       .thread_name("holochain-tokio-thread")
    //       // build the runtime
    //       .build()
    //       // panic if we cannot (we cannot run without it)
    //       .expect("can build tokio runtime");
    //   let _guard = rt.enter();
    //   let _handle = tokio::task::spawn(async move {
    //     inner_async_main(HcConfig {
    //       datastore_path: String::from("databases"),
    //       keystore_path: String::from("keystore"),
    //       app_id: String::from("main-app"),
    //       dnas,
    //       admin_ws_port: 1234,
    //       app_ws_port: 8888,
    //       proxy_url: String::from("kitsune-proxy://SYVd4CF3BdJ4DS7KwLLgeU3_DbHoZ34Y-qroZ79DOs8/kitsune-quic/h/165.22.32.11/p/5779/--"),
    //   }).await;
    // });
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
