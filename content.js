// Flag to indicate script is loaded
window.searchConsoleTabRenamerLoaded = true;

// Function to get property name from URL
function extractDomain(url) {
    try {
        // Try resource_id parameter first
        const params = new URLSearchParams(new URL(url).search);
        const resourceId = params.get('resource_id');
        
        if (resourceId) {
            console.log('[Tab Renamer] Found resource_id:', resourceId);
            const decoded = decodeURIComponent(resourceId);
            const cleanDomain = decoded
                .replace('sc-domain:', '')
                .replace('https://', '')
                .replace('http://', '')
                .replace('www.', '')
                .replace(/\/$/, '')  // Remove trailing slash
                .replace(/:\d+$/, ''); // Remove port if present
            console.log('[Tab Renamer] Cleaned domain:', cleanDomain);
            return cleanDomain;
        }
        
        // Fallback: Try to find domain input in the DOM
        const domainInput = document.querySelector('input[jsname="YPqjbf"]');
        if (domainInput?.value) {
            console.log('[Tab Renamer] Found domain from input:', domainInput.value);
            return domainInput.value
                .replace('www.', '')
                .replace(/\/$/, '');
        }
        
        console.log('[Tab Renamer] No domain found');
        return null;
    } catch (e) {
        console.error('[Tab Renamer] Error extracting domain:', e);
        return null;
    }
}

// Function to update the title
function updateTitle() {
    console.log('[Tab Renamer] Updating title...');
    const domain = extractDomain(window.location.href);
    if (!domain) {
        console.log('[Tab Renamer] No domain found, skipping update');
        return;
    }

    // Get the current section name (everything before " - " in the title)
    const currentTitle = document.title;
    const pageName = currentTitle.split(' - ')[0] || 'Search Console';
    const newTitle = `${pageName} - ${domain}`;
    
    console.log('[Tab Renamer] Current title:', currentTitle);
    console.log('[Tab Renamer] New title:', newTitle);
    
    if (currentTitle !== newTitle) {
        document.title = newTitle;
        console.log('[Tab Renamer] Title updated successfully');
    } else {
        console.log('[Tab Renamer] Title already correct');
    }
}

// Create an observer instance
console.log('[Tab Renamer] Setting up mutation observer...');
const observer = new MutationObserver((mutations) => {
    if (mutations.some(mutation => 
        mutation.target.nodeName === 'TITLE' ||
        mutation.addedNodes.length > 0 ||
        mutation.type === 'characterData'
    )) {
        updateTitle();
    }
});

// Start observing title changes
try {
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        characterData: true
    });
    console.log('[Tab Renamer] Observer started successfully');
} catch (e) {
    console.error('[Tab Renamer] Error starting observer:', e);
}

// Initial update with retry mechanism
function initialUpdate(retryCount = 0) {
    console.log(`[Tab Renamer] Attempting initial update (retry ${retryCount})`);
    if (retryCount > 5) {
        console.log('[Tab Renamer] Max retries reached');
        return;
    }
    
    if (!document.title) {
        console.log('[Tab Renamer] No title yet, retrying...');
        setTimeout(() => initialUpdate(retryCount + 1), 200);
    } else {
        updateTitle();
    }
}

// Monitor URL changes
let lastUrl = location.href;
setInterval(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
        console.log('[Tab Renamer] URL changed');
        lastUrl = currentUrl;
        setTimeout(updateTitle, 500);
    }
}, 1000);

// Start initial update after a delay
console.log('[Tab Renamer] Starting initial update...');
setTimeout(() => initialUpdate(), 1000);

console.log('[Tab Renamer] Content script fully loaded');
