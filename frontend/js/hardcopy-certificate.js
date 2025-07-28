// Helper: Title Case
function titleCase(str) {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

// Test function to manually show certificate details panel
function testCertificateDetails() {
    console.log('Test function called');
    const testData = {
        name: 'John Doe',
        registration: 'REG123456',
        certificate: 'Computer Science',
        Grade: 'A+'
    };
    
    console.log('Showing test certificate details with data:', testData);
    showCertificateDetails(testData, 'TEST-CERT-001');
}

// Global variable to store the last generated PDF
let lastGeneratedPDF = null;

// Function to show certificate details panel
function showCertificateDetails(data, certificateId, pdfBlob = null) {
    console.log('showCertificateDetails called with:', data, certificateId);
    
    const detailsPanel = document.getElementById('certificateDetailsPanel');
    console.log('Details panel element:', detailsPanel);
    
    if (!detailsPanel) {
        console.error('Certificate details panel not found!');
        return;
    }
    
    // Store the PDF blob for download functionality
    if (pdfBlob) {
        lastGeneratedPDF = pdfBlob;
    }
    
    // Show the certificate details panel
    detailsPanel.style.display = 'block';
    
    // Populate certificate details with null checks
    const detailStudentName = document.getElementById('detailStudentName');
    const detailRegistrationNo = document.getElementById('detailRegistrationNo');
    const detailIssueDate = document.getElementById('detailIssueDate');
    const detailCertificateId = document.getElementById('detailCertificateId');
    const detailCourseName = document.getElementById('detailCourseName');
    const detailGrade = document.getElementById('detailGrade');
    const detailStatus = document.getElementById('detailStatus');
    const detailFatherName = document.getElementById('detailFatherName');
    const detailMotherName = document.getElementById('detailMotherName');
    const detailPerformance = document.getElementById('detailPerformance');
    const detailDuration = document.getElementById('detailDuration');
    const detailIssueSession = document.getElementById('detailIssueSession');
    const certificateTimestamp = document.getElementById('certificateTimestamp');
    
    if (detailStudentName) detailStudentName.textContent = titleCase(data.name);
    if (detailRegistrationNo) detailRegistrationNo.textContent = data.registration;
    if (detailIssueDate) detailIssueDate.textContent = new Date().toLocaleDateString();
    if (detailCertificateId) detailCertificateId.textContent = certificateId || 'CERT-' + data.registration;
    if (detailCourseName) detailCourseName.textContent = titleCase(data.certificate);
    if (detailGrade) detailGrade.textContent = data.Grade;
    if (detailStatus) detailStatus.textContent = 'Issued';
    if (detailFatherName) detailFatherName.textContent = titleCase(data.fathersname || '-');
    if (detailMotherName) detailMotherName.textContent = titleCase(data.mothersname || '-');
    if (detailPerformance) detailPerformance.textContent = titleCase(data.performance || '-');
    if (detailDuration) detailDuration.textContent = data.duration || '-';
    if (detailIssueSession) detailIssueSession.textContent = data.IssueSession || '-';
    if (certificateTimestamp) certificateTimestamp.textContent = `Last updated: ${new Date().toLocaleString()}`;
    
    // Update status badge
    const statusElement = document.getElementById('certificateStatus');
    if (statusElement) {
        statusElement.textContent = 'Issued';
        statusElement.className = 'certificate-status status-issued';
    }
    
    console.log('Certificate details populated successfully');
    console.log('Certificate details panel updated');
}

// Function to load existing certificate data
async function loadExistingCertificates() {
    try {
        console.log('Loading existing certificates...');
        const response = await fetch('https://aalekhapi.sahaedu.in/api/certificates');
        
        if (response.ok) {
            const certificates = await response.json();
            console.log('Loaded certificates:', certificates);
            
            // Update the table with all certificates
            populateCertificatesTable(certificates);
            updateCertificateTimestamp();
        } else {
            console.error('Failed to load certificates');
            populateCertificatesTable([]);
        }
    } catch (error) {
        console.error('Error loading certificates:', error);
        populateCertificatesTable([]);
    }
}

// Function to display certificate data in the panel
function displayCertificateData(certificate) {
    console.log('Displaying certificate data:', certificate);
    
    // Add null checks for all elements
    const detailStudentName = document.getElementById('detailStudentName');
    const detailRegistrationNo = document.getElementById('detailRegistrationNo');
    const detailIssueDate = document.getElementById('detailIssueDate');
    const detailCertificateId = document.getElementById('detailCertificateId');
    const detailCourseName = document.getElementById('detailCourseName');
    const detailGrade = document.getElementById('detailGrade');
    const detailStatus = document.getElementById('detailStatus');
    const detailFatherName = document.getElementById('detailFatherName');
    const detailMotherName = document.getElementById('detailMotherName');
    const detailPerformance = document.getElementById('detailPerformance');
    const detailDuration = document.getElementById('detailDuration');
    const detailIssueSession = document.getElementById('detailIssueSession');
    const certificateTimestamp = document.getElementById('certificateTimestamp');
    const statusElement = document.getElementById('certificateStatus');
    
    if (detailStudentName) detailStudentName.textContent = certificate.studentName || certificate.student?.name || 'Unknown Student';
    if (detailRegistrationNo) detailRegistrationNo.textContent = certificate.registrationNumber || '-';
    if (detailIssueDate) detailIssueDate.textContent = certificate.issueDate ? new Date(certificate.issueDate).toLocaleDateString() : '-';
    if (detailCertificateId) detailCertificateId.textContent = certificate.id ? 'CERT-' + certificate.id : '-';
    if (detailCourseName) detailCourseName.textContent = certificate.type || '-';
    if (detailGrade) detailGrade.textContent = certificate.grade || '-';
    if (detailStatus) detailStatus.textContent = certificate.status || 'Active';
    if (detailFatherName) detailFatherName.textContent = certificate.fathersName || '-';
    if (detailMotherName) detailMotherName.textContent = certificate.mothersName || '-';
    if (detailPerformance) detailPerformance.textContent = certificate.performance || '-';
    if (detailDuration) detailDuration.textContent = certificate.courseDuration || '-';
    if (detailIssueSession) detailIssueSession.textContent = certificate.issueSession || '-';
    if (certificateTimestamp) certificateTimestamp.textContent = `Last updated: ${certificate.issueDate ? new Date(certificate.issueDate).toLocaleString() : 'Unknown'}`;
    
    // Update status badge
    if (statusElement) {
        statusElement.textContent = certificate.status || 'Active';
        statusElement.className = `certificate-status ${certificate.status === 'Issued' ? 'status-issued' : 'status-pending'}`;
    }
}

// Function to display empty certificate data
function displayEmptyCertificateData() {
    console.log('Displaying empty certificate data');
    
    // Add null checks for all elements
    const detailStudentName = document.getElementById('detailStudentName');
    const detailRegistrationNo = document.getElementById('detailRegistrationNo');
    const detailIssueDate = document.getElementById('detailIssueDate');
    const detailCertificateId = document.getElementById('detailCertificateId');
    const detailCourseName = document.getElementById('detailCourseName');
    const detailGrade = document.getElementById('detailGrade');
    const detailStatus = document.getElementById('detailStatus');
    const statusElement = document.getElementById('certificateStatus');
    
    if (detailStudentName) detailStudentName.textContent = 'No certificates found';
    if (detailRegistrationNo) detailRegistrationNo.textContent = '-';
    if (detailIssueDate) detailIssueDate.textContent = '-';
    if (detailCertificateId) detailCertificateId.textContent = '-';
    if (detailCourseName) detailCourseName.textContent = '-';
    if (detailGrade) detailGrade.textContent = '-';
    if (detailStatus) detailStatus.textContent = 'No Data';
    
    // Update status badge
    if (statusElement) {
        statusElement.textContent = 'No Data';
        statusElement.className = 'certificate-status status-pending';
    }
}

// Function to populate certificates table
function populateCertificatesTable(certificates) {
    const tableBody = document.getElementById('certificatesTableBody');
    const certificateCount = document.getElementById('certificateCount');
    
    if (!tableBody) {
        console.error('Certificates table body not found');
        return;
    }
    
    // Update certificate count
    if (certificateCount) {
        certificateCount.textContent = `${certificates.length} certificate${certificates.length !== 1 ? 's' : ''} found`;
    }
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    if (certificates.length === 0) {
        // Show no data row
        const noDataRow = document.createElement('tr');
        noDataRow.className = 'no-data-row';
        noDataRow.innerHTML = `
            <td colspan="8" class="no-data-cell">
                <div class="no-data-content">
                    <i class="fas fa-certificate"></i>
                    <p>No certificates found</p>
                    <small>Generate your first certificate using the form above</small>
                </div>
            </td>
        `;
        tableBody.appendChild(noDataRow);
        return;
    }
    
    // Populate table with certificates
    certificates.forEach((certificate, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="certificate-id">CERT-${certificate.id || (index + 1)}</td>
            <td class="student-name">${certificate.studentName || certificate.student?.name || 'Unknown Student'}</td>
            <td>${certificate.registrationNumber || '-'}</td>
            <td>${certificate.type || '-'}</td>
            <td>${certificate.grade || '-'}</td>
            <td>${certificate.issueDate ? new Date(certificate.issueDate).toLocaleDateString() : '-'}</td>
            <td>
                <span class="status-badge ${getStatusClass(certificate.status)}">
                    ${certificate.status || 'Active'}
                </span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="table-action-btn btn-table-view" onclick="viewCertificateFromTable(${certificate.id})" title="View Certificate">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="table-action-btn btn-table-download" onclick="downloadCertificateFromTable(${certificate.id})" title="Download PDF">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="table-action-btn btn-table-edit" onclick="editCertificateFromTable(${certificate.id})" title="Edit Certificate">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to get status class for styling
function getStatusClass(status) {
    switch (status?.toLowerCase()) {
        case 'issued':
            return 'status-issued';
        case 'active':
            return 'status-active';
        case 'pending':
            return 'status-pending';
        default:
            return 'status-active';
    }
}

// Function to update certificate timestamp
function updateCertificateTimestamp() {
    const certificateTimestamp = document.getElementById('certificateTimestamp');
    if (certificateTimestamp) {
        certificateTimestamp.textContent = `Last updated: ${new Date().toLocaleString()}`;
    }
}

// Table action functions
function viewCertificateFromTable(certificateId) {
    console.log('Viewing certificate:', certificateId);
    if (lastGeneratedPDF) {
        const pdfUrl = URL.createObjectURL(lastGeneratedPDF);
        window.open(pdfUrl, '_blank');
    } else {
        alert('Certificate PDF not available. Please regenerate the certificate.');
    }
}

function downloadCertificateFromTable(certificateId) {
    console.log('Downloading certificate:', certificateId);
    if (lastGeneratedPDF) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(lastGeneratedPDF);
        link.download = `certificate_${certificateId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    } else {
        alert('Certificate PDF not available. Please regenerate the certificate.');
    }
}

function editCertificateFromTable(certificateId) {
    console.log('Editing certificate:', certificateId);
    // Scroll to form for editing
    document.getElementById('certificateForm').scrollIntoView({ behavior: 'smooth' });
    // You could also pre-populate the form with certificate data here
}

// Function to filter certificates based on search
function filterCertificates() {
    const searchInput = document.getElementById('certificateSearchInput');
    const tableRows = document.querySelectorAll('#certificatesTableBody tr:not(.no-data-row)');
    
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    let visibleCount = 0;
    
    tableRows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const isVisible = text.includes(searchTerm);
        row.style.display = isVisible ? '' : 'none';
        if (isVisible) visibleCount++;
    });
    
    // Update count
    const certificateCount = document.getElementById('certificateCount');
    if (certificateCount) {
        if (searchTerm) {
            certificateCount.textContent = `${visibleCount} certificate${visibleCount !== 1 ? 's' : ''} found (filtered)`;
        } else {
            certificateCount.textContent = `${tableRows.length} certificate${tableRows.length !== 1 ? 's' : ''} found`;
        }
    }
}

// Function to save certificate to backend
async function saveCertificateToBackend(data) {
    try {
        const certificateData = {
            type: data.certificate || "Certificate",
            issueDate: new Date().toISOString().split('T')[0],
            validUntil: null,
            remarks: `Course: ${data.certificate || 'N/A'}, Duration: ${data.duration || 'N/A'}, Grade: ${data.Grade || 'N/A'}`,
            status: "Issued",
            // Additional fields for hardcopy certificate
            studentName: data.name || "",
            registrationNumber: data.registration || "",
            rollNumber: data.rollno || "",
            examRollNumber: data.erollno || "",
            courseDuration: data.duration || "",
            performance: data.performance || "",
            grade: data.Grade || "",
            issueSession: data.IssueSession || "",
            issueDay: data.IssueDay ? parseInt(data.IssueDay) : null,
            issueMonth: data.IssueMonth || "",
            issueYear: data.IssueYear ? parseInt(data.IssueYear) : null,
            fathersName: data.fathersname || "",
            mothersName: data.mothersname || "",
            dateOfBirth: data.dob || ""
        };
        
        // Validate required fields
        if (!certificateData.type || !certificateData.studentName || !certificateData.registrationNumber) {
            console.error('Missing required fields:', {
                type: certificateData.type,
                studentName: certificateData.studentName,
                registrationNumber: certificateData.registrationNumber
            });
            alert('Missing required fields: Certificate type, student name, and registration number are required.');
            return null;
        }
        
        console.log('Sending certificate data to backend:', certificateData);
        
        const response = await fetch('https://aalekhapi.sahaedu.in/api/certificates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(certificateData)
        });
        
        console.log('Backend response status:', response.status);
        console.log('Backend response headers:', response.headers);
        
        if (response.ok) {
            const savedCertificate = await response.json();
            console.log('Certificate saved successfully:', savedCertificate);
            return savedCertificate.id;
        } else {
            let errorText = '';
            try {
                errorText = await response.text();
            } catch (e) {
                errorText = 'Unable to read error response';
            }
            console.error('Failed to save certificate to backend. Status:', response.status);
            console.error('Error response:', errorText);
            console.error('Request data that failed:', certificateData);
            
            // Show user-friendly error message
            alert(`Failed to save certificate to backend. Status: ${response.status}\nError: ${errorText || 'Unknown error'}`);
            return null;
        }
    } catch (error) {
        console.error('Error saving certificate:', error);
        console.error('Error details:', error.message);
        return null;
    }
}

// Ensure the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing certificate page...');
    
    // Load existing certificates when page loads
    await loadExistingCertificates();
    
    // Add subject rows logic
    const subjectsArea = document.getElementById('subjectsArea');
    const addSubjectBtn = document.getElementById('addSubjectBtn');
    let subjectCount = 0;

    function addSubjectRow() {
        if (subjectCount >= 6) return;
        const tr = document.createElement('tr');
        tr.className = 'subject-row';
        tr.innerHTML = `
            <td><input type="text" name="subject${subjectCount}" placeholder="Subject Name" required></td>
            <td><input type="number" name="theory${subjectCount}" placeholder="Theory" min="0" max="30" required class="marks-input"></td>
            <td><input type="number" name="practical${subjectCount}" placeholder="Practical" min="0" max="70" required class="marks-input"></td>
            <td><input type="number" name="obtained${subjectCount}" placeholder="Obtained" min="0" max="100" required readonly style="background:#e9ecef;"></td>
            <td><button type="button" onclick="this.closest('tr').remove(); subjectCount--;">Remove</button></td>
        `;
        subjectsArea.appendChild(tr);
        subjectCount++;
    }

    // Add event listener to the table body for delegation
    subjectsArea.addEventListener('input', function(e) {
        if (e.target.classList.contains('marks-input')) {
            const row = e.target.closest('tr');
            const theoryInput = row.querySelector('input[name^="theory"]');
            const practicalInput = row.querySelector('input[name^="practical"]');
            const obtainedInput = row.querySelector('input[name^="obtained"]');

            const theory = parseInt(theoryInput.value, 10) || 0;
            const practical = parseInt(practicalInput.value, 10) || 0;

            // Cap the values to their max
            if (theory > 30) theoryInput.value = 30;
            if (practical > 70) practicalInput.value = 70;

            obtainedInput.value = (parseInt(theoryInput.value, 10) || 0) + (parseInt(practicalInput.value, 10) || 0);
        }
    });

    if (addSubjectBtn) {
        addSubjectBtn.onclick = addSubjectRow;
        // Add one row by default
        addSubjectRow();
    }

    // Custom file input label
    const fileInput = document.getElementById('photo');
    const fileInputLabel = document.querySelector('.file-input-label');
    if (fileInput && fileInputLabel) {
        fileInput.addEventListener('change', function() {
            fileInputLabel.textContent = this.files[0] ? this.files[0].name : 'Choose File';
        });
    }

    // Certificate details panel action buttons
    const viewCertificateBtn = document.getElementById('viewCertificateBtn');
    const downloadCertificateBtn = document.getElementById('downloadCertificateBtn');
    const printCertificateBtn = document.getElementById('printCertificateBtn');
    const editCertificateBtn = document.getElementById('editCertificateBtn');
    const refreshCertificatesBtn = document.getElementById('refreshCertificatesBtn');

    if (viewCertificateBtn) {
        viewCertificateBtn.addEventListener('click', function() {
            if (lastGeneratedPDF) {
                // Open certificate in new window for viewing
                const pdfUrl = URL.createObjectURL(lastGeneratedPDF);
                window.open(pdfUrl, '_blank');
            } else {
                alert('No certificate available for viewing. Please generate a certificate first.');
            }
        });
    }

    if (downloadCertificateBtn) {
        downloadCertificateBtn.addEventListener('click', function() {
            if (lastGeneratedPDF) {
                // Create download link from the stored PDF blob
                const link = document.createElement('a');
                link.href = URL.createObjectURL(lastGeneratedPDF);
                link.download = `certificate_${document.getElementById('detailRegistrationNo').textContent}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            } else {
                alert('No certificate available for download. Please generate a certificate first.');
            }
        });
    }

    if (printCertificateBtn) {
        printCertificateBtn.addEventListener('click', function() {
            if (lastGeneratedPDF) {
                // Open print dialog for the certificate
                const pdfUrl = URL.createObjectURL(lastGeneratedPDF);
                const printWindow = window.open(pdfUrl, '_blank');
                printWindow.onload = function() {
                    printWindow.print();
                };
            } else {
                alert('No certificate available for printing. Please generate a certificate first.');
            }
        });
    }

    if (editCertificateBtn) {
        editCertificateBtn.addEventListener('click', function() {
            // Scroll to form for editing
            document.getElementById('certificateForm').scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (refreshCertificatesBtn) {
        refreshCertificatesBtn.addEventListener('click', async function() {
            console.log('Refreshing certificates...');
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
            this.disabled = true;
            
            try {
                await loadExistingCertificates();
                console.log('Certificates refreshed successfully');
            } catch (error) {
                console.error('Error refreshing certificates:', error);
            } finally {
                this.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
                this.disabled = false;
            }
        });
    }

    // Add search functionality
    const certificateSearchInput = document.getElementById('certificateSearchInput');
    if (certificateSearchInput) {
        certificateSearchInput.addEventListener('input', filterCertificates);
    }

    const certificateForm = document.getElementById('certificateForm');
    if (certificateForm) {
        console.log('Certificate form found and event listener attached');
        certificateForm.onsubmit = async function(e) {
            console.log('Certificate form submitted');
            e.preventDefault();
            const form = e.target;
            // Gather form data
            const data = {};
            for (const el of form.elements) {
                if (el.name && el.type !== 'file') data[el.name] = el.value;
            }
            console.log('Form data gathered:', data);
            
            // Gather subjects
            const rows = [];
            for (let i = 0; i < 6; i++) {
                const subject = form[`subject${i}`];
                if (subject) {
                    rows.push({
                        subject: subject.value,
                        theory: form[`theory${i}`].value,
                        practical: form[`practical${i}`].value,
                        obtained: form[`obtained${i}`].value
                    });
                }
            }
            data.rows = rows;
            console.log('Subject rows gathered:', rows);
            
            // Prepare QR data as a formatted string for readability
            const qrDataString = `
Thank you for joining Saha Institute of Management & Technology!

Congratulations, ${titleCase(data.name)}!
You have successfully completed the course: ${titleCase(data.certificate)}.

We are proud of your achievement and wish you a bright future ahead.

- Saha Institute of Management & Technology`;

            // Generate QR code
            const qrDataUrl = await new Promise((resolve, reject) => {
                QRCode.toDataURL(qrDataString, { width: 200, margin: 2 }, (err, url) => {
                    if (err) reject(err);
                    else resolve(url);
                });
            });
            // Generate barcode (using registration number for reliability)
            JsBarcode("#barcodeCanvas", data.registration, { format: "CODE128", displayValue: false });
            const barcodeDataUrl = document.getElementById('barcodeCanvas').toDataURL("image/png");
            // Watermark
            const watermarkCanvas = document.getElementById('watermarkCanvas');
            const ctx = watermarkCanvas.getContext('2d');
            ctx.clearRect(0, 0, 400, 400);
            ctx.fillStyle = 'rgba(200, 200, 200, 0.1)';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('SAHA INSTITUTE', 200, 200);
            const watermarkDataUrl = watermarkCanvas.toDataURL('image/png');
            // Photo
            let photoDataUrl = watermarkDataUrl;
            const photoInput = form['photo'];
            if (photoInput.files && photoInput.files[0]) {
                photoDataUrl = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = e => resolve(e.target.result);
                    reader.readAsDataURL(photoInput.files[0]);
                });
            }
            // Generate PDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4', margin: 1 });
            // Add images
            doc.addImage(barcodeDataUrl, 'PNG', 450, 70, 85, 14);
            doc.addImage(qrDataUrl, 'JPEG', 80, 100, 85, 80);
            doc.addImage(photoDataUrl, "JPEG", 450, 100, 85, 70);
            // Add text fields
            doc.setFontSize(14);
            doc.text(`${data.registration}`, 80, 80);
            doc.text(`${titleCase(data.name)}`, 220, 180);
            doc.text(`${titleCase(data.fathersname)}`, 220, 205);
            doc.text(`${titleCase(data.mothersname)}`, 220, 230);
            doc.text(`${data.dob}`, 440, 230);
            doc.text(`${data.rollno}`, 145, 260);
            doc.text(`${data.erollno}`, 310, 260);
            doc.text(`${data.IssueSession}`, 440, 260);
            doc.text(`${data.duration}`, 220, 290);
            doc.text(`${titleCase(data.performance)}`, 345, 340);
            doc.setFont("helvetica", "bold");
            doc.text(`${titleCase(data.certificate)}`, 300, 430, null, null, "center");
            // Table Headers
            const tableStartY = 465;
            const pageWidth = doc.internal.pageSize.width;
            const rectangleWidth = 440;
            const x = ((pageWidth - rectangleWidth) / 2) + 10;
            doc.setFontSize(11);
            doc.setLineWidth(2);
            doc.rect(x, tableStartY, rectangleWidth, 15);
            doc.text("S.NO", 95, tableStartY + 10);
            doc.text("Subject", 130, tableStartY + 10);
            doc.text("Total", 330, tableStartY + 10);
            doc.text("Theory", 365, tableStartY + 10);
            doc.text("Practical", 410, tableStartY + 10);
            doc.text("Obtained", 465, tableStartY + 10);
            // Add Rows
            let totalTheory = 0;
            let totalPractical = 0;
            let totalObtained = 0;
            const maxRows = 6;
            let maxMarks = 0;
            doc.setFont("times", "normal");
            for (let index = 0; index < maxRows; index++) {
                const rowY = tableStartY + 15 + index * 15;
                doc.rect(x, rowY, rectangleWidth, 15);
                if (rows[index] !== undefined) {
                    doc.text(`${index + 1}`, 95, rowY + 10);
                    doc.text(`${titleCase(rows[index].subject) || ""}`, 130, rowY + 10);
                    doc.text(`100`, 330, rowY + 10);
                    doc.text(`${rows[index].theory || ""}`, 365, rowY + 10);
                    doc.text(`${rows[index].practical || ""}`, 410, rowY + 10);
                    doc.text(`${rows[index].obtained || ""}`, 465, rowY + 10);
                    maxMarks += 100;
                    totalTheory += rows[index].theory ? parseInt(rows[index].theory, 10) : 0;
                    totalPractical += rows[index].practical ? parseInt(rows[index].practical, 10) : 0;
                    totalObtained += rows[index].obtained ? parseInt(rows[index].obtained, 10) : 0;
                }
            }
            // Add Total Row
            const totalRowY = tableStartY + 15 + maxRows * 15;
            doc.rect(x, totalRowY, rectangleWidth, 15);
            doc.text("Total", 130, totalRowY + 10);
            doc.text(`${maxMarks}`, 320, totalRowY + 10);
            doc.text(`${totalTheory}`, 365, totalRowY + 10);
            doc.text(`${totalPractical}`, 410, totalRowY + 10);
            doc.text(`${totalObtained}`, 465, totalRowY + 10);
            // Add Issue Details
            doc.setFontSize(16);
            doc.text(`${data.Grade}`, 240, 610);
            doc.text(`${data.IssueDay}`, 240, 635);
            doc.text(` ${titleCase(data.IssueMonth)} ${data.IssueYear}`, 355, 635);
            // Generate PDF blob for storage and download
            const pdfBlob = doc.output('blob');
            
            // Save PDF file immediately
            doc.save(`certificate_${data.registration}.pdf`);
            console.log('PDF saved successfully');
            
            // Save certificate to backend and refresh table
            console.log('Attempting to save certificate to backend...');
            const certificateId = await saveCertificateToBackend(data);
            console.log('Certificate saved to backend, ID:', certificateId);
            
            // Refresh the certificate table to show the new certificate
            await loadExistingCertificates();
            
            // Show success message
            if (certificateId) {
                alert('Certificate generated and saved successfully!');
            } else {
                alert('Certificate generated but failed to save to database. Please check the backend logs.');
            }
        };
    } else {
        console.error('Certificate form not found!');
    }
}); 