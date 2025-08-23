// Font Awesome fallback detection and activation
(function () {
    // Function to check if Font Awesome is loaded
    function isFontAwesomeLoaded() {
        // Create a test element with Font Awesome class
        const testElement = document.createElement('i');
        testElement.className = 'fas fa-home';
        testElement.style.position = 'absolute';
        testElement.style.left = '-9999px';
        testElement.style.fontSize = '16px';
        document.body.appendChild(testElement);

        // Get computed styles
        const computedStyle = window.getComputedStyle(testElement, ':before');
        const content = computedStyle.getPropertyValue('content');

        // Clean up
        document.body.removeChild(testElement);

        // Font Awesome icons have specific Unicode content
        // If content is 'none' or empty, Font Awesome didn't load
        return content && content !== 'none' && content !== '""' && content.length > 2;
    }

    // Function to activate fallback icons
    function activateFallback() {
        console.log('Font Awesome failed to load, activating fallback icons');
        document.body.classList.add('fa-fallback');

        // Load fallback CSS
        const fallbackLink = document.createElement('link');
        fallbackLink.rel = 'stylesheet';
        fallbackLink.href = 'libs/fallback-icons.css';
        document.head.appendChild(fallbackLink);
    }

    // Check Font Awesome loading after page loads
    function checkFontAwesome() {
        if (!isFontAwesomeLoaded()) {
            activateFallback();
        }
    }

    // Check when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            // Wait a bit for CSS to load
            setTimeout(checkFontAwesome, 500);
        });
    } else {
        setTimeout(checkFontAwesome, 500);
    }

    // Also listen for CSS load errors
    const fontAwesomeLink = document.getElementById('font-awesome-css');
    if (fontAwesomeLink) {
        fontAwesomeLink.addEventListener('error', activateFallback);
    }
})();