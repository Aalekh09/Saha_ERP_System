// Fixed Generate compact professional payment receipt
function generateReceipt(payment) {
    console.log('Generating compact professional receipt for:', payment);

    // Create compact professional receipt HTML
    const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Payment Receipt - ${payment.receiptNumber}</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.4;
                    color: #2c3e50;
                    background: #f8f9fa;
                    padding: 20px;
                    font-size: 14px;
                }
                
                .receipt-container {
                    max-width: 900px;
                    width: 100%;
                    margin: 0 auto;
                    background: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e0e0e0;
                }
                
                .receipt-container::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 6px;
                    background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);
                }
                
                .header {
                    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                    color: white;
                    padding: 25px 40px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                
                .institute-name {
                    font-size: 2.5rem;
                    font-weight: 800;
                    letter-spacing: 2px;
                    color: white;
                }
                
                .header-right {
                    text-align: right;
                }
                
                .receipt-badge {
                    background: rgba(255, 255, 255, 0.15);
                    padding: 8px 20px;
                    border-radius: 25px;
                    font-size: 1rem;
                    font-weight: 600;
                    display: inline-block;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
                
                .receipt-date {
                    font-size: 0.9rem;
                    opacity: 0.9;
                    margin-top: 8px;
                }
                
                .receipt-info {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 30px;
                    padding: 30px 40px;
                    background: #f8f9fa;
                    border-bottom: 2px solid #e9ecef;
                }
                
                .info-card {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
                    border-left: 4px solid #2c3e50;
                    text-align: center;
                }
                
                .info-label {
                    font-size: 0.8rem;
                    color: #6c757d;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 8px;
                    font-weight: 600;
                }
                
                .info-value {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: #2c3e50;
                }
                
                .receipt-number {
                    color: #2c3e50;
                    font-family: 'Courier New', monospace;
                }
                
                .payment-details {
                    padding: 30px 40px;
                }
                
                .section-title {
                    font-size: 1.3rem;
                    font-weight: 700;
                    color: #2c3e50;
                    margin-bottom: 25px;
                    text-align: center;
                    border-bottom: 2px solid #2c3e50;
                    padding-bottom: 10px;
                }
                
                .details-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px 40px;
                    margin-bottom: 30px;
                }
                
                .detail-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 20px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    border-left: 4px solid #e9ecef;
                }
                
                .detail-label {
                    font-weight: 600;
                    color: #495057;
                    font-size: 0.95rem;
                }
                
                .detail-value {
                    font-weight: 600;
                    color: #2c3e50;
                    font-size: 0.95rem;
                    text-align: right;
                }
                
                .amount-highlight {
                    background: linear-gradient(135deg, #28a745, #20c997);
                    color: white;
                    border-left-color: #28a745 !important;
                    grid-column: 1 / -1;
                    justify-content: center;
                    text-align: center;
                    font-size: 1.1rem;
                }
                
                .amount-highlight .detail-label,
                .amount-highlight .detail-value {
                    color: white;
                    font-weight: 700;
                    font-size: 1.2rem;
                }
                
                .payment-summary {
                    background: #2c3e50;
                    color: white;
                    padding: 25px 40px;
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 30px;
                    text-align: center;
                }
                
                .summary-item {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .summary-label {
                    font-size: 0.9rem;
                    opacity: 0.8;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                
                .summary-value {
                    font-size: 1.1rem;
                    font-weight: 700;
                }
                
                .footer {
                    background: #f8f9fa;
                    padding: 30px 40px;
                    border-top: 2px solid #e9ecef;
                }
                
                .footer-content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 40px;
                    align-items: center;
                }
                
                .thank-you {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #2c3e50;
                    text-align: left;
                }
                
                .generated-info {
                    text-align: right;
                    font-size: 0.8rem;
                    color: #6c757d;
                    line-height: 1.4;
                }
                
                .print-button {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 50px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    margin: 20px;
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
                    transition: all 0.3s ease;
                }
                
                .print-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
                }
                
                @media print {
                    body {
                        background: white;
                        padding: 0;
                        font-size: 13px;
                    }
                    .receipt-container {
                        box-shadow: none;
                        border-radius: 0;
                        max-width: 100%;
                        width: 100%;
                    }
                    .print-button {
                        display: none;
                    }
                    @page {
                        size: A4 landscape;
                        margin: 0.5in;
                    }
                }
                
                @media (max-width: 900px) {
                    .receipt-info {
                        grid-template-columns: 1fr;
                        gap: 15px;
                        padding: 20px;
                    }
                    
                    .payment-details {
                        padding: 20px;
                    }
                    
                    .details-grid {
                        grid-template-columns: 1fr;
                        gap: 15px;
                    }
                    
                    .payment-summary {
                        grid-template-columns: 1fr;
                        gap: 20px;
                        padding: 20px;
                    }
                    
                    .footer-content {
                        grid-template-columns: 1fr;
                        gap: 20px;
                        text-align: center;
                    }
                    
                    .generated-info {
                        text-align: center;
                    }
                }
            </style>
        </head>
        <body>
            <div class="receipt-container">
                <div class="header">
                    <div class="header-left">
                        <h1 class="institute-name">SIMT</h1>
                    </div>
                    <div class="header-right">
                        <div class="receipt-badge">Payment Receipt</div>
                        <div class="receipt-date">${new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}</div>
                    </div>
                </div>
                
                <div class="receipt-info">
                    <div class="info-card">
                        <div class="info-label">Receipt Number</div>
                        <div class="info-value receipt-number">${payment.receiptNumber}</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Payment Date</div>
                        <div class="info-value">${new Date(payment.paymentDate).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })}</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Transaction Status</div>
                        <div class="info-value" style="color: #28a745;">✓ Completed</div>
                    </div>
                </div>
                
                <div class="payment-details">
                    <h2 class="section-title">Payment Transaction Details</h2>
                    
                    <div class="details-grid">
                        <div class="detail-item">
                            <div class="detail-label">Student Name</div>
                            <div class="detail-value">${payment.student.name}</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label">Student Phone</div>
                            <div class="detail-value">${payment.student.phoneNumber || 'N/A'}</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label">Payment Method</div>
                            <div class="detail-value">${payment.paymentMethod}</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label">Description</div>
                            <div class="detail-value">${payment.description}</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label">Transaction Status</div>
                            <div class="detail-value">${payment.status || 'Completed'}</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label">Transaction ID</div>
                            <div class="detail-value">${payment.receiptNumber}</div>
                        </div>
                        
                        <div class="detail-item amount-highlight">
                            <div class="detail-label">Total Amount Paid</div>
                            <div class="detail-value">₹${parseFloat(payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                    </div>
                </div>
                
                <div class="payment-summary">
                    <div class="summary-item">
                        <div class="summary-label">Payment Status</div>
                        <div class="summary-value" style="color: #28a745;">✓ Completed</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Transaction ID</div>
                        <div class="summary-value" style="font-family: 'Courier New', monospace;">${payment.receiptNumber}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Total Amount</div>
                        <div class="summary-value">₹${parseFloat(payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                </div>
                
                <div class="footer">
                    <div class="footer-content">
                        <div class="thank-you">
                            Thank you for your payment!<br>
                            <small style="font-weight: normal; opacity: 0.8;">This is a computer-generated receipt.</small>
                        </div>
                        
                        <div class="generated-info">
                            Generated: ${new Date().toLocaleDateString('en-IN')}<br>
                            Time: ${new Date().toLocaleTimeString('en-IN')}<br>
                            System: SIMT v2.0
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="text-align: center;">
                <button class="print-button" onclick="window.print()">🖨️ Print Receipt</button>
                <button class="print-button" onclick="downloadReceipt()" style="margin-left: 10px;">💾 Download Receipt</button>
            </div>
            
            <script>
                function downloadReceipt() {
                    const receiptHTML = document.documentElement.outerHTML;
                    const blob = new Blob([receiptHTML], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'Receipt_${payment.receiptNumber}_${payment.student.name.replace(/\s+/g, '_')}.html';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }
            </script>
        </body>
        </html>
    `;

    // Open receipt in new window for viewing (no automatic download)
    const receiptWindow = window.open('', '_blank');
    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
}