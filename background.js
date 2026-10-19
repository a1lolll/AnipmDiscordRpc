let state = {
    title: "",
    episode: "Watching",
    bannerUrl: null,
    videoData: null
};

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "ANI_UPDATE_TOP") {
        if (state.episode !== message.data.episode || state.title !== message.data.title) {
            state.videoData = null;
        }
        state.title = message.data.title;
        state.episode = message.data.episode;
        state.bannerUrl = message.data.bannerUrl;
        if (message.data.videoData) {
            state.videoData = message.data.videoData;
        }
        sendToRPC();
    } else if (message.type === "ANI_UPDATE_VIDEO") {
        state.videoData = message.data;
        sendToRPC();
    }
});

function sendToRPC() {
    if (!state.title) return;

    chrome.storage.local.get({ mainImageType: 'banner', showSmallLogo: true }, (settings) => {
        const largeImage = (settings.mainImageType === 'banner' && state.bannerUrl) ? state.bannerUrl : "logo";
        const smallImage = settings.showSmallLogo ? "logo" : null;

        const payload = {
            title: state.title,
            episode: state.episode,
            isPaused: state.videoData ? state.videoData.isPaused : true,
            currentTime: state.videoData ? state.videoData.currentTime : 0,
            duration: state.videoData ? state.videoData.duration : 0,
            largeImage: largeImage,
            smallImage: smallImage
        };

        fetch("http://127.0.0.1:6969/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        }).catch(() => {});
    });
}
