// Simple html2canvas fallback
function html2canvas(element, options = {}) {
    return new Promise((resolve, reject) => {
        try {
            // Create a simple canvas representation
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size
            const rect = element.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            
            // Fill with white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add a simple text representation
            ctx.fillStyle = '#333333';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Report Generated', canvas.width / 2, canvas.height / 2);
            ctx.fillText('(Offline Mode)', canvas.width / 2, canvas.height / 2 + 25);
            
            resolve(canvas);
        } catch (error) {
            reject(error);
        }
    });
}

// Make it available globally
if (typeof window !== 'undefined') {
    window.html2canvas = html2canvas;
}