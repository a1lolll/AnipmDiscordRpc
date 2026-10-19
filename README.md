# ani.pm discord rich presence

a simple browser extension and python ipc bridge that automatically syncs your ani.pm status to your discord profile as a "watching" status

![Ani.pm RPC Preview](https://github.com/a1lolll/AnipmDiscordRpc/blob/main/Pictures/show.png)

---
## ani.pm info

 - [website](https://ani.pm)
 - [discord](discord.gg/anipm)


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

make sure python 3.8 or higher is installed on your system and that discord is open

only run one copy of the server at a time, it uses port `6969` and a second copy will fail to start

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

if you use a flatpak or snap version of discord, update pypresence with `pip install -U pypresence`

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
nohup .venv/bin/python -u discord_rpc.py > rpc.log 2>&1 &
```

on nixos:
```bash
nohup nix-shell --run "python -u discord_rpc.py" > rpc.log 2>&1 &
```

- **check logs:** `tail -f rpc.log`
- **check if it runs:** `pgrep -af discord_rpc`
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
   ExecStart=/path/to/AnipmDiscordRpc/.venv/bin/python -u discord_rpc.py
   Restart=on-failure
   RestartSec=10

   [Install]
   WantedBy=default.target
   ```
   on nixos use this line for `ExecStart` instead:
   ```ini
   ExecStart=/run/current-system/sw/bin/nix-shell --run "python -u discord_rpc.py"
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
nohup .venv/bin/python -u discord_rpc.py > rpc.log 2>&1 &
```

- **check logs:** `tail -f rpc.log`
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
       <string>-u</string>
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

### 4. logs & debug mode

by default the server is quiet, it only prints a start line and errors, so a short log is normal

to see what is going on, turn on debug mode with the `RPC_DEBUG` variable, then you will see every request from the extension, when it connects to discord and every status update

#### windows (cmd)
```cmd
set RPC_DEBUG=1
python discord_rpc.py
```

#### windows (powershell)
```powershell
$env:RPC_DEBUG = "1"
python discord_rpc.py
```

#### linux & macos
```bash
RPC_DEBUG=1 python discord_rpc.py
```

#### nixos
```bash
RPC_DEBUG=1 nix-shell --run "python discord_rpc.py"
```

#### in the background
```bash
pkill -f discord_rpc.py
RPC_DEBUG=1 nohup nix-shell --run "python -u discord_rpc.py" > rpc.log 2>&1 &
tail -f rpc.log
```

for a systemd service add `Environment=RPC_DEBUG=1` under `[Service]`, for a launch agent add `RPC_DEBUG` with value `1` under an `EnvironmentVariables` key

debug mode also turns on the flask debugger, so only use it while testing and leave it off otherwise

---

## troubleshooting

- **status not updating?** check if the python server (`discord_rpc.py`) is actively running, in a terminal or in the background, then turn on debug mode and watch the log while you play a video
- **no `POST /update` lines in the debug log?** the extension is not reaching the server, reload the extension on `chrome://extensions/` and refresh your ani.pm tab
- **log shows "could not find discord"?** open discord, the server keeps running and connects on the next update, you dont have to restart it
- **server fails with "address already in use"?** another copy is already running, check with `pgrep -af discord_rpc` on linux and macos or in the task manager on windows, stop it and start again
- **not sure if the background server is running?** check `pythonw.exe` in your task manager on windows, or run `pgrep -af discord_rpc` on linux and macos
- **vencord / custom clients:** if you use vencord, turn off the built-in `arrpc` plugin in your vencord settings
- **status not visible on profile?** make sure "display current activity as a status message" is turned on under discord settings -> activity privacy

---
#creator
my discord user is; barkbarkdoggy
if u have any questions feel free to send a friend request

## extra pictures

![bleach preview](https://github.com/a1lolll/AnipmDiscordRpc/blob/main/Pictures/bleachpreview.png)

![genres preview](https://github.com/a1lolll/AnipmDiscordRpc/blob/main/Pictures/genrespreview.png)

![logo preview](https://github.com/a1lolll/AnipmDiscordRpc/blob/main/Pictures/logopreview.png)

![my list preview](https://github.com/a1lolll/AnipmDiscordRpc/blob/main/Pictures/mylistpreview.png)

![profile view](https://github.com/a1lolll/AnipmDiscordRpc/blob/main/Pictures/profileview.png)

![search preview](https://github.com/a1lolll/AnipmDiscordRpc/blob/main/Pictures/searchpreview.png)
