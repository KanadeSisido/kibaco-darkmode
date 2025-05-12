let styleTag;
let iframeStyleObserver;

function applyDarkMode(enabled) {
	const iframes = document.querySelectorAll("iframe.portletMainIframe");

	if (enabled) {
		// ページ全体にダークモードを適用
		if (!styleTag) {
			styleTag = document.createElement("link");
			styleTag.rel = "stylesheet";
			styleTag.href = chrome.runtime.getURL("darktheme.css");
			document.head.appendChild(styleTag);
		}

		// すべてのiframeにダークモードを適用
		iframes.forEach((iframe) => {
			try {
				const iframeDoc =
					iframe.contentDocument || iframe.contentWindow.document;
				if (iframeDoc && iframeDoc.head) {
					// すでにLinkがあるか
					const existingLink = iframeDoc.head.querySelector(
						'link[href$="darktheme.css"]'
					);
					if (!existingLink) {
						const link = iframeDoc.createElement("link");
						link.rel = "stylesheet";
						link.type = "text/css";
						link.href = chrome.runtime.getURL("darktheme.css");
						iframeDoc.head.appendChild(link);
					}
				}
			} catch (e) {
				console.warn("iframe スタイル適用エラー:", e);
			}
		});

		// 新しいiframeの監視を開始
		if (!iframeStyleObserver) {
			iframeStyleObserver = new MutationObserver((mutations) => {
				mutations.forEach((mutation) => {
					mutation.addedNodes.forEach((node) => {
						if (
							node.tagName === "IFRAME" &&
							node.classList.contains("portletMainIframe")
						) {
							try {
								const iframeDoc =
									node.contentDocument || node.contentWindow.document;
								if (iframeDoc && iframeDoc.head) {
									const link = iframeDoc.createElement("link");
									link.rel = "stylesheet";
									link.type = "text/css";
									link.href = chrome.runtime.getURL("darktheme.css");
									iframeDoc.head.appendChild(link);
								}
							} catch (e) {
								console.warn("新規iframe スタイル適用エラー:", e);
							}
						}
					});
				});
			});

			iframeStyleObserver.observe(document.body, {
				childList: true,
				subtree: true,
			});
		}
	} else {
		// ダークモードを無効化
		if (styleTag) {
			styleTag.remove();
			styleTag = null;
		}

		// すべてのiframeからダークモードのスタイルを削除
		iframes.forEach((iframe) => {
			try {
				const iframeDoc =
					iframe.contentDocument || iframe.contentWindow.document;
				if (iframeDoc && iframeDoc.head) {
					const existingLink = iframeDoc.head.querySelector(
						'link[href$="darktheme.css"]'
					);
					if (existingLink) {
						existingLink.remove();
					}
				}
			} catch (e) {
				console.warn("iframe スタイル削除エラー:", e);
			}
		});

		// iframe監視を停止
		if (iframeStyleObserver) {
			iframeStyleObserver.disconnect();
			iframeStyleObserver = null;
		}
	}
}

// メッセージ受信
chrome.runtime.onMessage.addListener((message) => {
	if (message.action === "toggle-dark-mode") {
		applyDarkMode(message.enabled);
	}
});

// 初回ロード時
chrome.storage.local.get("kibaco-dark", (result) => {
	applyDarkMode(result["kibaco-dark"] === true);
});

// 初期実行
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => {
		chrome.storage.local.get("kibaco-dark", (result) => {
			applyDarkMode(result["kibaco-dark"] === true);
		});
	});
}
