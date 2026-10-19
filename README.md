# ani.pm discord rich presence

een simpele browser extensie en python ipc bridge die automatisch je ani.pm status synced naar je discord profiel als een "watching" status

![Ani.pm RPC Preview](https://github.com/a1lolll/AnipmDiscordRpc/blob/main/Pictures/show.png)

---

## features

- realtime video status met titel, aflevering, afspeeltijd en totale duur
- dynamische anime banner of poster op je discord profiel
- aanpasbaar menu via de extensie popup om te kiezen tussen banner of logo
- werkt op windows, linux, nixos en macos
- detecteert video status ook binnen player iframes
- gebruikt de juiste activity type zodat andere apps je status niet overschrijven

---

## setup & installatie

het systeem bestaat uit twee delen, de browser extensie en de lokale rpc server (`discord_rpc.py`)

### 1. browser extensie installeren (chrome / brave / edge)

1. download of clone deze repository naar een map op je computer
2. open je browser en ga naar `chrome://extensions/` of `brave://extensions/`
3. zet **ontwikkelaarsmodus** (developer mode) aan rechtsboven
4. klik op **uitgepakte extensie laden** (load unpacked) en kies de map met deze bestanden

---

### 2. python rpc server opstarten

zorg dat python 3.8 of hoger geïnstalleerd is op je systeem

#### windows
1. open opdrachtenprompt of powershell in de projectmap
2. maak en activeer een virtuele omgeving:
   ```cmd
   python -m venv .venv
   .venv\Scripts\activate
   ```
3. installeer de benodigde packages:
   ```cmd
   pip install flask flask-cors pypresence
   ```
4. start de rpc server:
   ```cmd
   python discord_rpc.py
   ```

#### linux (ubuntu / debian / arch / fedora) & macos
1. open de terminal in de projectmap
2. maak en activeer een virtuele omgeving:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. installeer de benodigde packages:
   ```bash
   pip install flask flask-cors pypresence
   ```
4. start de rpc server:
   ```bash
   python discord_rpc.py
   ```

#### nixos
start de server direct via nix-shell:
```bash
nix-shell --run "python discord_rpc.py"
```

---

## troubleshooting

- **status update niet?** controleer of de python server (`discord_rpc.py`) actief draait in je terminal
- **vencord / custom clients:** als je vencord gebruikt, zet dan de ingebouwde `arrpc` plugin uit in je vencord instellingen
- **status niet zichtbaar op profiel?** zorg dat "huidige activiteit als statusbericht weergeven" aan staat onder discord instellingen -> activiteitsprivacy
