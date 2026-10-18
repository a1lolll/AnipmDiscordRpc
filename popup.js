document.addEventListener('DOMContentLoaded', () => {
    const tokenInput = document.getElementById('token');
    const enabledCheckbox = document.getElementById('enabled');
    const statusDiv = document.getElementById('status');

    chrome.storage.local.get(['discordToken', 'extensionEnabled'], (data) => {
        if (data.discordToken) tokenInput.value = data.discordToken;
        if (data.extensionEnabled !== undefined) enabledCheckbox.checked = data.extensionEnabled;
    });

    function saveSettings() {
        chrome.storage.local.set({
            discordToken: tokenInput.value.trim(),
            extensionEnabled: enabledCheckbox.checked
        }, () => {
            statusDiv.style.display = 'block';
            setTimeout(() => { statusDiv.style.display = 'none'; }, 1500);
        });
    }

    tokenInput.addEventListener('input', saveSettings);
    enabledCheckbox.addEventListener('change', saveSettings);
});
