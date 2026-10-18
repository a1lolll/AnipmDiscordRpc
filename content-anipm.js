let updateInterval = null;

function sendUpdate() {
    if (!chrome.runtime || !chrome.runtime.id) {
        if (updateInterval) clearInterval(updateInterval);
        return;
    }

    const isTop = (window === window.top);
    const video = document.querySelector('video');

    if (video && !video.dataset.hasRpcListeners) {
        video.dataset.hasRpcListeners = "true";
        ['pause', 'play', 'seeking', 'seeked', 'timeupdate', 'ratechange'].forEach(evt => {
            video.addEventListener(evt, () => {
                sendUpdate();
            });
        });
    }

    let videoData = null;
    if (video) {
        videoData = {
            currentTime: video.currentTime || 0,
            duration: (!isNaN(video.duration) && video.duration > 0) ? video.duration : 0,
            isPaused: video.paused
        };
    }

    if (isTop) {
        let rawTitle = document.title || '';
        let cleanTitle = rawTitle
            .replace("· ani.pm", "")
            .replace("- ani.pm", "")
            .replace("ani.pm", "")
            .trim();

        cleanTitle = cleanTitle.replace(/(?:episode|ep\.?)\s*\d+/i, "").trim();
        cleanTitle = cleanTitle.replace(/^[-:\s]+|[-:\s]+$/g, "").trim();

        if (!cleanTitle || cleanTitle.toLowerCase() === "home") return;

        let episodeText = "Watching";
        const userSelector = document.querySelector("#main > div > div > div > div > div.watch-under > div > div > div.ytw-stage > div.ytw-stage__main > div.ytw-ep-swap > h1 > span") ||
                             document.querySelector(".ytw-ep-swap h1 span") ||
                             document.querySelector(".ytw-ep-swap");
        if (userSelector && userSelector.innerText.trim()) {
            const text = userSelector.innerText.trim();
            const match = text.match(/\d+/);
            episodeText = match ? `Episode ${match[0]}` : text;
        }

        let imgUrl = "";
        const userBannerImg = document.querySelector("#main > div > div > div > div > div.watch-under > div > div > div.ytw-stage > div.ytw-expander > div.ytw-descbox.ytw-descbox--media > div.ytw-ab-art > span > img") ||
                              document.querySelector(".ytw-ab-art img") ||
                              document.querySelector(".ytw-descbox--media img");

        if (userBannerImg && userBannerImg.src) {
            imgUrl = userBannerImg.src;
        }

        try {
            chrome.runtime.sendMessage({
                type: "ANI_UPDATE_TOP",
                data: {
                    title: cleanTitle,
                    episode: episodeText,
                    imgUrl: imgUrl,
                    videoData: videoData
                }
            });
        } catch (e) {
            if (updateInterval) clearInterval(updateInterval);
        }
    } else if (videoData) {
        try {
            chrome.runtime.sendMessage({
                type: "ANI_UPDATE_VIDEO",
                data: videoData
            });
        } catch (e) {
            if (updateInterval) clearInterval(updateInterval);
        }
    }
}

updateInterval = setInterval(sendUpdate, 1000);