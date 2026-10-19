let updateInterval = null;
let lastVideoRef = null;

function sendUpdate() {
    if (!chrome.runtime || !chrome.runtime.id) {
        if (updateInterval) clearInterval(updateInterval);
        return;
    }

    const isTop = (window === window.top);

    if (isTop && !window.location.hostname.includes('ani.pm')) {
        return;
    }

    const video = document.querySelector('video');

    if (video && video !== lastVideoRef) {
        lastVideoRef = video;
        ['pause', 'play', 'playing', 'seeking', 'seeked', 'timeupdate', 'loadedmetadata', 'ended'].forEach(evt => {
            video.addEventListener(evt, () => {
                sendUpdate();
            });
        });
    }

    let videoData = null;
    if (video) {
        let validDuration = 0;
        if (typeof video.duration === 'number' && isFinite(video.duration) && video.duration > 30) {
            validDuration = video.duration;
        }

        videoData = {
            currentTime: video.currentTime || 0,
            duration: validDuration,
            isPaused: video.paused || video.ended
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

        const bannerElement = document.querySelector('.anime-poster-img') || 
                              document.querySelector('img[src*="cover"]') || 
                              document.querySelector('img[src*="banner"]') || 
                              document.querySelector('meta[property="og:image"]');
        
        let bannerUrl = null;
        if (bannerElement) {
            bannerUrl = bannerElement.src || bannerElement.content || null;
        }

        try {
            chrome.runtime.sendMessage({
                type: "ANI_UPDATE_TOP",
                data: {
                    title: cleanTitle,
                    episode: episodeText,
                    bannerUrl: bannerUrl,
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

updateInterval = setInterval(sendUpdate, 1500);