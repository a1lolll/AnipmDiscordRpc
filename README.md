# ani.pm discord rich presence

a simple browser extension and python ipc bridge that automatically syncs your ani.pm status to your discord profile as a "watching" status

![Ani.pm RPC Preview](https://github.com/a1lolll/AnipmDiscordRpc/blob/main/Pictures/show.png)

---

## features

- realtime video status with title, episode, watch time and total duration
- dynamic anime banner or poster on your discord profile
- customizable menu via extension popup to choose between banner or logo
- works on [windows](https://www.microsoft.com/en-gb/windows/?r=1), [linux](https://en.wikipedia.org/wiki/Linux) and [macos](https://www.apple.com/os/macos/) ( tho its only tested on [nixos](https://nixos.org/) )
- detects video status inside player iframes too
- uses proper activity type so other apps do not overwrite your status

---

## setup & installation

the system consists of two parts, the browser extension and the local rpc server (`discord_rpc.py`)

### 1. installing browser extension (chrome / brave / edge)

1. download or clone this repository to a folder on your computer
2. open your browser and go to `chrome://extensions/` or `brave://extensions/`
3. turn on **developer mode** in the top right
4. click **load unpacked** and select the folder containing the .js codes
   
   ![filenames Preview](https://github.com/a1lolll/AnipmDiscordRpc/blob/main/Pictures/filenames.png)
   

---

### 2. starting python rpc server

make sure python 3.8 or higher is installed on your system

#### windows
1. open command prompt or powershell in the project folder
2. create and activate a virtual environment:
   ```cmd
   python -m venv .venv
   .venv\Scripts\activate
   ```
3. install the required packages:
   ```cmd
   pip install flask flask-cors pypresence
   ```
4. start the rpc server:
   ```cmd
   python discord_rpc.py
   ```

#### linux (ubuntu / debian / arch / fedora) & macos
1. open terminal in the project folder
2. create and activate a virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. install the required packages:
   ```bash
   pip install flask flask-cors pypresence
   ```
4. start the rpc server:
   ```bash
   python discord_rpc.py
   ```

#### nixos
start the server directly using nix-shell:
```bash
nix-shell --run "python discord_rpc.py"
```

to stop the server while it runs in a terminal, press `ctrl + c`

---

### 3. running in the background

you dont have to keep a terminal open, pick your system below, every example shows how to start it, how to stop it and how to make it start on boot

replace `/path/to/AnipmDiscordRpc` with the real path to your project folder

#### windows

create a file called `start_rpc.bat` in the project folder with this inside:
```bat
@echo off
cd /d "%~dp0"
start "" ".venv\Scripts\pythonw.exe" discord_rpc.py
```

- **start in background:** double click `start_rpc.bat`, `pythonw` runs without a console window
- **stop:** open task manager, go to the details tab, end `pythonw.exe` or run this in a terminal (it stops every pythonw process):
  ```cmd
  taskkill /f /im pythonw.exe
  ```
- **start on boot:** press `win + r`, type `shell:startup` and press enter, then put a shortcut to `start_rpc.bat` in that folder
- **remove autostart:** delete that shortcut from the same folder

#### linux & nixos

##### quick background run (until you reboot)

```bash
nohup .venv/bin/python discord_rpc.py > rpc.log 2>&1 &
```

on nixos:
```bash
nohup nix-shell --run "python discord_rpc.py" > rpc.log 2>&1 &
```

- **check logs:** `tail -f rpc.log`
- **stop:**
  ```bash
  pkill -f discord_rpc.py
  ```

##### start on boot (systemd user service)

1. create the file `~/.config/systemd/user/anipm-rpc.service`:
   ```ini
   [Unit]
   Description=ani.pm discord rich presence
   After=graphical-session.target

   [Service]
   WorkingDirectory=/path/to/AnipmDiscordRpc
   ExecStart=/path/to/AnipmDiscordRpc/.venv/bin/python discord_rpc.py
   Restart=on-failure
   RestartSec=10

   [Install]
   WantedBy=default.target
   ```
   on nixos use this line for `ExecStart` instead:
   ```ini
   ExecStart=/run/current-system/sw/bin/nix-shell --run "python discord_rpc.py"
   ```
2. enable and start it:
   ```bash
   systemctl --user daemon-reload
   systemctl --user enable --now anipm-rpc
   ```

- **status:** `systemctl --user status anipm-rpc`
- **logs:** `journalctl --user -u anipm-rpc -f`
- **stop:** `systemctl --user stop anipm-rpc`
- **remove autostart:**
  ```bash
  systemctl --user disable --now anipm-rpc
  rm ~/.config/systemd/user/anipm-rpc.service
  systemctl --user daemon-reload
  ```

#### macos

##### quick background run (until you reboot)

```bash
nohup .venv/bin/python discord_rpc.py > rpc.log 2>&1 &
```

- **stop:** `pkill -f discord_rpc.py`

##### start on login (launch agent)

1. create the file `~/Library/LaunchAgents/com.anipm.rpc.plist`:
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
     <key>Label</key>
     <string>com.anipm.rpc</string>
     <key>ProgramArguments</key>
     <array>
       <string>/path/to/AnipmDiscordRpc/.venv/bin/python</string>
       <string>/path/to/AnipmDiscordRpc/discord_rpc.py</string>
     </array>
     <key>WorkingDirectory</key>
     <string>/path/to/AnipmDiscordRpc</string>
     <key>RunAtLoad</key>
     <true/>
     <key>KeepAlive</key>
     <true/>
   </dict>
   </plist>
   ```
2. load it:
   ```bash
   launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.anipm.rpc.plist
   ```

- **stop and remove autostart:**
  ```bash
  launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.anipm.rpc.plist
  rm ~/Library/LaunchAgents/com.anipm.rpc.plist
  ```

---

## troubleshooting

- **status not updating?** check if the python server (`discord_rpc.py`) is actively running, in a terminal or in the background
- **not sure if the background server is running?** check `pythonw.exe` in your task manager on windows, or run `ps aux | grep discord_rpc` on linux and macos
- **server exits when discord is not open yet?** start discord first, the systemd and launchd examples above also restart the server automatically
- **vencord / custom clients:** if you use vencord, turn off the built-in `arrpc` plugin in your vencord settings
- **status not visible on profile?** make sure "display current activity as a status message" is turned on under discord settings -> activity privacy


## extra pictures
 
![bleach preview](https://github.com/a1lolll/AnipmDiscordRpc/blob/main/Pictures/bleachpreview.png)
 
![genres preview](https://github.com/a1lolll/AnipmDiscordRpc/blob/main/Pictures/genrespreview.png)
 
![logo preview](https://github.com/a1lolll/AnipmDiscordRpc/blob/main/Pictures/logopreview.png)
 
![my list preview](https://github.com/a1lolll/AnipmDiscordRpc/blob/main/Pictures/mylistpreview.png)
 
![profile view](https://github.com/a1lolll/AnipmDiscordRpc/blob/main/Pictures/profileview.png)
 
![search preview](https://github.com/a1lolll/AnipmDiscordRpc/blob/main/Pictures/searchpreview.png)
