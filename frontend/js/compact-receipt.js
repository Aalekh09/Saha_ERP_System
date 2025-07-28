// Compact Professional Payment Receipt Generator
function generateCompactReceipt(payment) {
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
                    padding: 15px;
                    font-size: 13px;
                }
                
                .receipt-container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: #ffffff;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                    border: 2px solid #667eea;
                }
                
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 20px;
                    text-align: center;
                }
                
                .institute-logo {
                    width: 50px;
                    height: 50px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    margin: 0 auto 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    font-weight: bold;
                }
                
                .institute-name {
                    font-size: 1.4rem;
                    font-weight: 700;
                    margin-bottom: 4px;
                }
                
                .institute-address {
                    font-size: 0.8rem;
                    opacity: 0.9;
                    margin-bottom: 12px;
                }
                
                .receipt-badge {
                    background: rgba(255, 255, 255, 0.2);
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    display: inline-block;
                }
                
                .receipt-meta {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    padding: 20px;
                    background: #f8f9fa;
                    border-bottom: 1px solid #e9ecef;
                }
                
                .meta-card {
                    background: white;
                    padding: 15px;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                    border-left: 3px solid #667eea;
                }
                
                .meta-label {
                    font-size: 0.75rem;
                    color: #6c757d;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                    font-weight: 600;
                }
                
                .meta-value {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #2c3e50;
                }
                
                .receipt-number {
                    color: #667eea;
                    font-family: 'Courier New', monospace;
                }
                
                .payment-details {
                    padding: 20px;
                }
                
                .section-title {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #2c3e50;
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    border-bottom: 2px solid #667eea;
                    padding-bottom: 8px;
                }
                
                .details-grid {
                    display: grid;
                    gap: 12px;
                }
                
                .detail-item {
                    display: grid;
                    grid-template-columns: 140px 1fr;
                    gap: 15px;
                    padding: 12px;
                    background: #f8f9fa;
                    border-radius: 6px;
                    border-left: 3px solid #e9ecef;
                }
                
                .detail-label {
                    font-weight: 600;
                    color: #495057;
                    font-size: 0.85rem;
                }
                
                .detail-value {
                    font-weight: 500;
                    color: #2c3e50;
                    font-size: 0.9rem;
                }
                
                .amount-highlight {
                    background: linear-gradient(135deg, #28a745, #20c997);
                    color: white;
                    border-left-color: #28a745 !important;
                }
                
                .amount-highlight .detail-label,
                .amount-highlight .detail-value {
                    color: white;
                    font-weight: 700;
                }
                
                .amount-highlight .detail-value {
                    font-size: 1.1rem;
                }
                
                .payment-summary {
                    background: #f8f9fa;
                    padding: 15px 20px;
                    border-top: 1px solid #dee2e6;
                }
                
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;
                    border-bottom: 1px solid #dee2e6;
                    font-size: 0.9rem;
                }
                
                .summary-row:last-child {
                    border-bottom: none;
                    font-size: 1rem;
                    font-weight: 700;
                    color: #28a745;
                    margin-top: 8px;
                    padding-top: 12px;
                    border-top: 2px solid #28a745;
                }
                
                .footer {
                    background: #2c3e50;
                    color: white;
                    padding: 20px;
                    text-align: center;
                }
                
                .thank-you {
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 8px;
                }
                
                .footer-note {
                    opacity: 0.8;
                    font-size: 0.8rem;
                    margin-bottom: 15px;
                }
                
                .signature-section {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 15px;
                    padding-top: 15px;
                    border-top: 1px solid rgba(255, 255, 255, 0.2);
                }
                
                .signature-box {
                    text-align: center;
                    flex: 1;
                }
                
                .signature-line {
                    width: 100px;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.5);
                    margin: 20px auto 6px;
                }
                
                .signature-label {
                    font-size: 0.75rem;
                    opacity: 0.8;
                }
                
                .generated-info {
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid rgba(255, 255, 255, 0.2);
                    font-size: 0.7rem;
                    opacity: 0.7;
                }
                
                .print-button {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    margin: 15px 0;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                    transition: all 0.3s ease;
                }
                
                .print-button:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
                }
                
                @media print {
                    body {
                        background: white;
                        padding: 0;
                        font-size: 12px;
                    }
                    .receipt-container {
                        box-shadow: none;
                        border-radius: 0;
                        max-width: 100%;
                    }
                    .print-button {
                        display: none;
                    }
                    .header {
                        padding: 15px;
                    }
                    .payment-details, .receipt-meta, .payment-summary, .footer {
                        padding: 15px;
                    }
                }
                
                @media (max-width: 600px) {
                    .receipt-meta {
                        grid-template-columns: 1fr;
                        gap: 10px;
                        padding: 15px;
                    }
                    
                    .payment-details {
                        padding: 15px;
                    }
                    
                    .detail-item {
                        grid-template-columns: 1fr;
                        gap: 6px;
                    }
                    
                    .signature-section {
                        flex-direction: column;
                        gap: 15px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="receipt-container">
                <div class="header">
                    <div class="institute-logo">SIMT</div>
                    <h1 class="institute-name">Saha Institute of Management & Technology</h1>
                    <p class="institute-address">
                        House No. 2219, Sector 3, Faridabad, Haryana<br>
                        Phone: +91 9871261719 | Email: sahaedu@gmail.com
                    </p>
                    <div class="receipt-badge">Payment Receipt</div>
                </div>
                
                <div class="receipt-meta">
                    <div class="meta-card">
                        <div class="meta-label">Receipt Number</div>
                        <div class="meta-value receipt-number">${payment.receiptNumber}</div>
                    </div>
                    <div class="meta-card">
                        <div class="meta-label">Payment Date</div>
                        <div class="meta-value">${new Date(payment.paymentDate).toLocaleDateString('en-IN', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                        })}</div>
                    </div>
                </div>
                
                <div class="payment-details">
                    <h2 class="section-title">
                        💳 Payment Details
                    </h2>
                    
                    <div class="details-grid">
                        <div class="detail-item">
                            <div class="detail-label">Student Name</div>
                            <div class="detail-value">${payment.student.name}</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label">Student ID</div>
                            <div class="detail-value">${payment.student.id}</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label">Payment Method</div>
                            <div class="detail-value">${payment.paymentMethod}</div>
                        </div>
                        
                        <div class="detail-item">
                            <div class="detail-label">Description</div>
                            <div class="detail-value">${payment.description}</div>
                        </div>
                        
                        ${payment.remarks ? `
                        <div class="detail-item">
                            <div class="detail-label">Remarks</div>
                            <div class="detail-value">${payment.remarks}</div>
                        </div>
                        ` : ''}
                        
                        <div class="detail-item amount-highlight">
                            <div class="detail-label">Amount Paid</div>
                            <div class="detail-value">₹${payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                    </div>
                </div>
                
                <div class="payment-summary">
                    <div class="summary-row">
                        <span>Payment Status:</span>
                        <span style="color: #28a745; font-weight: 600;">✅ Completed</span>
                    </div>
                    <div class="summary-row">
                        <span>Transaction ID:</span>
                        <span style="font-family: 'Courier New', monospace;">${payment.receiptNumber}</span>
                    </div>
                    <div class="summary-row">
                        <span>Total Amount Received:</span>
                        <span>₹${payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>
                
                <div class="footer">
                    <div class="thank-you">🙏 Thank you for your payment!</div>
                    <div class="footer-note">
                        This is a computer-generated receipt and does not require a physical signature.
                    </div>
                    
                    <div class="signature-section">
                        <div class="signature-box">
                            <div class="signature-line"></div>
                            <div class="signature-label">Student Signature</div>
                        </div>
                        <div class="signature-box">
                            <div class="signature-line"></div>
                            <div class="signature-label">Authorized Signature</div>
                        </div>
                    </div>
                    
                    <div class="generated-info">
                        Generated: ${new Date().toLocaleDateString('en-IN')} | SIMT Student Management System v2.0
                    </div>
                </div>
            </div>
            
            <div style="text-align: center;">
                <button class="print-button" onclick="window.print()">🖨️ Print Receipt</button>
            </div>
        </body>
        </html>
    `;
    
    // Create and download the receipt as HTML file
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${payment.receiptNumber}_${payment.student.name.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Also open receipt in new window for immediate viewing
    const receiptWindow = window.open('', '_blank');
    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
}