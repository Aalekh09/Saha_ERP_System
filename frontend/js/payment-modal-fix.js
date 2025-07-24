// Simple payment modal functionality
console.log('Payment modal fix loaded');

// Simple modal handlers
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing simple payment modal...');
    
    // Add event listeners to buttons
    const addPaymentBtn = document.getElementById('addPaymentBtn');
    if (addPaymentBtn) {
        addPaymentBtn.addEventListener('click', function() {
            const modal = document.getElementById('addPaymentModal');
            if (modal) {
                modal.style.display = 'block';
            }
        });
    }
    
    // Close modal handlers
    const closeBtn = document.getElementById('closeAddPaymentModalBtn');
    const cancelBtn = document.getElementById('cancelPaymentBtn');
    
    [closeBtn, cancelBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function() {
                const modal = document.getElementById('addPaymentModal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        }
    });
    
    console.log('Simple payment modal initialized');
});