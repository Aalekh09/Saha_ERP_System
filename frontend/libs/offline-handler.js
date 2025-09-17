// Offline detection and handling
class OfflineHandler {
    constructor() {
        this.isOnline = navigator.onLine;
        this.applyCacheBusting();
        this.init();
    }

    init() {
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showOnlineStatus();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showOfflineStatus();
        });

        // Show initial status
        if (!this.isOnline) {
            this.showOfflineStatus();
        }
    }

    showOfflineStatus() {
        this.showNetworkStatus('You are currently offline. Some features may not work.', 'offline');
    }

    showOnlineStatus() {
        this.showNetworkStatus('Connection restored!', 'online');
        // Auto-hide after 3 seconds
        setTimeout(() => {
            this.hideNetworkStatus();
        }, 3000);
    }

    showNetworkStatus(message, type) {
        // Remove existing status
        this.hideNetworkStatus();

        const statusDiv = document.createElement('div');
        statusDiv.id = 'network-status';
        statusDiv.className = `network-status ${type}`;
        statusDiv.innerHTML = `
            <span>${message}</span>
            <button onclick="offlineHandler.hideNetworkStatus()" style="margin-left: 10px; background: none; border: none; color: inherit; cursor: pointer;">×</button>
        `;

        document.body.appendChild(statusDiv);
    }

    hideNetworkStatus() {
        const existing = document.getElementById('network-status');
        if (existing) {
            existing.remove();
        }
    }

    // Check if we can reach the server
    async checkServerConnection() {
        try {
            const response = await fetch('http://localhost:4455/api/health', {
                method: 'HEAD',
                timeout: 5000
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    // Add a light cache-busting layer for static assets to avoid stale caches
    applyCacheBusting() {
        try {
            const stored = localStorage.getItem('app_version');
            const current = stored || String(Date.now());
            if (!stored) localStorage.setItem('app_version', current);

            const originalFetch = window.fetch;
            window.fetch = function(input, init) {
                try {
                    const bust = (urlStr) => {
                        const u = new URL(urlStr, window.location.origin);
                        if (u.origin === window.location.origin && /\.(css|js|png|jpg|jpeg|svg|ico|html)$/i.test(u.pathname)) {
                            u.searchParams.set('v', current);
                            return u.toString();
                        }
                        return urlStr;
                    };
                    if (typeof input === 'string') {
                        input = bust(input);
                    } else if (input && input.url) {
                        input = new Request(bust(input.url), input);
                    }
                } catch (e) { /* ignore */ }
                return originalFetch.call(this, input, init);
            };
        } catch (e) {
            // ignore
        }
    }
}

// Initialize offline handler
const offlineHandler = new OfflineHandler();