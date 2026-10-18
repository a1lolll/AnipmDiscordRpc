const GITHUB_IMAGE_URL = "https://github.com/a1lolll/AnipmDiscordRpc/blob/main/AnipmLogo.png?raw=true";

let socket = null;
let heartbeatInterval = null;
let pendingActivity = null;

let latestPageData = null;
let latestVideoData = null;
let lastSentActivityJson = "";

function formatDiscordImage(url) {
    if (GITHUB_IMAGE_URL && GITHUB_IMAGE_URL.startsWith('http')) {
        return GITHUB_IMAGE_URL;
    }
    if (url && typeof url === 'string' && url.startsWith('http')) {
        return url;
    }
    return "logo";
}

function connectGateway(token, activity) {
    pendingActivity = activity;

    if (socket && socket.readyState === WebSocket.OPEN) {
        sendPresenceUpdate(activity);
        return;
    }

    if (socket && socket.readyState === WebSocket.CONNECTING) {
        return;
    }

    if (socket) {
        socket.close();
    }

    socket = new WebSocket('wss://gateway.discord.gg/?v=9&encoding=json');

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.op === 10) {
            const interval = data.d.heartbeat_interval;
            clearInterval(heartbeatInterval);
            heartbeatInterval = setInterval(() => {
                if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ op: 1, d: null }));
                }
            }, interval);

            socket.send(JSON.stringify({
                op: 2,
                d: {
                    token: token,
                    capabilities: 8189,
                    properties: {
                        os: "Windows",
                        browser: "Chrome",
                        device: "Chrome"
                    }
                }
            }));
        }

        if (data.t === 'READY') {
            if (pendingActivity) {
                sendPresenceUpdate(pendingActivity);
            }
        }
    };

    socket.onclose = () => {
        clearInterval(heartbeatInterval);
        socket = null;
    };

    socket.onerror = (err) => {
        console.error("Gateway Error:", err);
    };
}

function sendPresenceUpdate(activity) {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(JSON.stringify({
        op: 3,
        d: {
            since: null,
            activities: activity ? [activity] : [],
            status: "online",
            afk: false
        }
    }));
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "ANI_UPDATE_TOP") {
        latestPageData = message.data;
        updatePresence();
    } else if (message.type === "ANI_UPDATE_VIDEO") {
        latestVideoData = message.data;
        updatePresence();
    }
});

function updatePresence() {
    if (!latestPageData) return;

    chrome.storage.local.get(['discordToken', 'extensionEnabled'], (data) => {
        const token = data.discordToken;
        const isEnabled = data.extensionEnabled !== false;

        if (!isEnabled || !token) return;

        const title = latestPageData.title;
        let episode = latestPageData.episode;

        const activeVideo = latestVideoData || latestPageData.videoData;

        const currentTime = activeVideo ? activeVideo.currentTime : 0;
        const duration = activeVideo ? activeVideo.duration : 0;
        const isPaused = activeVideo ? activeVideo.isPaused : false;

        if (isPaused) {
            if (episode && !episode.includes("(Paused)")) {
                episode = `${episode} (Paused)`;
            }
        } else {
            episode = episode.replace(/\s*\(Paused\)/gi, "").trim();
        }

        const now = Date.now();
        const activity = {
            name: "ani.pm",
            type: 3,
            details: title,
            state: episode,
            application_id: "1561512577966538842",
            assets: {
                large_image: formatDiscordImage(latestPageData.imgUrl),
                large_text: title
            }
        };

        if (!isPaused && duration > 0) {
            activity.timestamps = {
                start: Math.floor(now - (currentTime * 1000)),
                end: Math.floor(now + ((duration - currentTime) * 1000))
            };
        } else if (!isPaused && currentTime > 0) {
            activity.timestamps = {
                start: Math.floor(now - (currentTime * 1000))
            };
        }

        const checkObj = {
            title: title,
            episode: episode,
            isPaused: isPaused,
            start: activity.timestamps?.start || 0,
            end: activity.timestamps?.end || 0,
            img: activity.assets.large_image
        };
        const currentJson = JSON.stringify(checkObj);

        if (currentJson === lastSentActivityJson && socket && socket.readyState === WebSocket.OPEN) {
            return;
        }
        lastSentActivityJson = currentJson;

        connectGateway(token, activity);
    });
}
