const toggle = document.getElementById("toggle");

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
	chrome.storage.local.get("kibaco-dark", (result) => {
		toggle.checked = result["kibaco-dark"] === true;
	});

	toggle.addEventListener("change", () => {
		const enabled = toggle.checked;
		chrome.storage.local.set({ "kibaco-dark": enabled });
		chrome.tabs.sendMessage(tab.id, { action: "toggle-dark-mode", enabled });
	});
});
