#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::{convert::TryFrom, path::PathBuf};

use tauri::{
  api::config::WindowConfig, runtime::window::PendingWindow, Manager, Params, WebviewAttributes,
  Window, WindowBuilder, WindowUrl,
};
use url::Url;

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
        splash_window_config.width = 760f64;
        splash_window_config.height = 427f64;
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
        WebviewAttributes::new(WindowUrl::External(Url::try_from("http://localhost:8080")?));
      let window = PendingWindow::with_config(window_config, attrs, "main".into());
      app.create_window(window).unwrap();
      Ok(())
      // app.
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");

  println!("gets here")
}
