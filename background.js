// Track which tabs have been initialized
let initializedTabs = new Set();

// Function to check if a URL is a Search Console URL
function isSearchConsoleUrl(url) {
  return url?.includes('search-console') || url?.includes('resource_id=');
}

// Function to reinject script
async function reinjectScript(tabId) {
  console.log('[Tab Renamer] Reinjecting script into tab', tabId);
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    });
  } catch (e) {
    console.error('[Tab Renamer] Error injecting script:', e);
  }
}

// Handle URL/navigation changes
chrome.webNavigation.onHistoryStateUpdated.addListener(async (details) => {
  if (isSearchConsoleUrl(details.url)) {
    console.log('[Tab Renamer] History state updated:', details);
    await reinjectScript(details.tabId);
  }
});

// Handle new tabs and refreshes
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (isSearchConsoleUrl(tab.url)) {
    console.log('[Tab Renamer] Tab updated:', { tabId, changeInfo, url: tab.url });
    
    if (changeInfo.status === 'complete' && !initializedTabs.has(tabId)) {
      initializedTabs.add(tabId);
      await reinjectScript(tabId);
    }
    
    // Also handle URL changes
    if (changeInfo.url) {
      await reinjectScript(tabId);
    }
  }
});

// Clean up closed tabs
chrome.tabs.onRemoved.addListener((tabId) => {
  initializedTabs.delete(tabId);
});

console.log('[Tab Renamer] Background script loaded');
