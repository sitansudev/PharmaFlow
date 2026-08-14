use std::{
    net::{TcpStream, ToSocketAddrs},
    process::Command,
    thread,
    time::Duration,
};

use tauri::Manager;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Start the complete PharmaFlow stack silently.
            let mut command = Command::new("powershell.exe");

            command.args([
                "-NoProfile",
                "-NonInteractive",
                "-ExecutionPolicy",
                "Bypass",
                "-File",
                r"C:\PharmaFlow\tools\Start-PharmaFlow.ps1",
            ]);

            // Prevent a PowerShell console window from appearing.
            #[cfg(target_os = "windows")]
            command.creation_flags(CREATE_NO_WINDOW);

            command
                .spawn()
                .expect("Failed to start PharmaFlow services");

            // Wait until the production frontend is ready.
            let address = "127.0.0.1:3417"
                .to_socket_addrs()?
                .next()
                .expect("Invalid PharmaFlow frontend address");

            let mut frontend_ready = false;

            for _ in 0..60 {
                if TcpStream::connect_timeout(
                    &address,
                    Duration::from_millis(500),
                )
                .is_ok()
                {
                    frontend_ready = true;
                    break;
                }

                thread::sleep(Duration::from_secs(1));
            }

            if !frontend_ready {
                panic!(
                    "PharmaFlow frontend failed to start on port 3417"
                );
            }

            // Use the existing Tauri main window.
            let window = app
                .get_webview_window("main")
                .expect("Tauri main window not found");

            // Load PharmaFlow inside the Tauri desktop application.
            window.navigate(
                "http://127.0.0.1:3417/login"
                    .parse()
                    .expect("Invalid PharmaFlow URL"),
            )?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}