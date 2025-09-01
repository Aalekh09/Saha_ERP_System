// Font Loading Manager
class FontLoader {
    constructor() {
        this.fontsToLoad = [
            {
                family: 'Inter',
                weights: ['300', '400', '500', '600', '700'],
                fallback: 'Inter-Fallback'
            },
            {
                family: 'Playfair Display',
                weights: ['400', '500', '600', '700'],
                fallback: 'Playfair-Fallback'
            },
            {
                family: 'Crimson Text',
                weights: ['400', '600'],
                fallback: 'Crimson-Fallback'
            }
        ];
        
        this.loadedFonts = new Set();
        this.failedFonts = new Set();
        this.init();
    }
    
    init() {
        // Add font loading class to body
        document.body.classList.add('font-loading');
        
        // Check if FontFace API is supported
        if ('fonts' in document) {
            this.loadFontsWithAPI();
        } else {
            this.loadFontsWithFallback();
        }
        
        // Set timeout for font loading
        setTimeout(() => {
            this.finalizeFontLoading();
        }, 3000); // 3 second timeout
    }
    
    async loadFontsWithAPI() {
        try {
            // Wait for Google Fonts to load
            await document.fonts.ready;
            
            // Check each font family
            for (const fontConfig of this.fontsToLoad) {
                const isLoaded = this.checkFontLoaded(fontConfig.family);
                
                if (isLoaded) {
                    this.loadedFonts.add(fontConfig.family);
                    console.log(`✓ Font loaded: ${fontConfig.family}`);
                } else {
                    this.failedFonts.add(fontConfig.family);
                    console.warn(`✗ Font failed to load: ${fontConfig.family}, using fallback`);
                    this.applyFallbackFont(fontConfig);
                }
            }
            
            this.finalizeFontLoading();
            
        } catch (error) {
            console.error('Error loading fonts with API:', error);
            this.loadFontsWithFallback();
        }
    }
    
    loadFontsWithFallback() {
        // Use CSS font loading detection
        const testString = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const fallbackFont = 'monospace';
        const testSize = '72px';
        
        for (const fontConfig of this.fontsToLoad) {
            if (this.detectFont(fontConfig.family, fallbackFont, testString, testSize)) {
                this.loadedFonts.add(fontConfig.family);
                console.log(`✓ Font detected: ${fontConfig.family}`);
            } else {
                this.failedFonts.add(fontConfig.family);
                console.warn(`✗ Font not detected: ${fontConfig.family}, using fallback`);
                this.applyFallbackFont(fontConfig);
            }
        }
        
        this.finalizeFontLoading();
    }
    
    checkFontLoaded(fontFamily) {
        // Create a test element
        const testElement = document.createElement('div');
        testElement.style.fontFamily = fontFamily;
        testElement.style.fontSize = '72px';
        testElement.style.position = 'absolute';
        testElement.style.left = '-9999px';
        testElement.style.top = '-9999px';
        testElement.style.visibility = 'hidden';
        testElement.textContent = 'abcdefghijklmnopqrstuvwxyz0123456789';
        
        document.body.appendChild(testElement);
        
        const width = testElement.offsetWidth;
        const height = testElement.offsetHeight;
        
        document.body.removeChild(testElement);
        
        // Check if font is loaded by comparing with fallback
        const fallbackElement = document.createElement('div');
        fallbackElement.style.fontFamily = 'monospace';
        fallbackElement.style.fontSize = '72px';
        fallbackElement.style.position = 'absolute';
        fallbackElement.style.left = '-9999px';
        fallbackElement.style.top = '-9999px';
        fallbackElement.style.visibility = 'hidden';
        fallbackElement.textContent = 'abcdefghijklmnopqrstuvwxyz0123456789';
        
        document.body.appendChild(fallbackElement);
        
        const fallbackWidth = fallbackElement.offsetWidth;
        const fallbackHeight = fallbackElement.offsetHeight;
        
        document.body.removeChild(fallbackElement);
        
        return width !== fallbackWidth || height !== fallbackHeight;
    }
    
    detectFont(fontFamily, fallbackFont, testString, testSize) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Test with fallback font
        context.font = testSize + ' ' + fallbackFont;
        const fallbackWidth = context.measureText(testString).width;
        
        // Test with target font
        context.font = testSize + ' ' + fontFamily + ', ' + fallbackFont;
        const targetWidth = context.measureText(testString).width;
        
        return fallbackWidth !== targetWidth;
    }
    
    applyFallbackFont(fontConfig) {
        // Create CSS rule for fallback
        const style = document.createElement('style');
        style.textContent = `
            .font-${fontConfig.family.replace(/\s+/g, '-').toLowerCase()}-fallback {
                font-family: ${fontConfig.fallback}, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif !important;
            }
        `;
        document.head.appendChild(style);
        
        // Apply fallback class to elements using this font
        this.applyFallbackToElements(fontConfig);
    }
    
    applyFallbackToElements(fontConfig) {
        // Find elements that might be using this font
        const elements = document.querySelectorAll('*');
        const fallbackClass = `font-${fontConfig.family.replace(/\s+/g, '-').toLowerCase()}-fallback`;
        
        elements.forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            const fontFamily = computedStyle.fontFamily;
            
            if (fontFamily.includes(fontConfig.family)) {
                element.classList.add(fallbackClass);
            }
        });
    }
    
    finalizeFontLoading() {
        // Remove loading class
        document.body.classList.remove('font-loading');
        document.body.classList.add('font-loaded');
        
        // Dispatch custom event
        const event = new CustomEvent('fontsLoaded', {
            detail: {
                loaded: Array.from(this.loadedFonts),
                failed: Array.from(this.failedFonts)
            }
        });
        
        document.dispatchEvent(event);
        
        console.log('Font loading completed:', {
            loaded: Array.from(this.loadedFonts),
            failed: Array.from(this.failedFonts)
        });
    }
    
    // Public method to check if a font is loaded
    isFontLoaded(fontFamily) {
        return this.loadedFonts.has(fontFamily);
    }
    
    // Public method to get font status
    getFontStatus() {
        return {
            loaded: Array.from(this.loadedFonts),
            failed: Array.from(this.failedFonts),
            total: this.fontsToLoad.length
        };
    }
}

// Initialize font loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.fontLoader = new FontLoader();
});

// Export for use in other scripts
window.FontLoader = FontLoader;