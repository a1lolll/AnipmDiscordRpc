chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "UPDATE_DISCORD") {
        updateDiscordStatus(message.text);
    }
});

function updateDiscordStatus(newStatus) {
    let token = null;

    try {
        if (window.webpackChunkdiscord_app) {
            const chunk = window.webpackChunkdiscord_app.push([
                [Symbol()], 
                {}, 
                (e) => Object.values(e.c).find((e) => e.exports?.default?.getToken !== void 0)
            ]);
            if (chunk && chunk.exports?.default?.getToken) {
                token = chunk.exports.default.getToken();
            }
        }
    } catch (e) {
        console.error("Could not fetch token from webpack:", e);
    }

    if (!token) {
        token = localStorage.getItem('token')?.replace(/"/g, '');
    }


    if (!token) return;

    fetch('https://discord.com', {
        method: 'PATCH',
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            custom_status: {
                text: newStatus,
                expires_at: null
            }
        })
    }).catch(err => console.error("Error updating Discord status:", err));
}
