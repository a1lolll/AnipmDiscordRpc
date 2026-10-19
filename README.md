# Ani.pm Discord Rich Presence

a browser extension and Python IPC bridge that automatically syncs your active [ani.pm](https://ani.pm) watch state directly to your Discord profile as a custom **"Watching"** Rich Presence status

![Ani.pm RPC Preview](https://github.com/a1lolll/AnipmDiscordRpc/blob/main/Pictures/show.png)

---

## Features

- **Real-Time Video State:** Displays anime title, episode number, playback time, and duration.
- **Dynamic Media Cover:** Displays the active anime poster/banner image on your profile.
- **Customizable UI Popup:** Switch between anime banners or the default logo, and toggle the small badge on or off.
- **Cross-Platform Support:** Works seamlessly across Windows, Linux (including NixOS), and macOS.
- **Iframe & Player Agnostic:** Detects video state changes (play, pause, seek, ended) across embedded player frames.
- **Proper Activity Classification:** Uses `Watching` (Type 3) to prevent status overrides by other background applications.

---

## Setup & Installation

The system consists of two parts: the **Browser Extension** and the **Local RPC Bridge** (`discord_rpc.py`). Both must be active while watching.

### 1. Browser Extension Setup (Chrome / Brave / Edge)

1. Download or clone this repository to a folder on your computer.
2. Open your browser and navigate to `chrome://extensions/` (or `brave://extensions/`).
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click **Load unpacked** and select the folder containing these files.

---

### 2. Local Python RPC Server Setup

Make sure [Python 3.8+](https://www.python.org/) is installed on your system.

#### Windows
1. Open Command Prompt or PowerShell in the project directory.
2. Create and activate a virtual environment:
   ```cmd
   python -m venv .venv
   .venv\Scripts\activate
