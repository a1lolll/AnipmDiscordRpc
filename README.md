# ani.pm discord rich presence

a simple browser extension and python ipc bridge that automatically syncs your ani.pm status to your discord profile as a "watching" status

![Ani.pm RPC Preview](https://github.com/a1lolll/AnipmDiscordRpc/blob/main/Pictures/show.png)

---

## features

- realtime video status with title, episode, watch time and total duration
- dynamic anime banner or poster on your discord profile
- customizable menu via extension popup to choose between banner or logo
- works on windows, linux, nixos and macos
- detects video status inside player iframes too
- uses proper activity type so other apps do not overwrite your status

---

## setup & installation

the system consists of two parts, the browser extension and the local rpc server (`discord_rpc.py`)

### 1. installing browser extension (chrome / brave / edge)

1. download or clone this repository to a folder on your computer
2. open your browser and go to `chrome://extensions/` or `brave://extensions/`
3. turn on **developer mode** in the top right
4. click **load unpacked** and select the folder containing these files

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

---

## troubleshooting

- **status not updating?** check if the python server (`discord_rpc.py`) is actively running in your terminal
- **vencord / custom clients:** if you use vencord, turn off the built-in `arrpc` plugin in your vencord settings
- **status not visible on profile?** make sure "display current activity as a status message" is turned on under discord settings -> activity privacy
