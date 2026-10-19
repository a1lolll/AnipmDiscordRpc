const DEFAULTS = { mainImageType: 'banner', showSmallLogo: true };
const IMAGE_TYPES = ['banner', 'logo'];
const REPO_URL = 'https://github.com/xvvvyyy/AnipmDiscordRpc';
const SITE_URL = 'https://a1lolll.github.io/';

document.addEventListener('DOMContentLoaded', () => {
  const imageRadios = document.querySelectorAll('input[name="mainImageType"]');
  const badgeToggle = document.getElementById('showSmallLogo');
  const githubBtn = document.getElementById('githubBtn');
  const siteBtn = document.getElementById('siteBtn');

  chrome.storage.local.get(DEFAULTS, (stored) => {
    const type = IMAGE_TYPES.includes(stored.mainImageType)
      ? stored.mainImageType
      : DEFAULTS.mainImageType;

    imageRadios.forEach((radio) => {
      radio.checked = radio.value === type;
    });
    badgeToggle.checked = Boolean(stored.showSmallLogo);
  });

  imageRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      if (radio.checked) chrome.storage.local.set({ mainImageType: radio.value });
    });
  });

  badgeToggle.addEventListener('change', () => {
    chrome.storage.local.set({ showSmallLogo: badgeToggle.checked });
  });

  githubBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: REPO_URL });
  });

  siteBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: SITE_URL });
  });
});
