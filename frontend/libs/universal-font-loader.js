// Universal Font Loading Script
// This script can be included in any HTML page to ensure proper font loading

(function() {
    'use strict';
    
    // Configuration
    const FONT_CONFIG = {
        timeout: 3000, // 3 seconds
        fallbackDelay: 1000, // 1 second before showing fallback
        fonts: [
            {
                family: 'Inter',
                weights: ['300', '400', '500', '600', '700'],
                fallback: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
            },
            {
                family: 'Playfair Display',
                weights: ['400', '500', '600', '700'],
                fallback: '"Times New Roman", Georgia, serif'
            },
            {
                family: 'Crimson Text',
                weights: ['400', '600'],
                fallback: '"Times New Roman", Georgia, serif'
            }
        ]
    };
    
    // Font loading state
    let fontsLoaded = false;
    let fallbackApplied = false;
    
    // Add loading class to body
    function addLoadingClass() {
        document.documentElement.classList.add('fonts-loading');
    }
    
    // Remove loading class and add loaded class
    function addLoadedClass() {
        document.documentElement.classList.remove('fonts-loading');
        document.documentElement.classList.add('fonts-loaded');
    }
    
    // Apply fallback fonts
    function applyFallbackFonts() {
        if (fallbackApplied) return;
        
        const style = document.createElement('style');
        style.id = 'font-fallback-styles';
        
        let css = `
            /* Universal font fallbacks */
            :root {
                --font-primary: ${FONT_CONFIG.fonts[0].fallback};
                --font-serif: ${FONT_CONFIG.fonts[1].fallback};
                --font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            }
            
            body, .font-primary {
                font-family: var(--font-primary) !important;
            }
            
            .font-serif, .serif {
                font-family: var(--font-serif) !important;
            }
            
            .font-mono, .mono, code, pre {
                font-family: var(--font-mono) !important;
            }
            
            /* Certificate specific fallbacks */
            .certificate-title,
            .certificate-main-title,
            .institute-name-new {
                font-family: var(--font-serif) !important;
            }
        `;
        
        style.textContent = css;
        document.head.appendChild(style);
        
        fallbackApplied = true;
        console.log('Font fallbacks applied');
    }
    
    // Check if fonts are loaded using FontFace API
    async function checkFontsWithAPI() {
        if (!('fonts' in document)) {
            return false;
        }
        
        try {
            await document.fonts.ready;
            
            // Check each font family
            for (const fontConfig of FONT_CONFIG.fonts) {
                const isLoaded = document.fonts.check(`16px "${fontConfig.family}"`);
                if (!isLoaded) {
                    console.log(`Font not loaded: ${fontConfig.family}`);
                    return false;
                }
            }
            
            return true;
        } catch (error) {
            console.log('FontFace API check failed:', error);
            return false;
        }
    }
    
    // Fallback font detection using canvas
    function detectFontWithCanvas(fontFamily) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const testString = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const testSize = '72px';
        const fallbackFont = 'monospace';
        
        // Test with fallback font
        context.font = `${testSize} ${fallbackFont}`;
        const fallbackWidth = context.measureText(testString).width;
        
        // Test with target font
        context.font = `${testSize} "${fontFamily}", ${fallbackFont}`;
        const targetWidth = context.measureText(testString).width;
        
        return fallbackWidth !== targetWidth;
    }
    
    // Main font loading function
    async function loadFonts() {
        addLoadingClass();
        
        // Set fallback timeout
        const fallbackTimeout = setTimeout(() => {
            if (!fontsLoaded) {
                console.log('Font loading timeout, applying fallbacks');
                applyFallbackFonts();
                addLoadedClass();
            }
        }, FONT_CONFIG.timeout);
        
        try {
            // Try FontFace API first
            const apiSuccess = await checkFontsWithAPI();
            
            if (apiSuccess) {
                console.log('Fonts loaded successfully via FontFace API');
                fontsLoaded = true;
                clearTimeout(fallbackTimeout);
                addLoadedClass();
                return;
            }
            
            // Fallback to canvas detection
            let allFontsLoaded = true;
            for (const fontConfig of FONT_CONFIG.fonts) {
                const isLoaded = detectFontWithCanvas(fontConfig.family);
                if (!isLoaded) {
                    console.log(`Font not detected: ${fontConfig.family}`);
                    allFontsLoaded = false;
                }
            }
            
            if (allFontsLoaded) {
                console.log('Fonts detected successfully via canvas method');
                fontsLoaded = true;
                clearTimeout(fallbackTimeout);
                addLoadedClass();
            } else {
                console.log('Some fonts not detected, applying fallbacks');
                applyFallbackFonts();
                clearTimeout(fallbackTimeout);
                addLoadedClass();
            }
            
        } catch (error) {
            console.log('Font loading error:', error);
            applyFallbackFonts();
            clearTimeout(fallbackTimeout);
            addLoadedClass();
        }
    }
    
    // Initialize when DOM is ready
    function initialize() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadFonts);
        } else {
            loadFonts();
        }
    }
    
    // Public API
    window.UniversalFontLoader = {
        load: loadFonts,
        applyFallbacks: applyFallbackFonts,
        isLoaded: () => fontsLoaded,
        hasFallback: () => fallbackApplied
    };
    
    // Auto-initialize
    initialize();
    
})();

// Add CSS for loading states
const loadingCSS = `
    .fonts-loading {
        visibility: hidden;
    }
    
    .fonts-loading body {
        visibility: visible;
        opacity: 0.8;
    }
    
    .fonts-loaded {
        visibility: visible;
    }
    
    .fonts-loaded body {
        opacity: 1;
        transition: opacity 0.3s ease;
    }
`;

// Inject loading CSS
const style = document.createElement('style');
style.textContent = loadingCSS;
document.head.appendChild(style);