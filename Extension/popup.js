document.addEventListener('DOMContentLoaded', () => {
  const mainImageRadios = document.getElementsByName('mainImageType');
  const showSmallLogoCheckbox = document.getElementById('showSmallLogo');
  const githubBtn = document.getElementById('githubBtn');

  chrome.storage.local.get({ mainImageType: 'banner', showSmallLogo: true }, (settings) => {
    const radio = document.querySelector(`input[name="mainImageType"][value="${settings.mainImageType}"]`);
    if (radio) radio.checked = true;
    showSmallLogoCheckbox.checked = settings.showSmallLogo;
  });

  mainImageRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      chrome.storage.local.set({ mainImageType: e.target.value });
    });
  });

  showSmallLogoCheckbox.addEventListener('change', (e) => {
    chrome.storage.local.set({ showSmallLogo: e.target.checked });
  });

  githubBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://github.com/a1lolll/AnipmDiscordRpc' });
  });
});