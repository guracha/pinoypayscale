
document.addEventListener('DOMContentLoaded', () => {

    // --- Library setup for PDF.js ---
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js`;

    // --- Scrolling Salary Dashboard ---
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        dashboard.innerHTML = '<h2>Salary Dashboard</h2><div class="scrolling-wrapper"><div id="stats-container" class="stats-grid"></div></div>';
        const statsContainer = document.getElementById('stats-container');
        fetch('salary_data.json')
            .then(response => response.json())
            .then(data => {
                const appendCards = (dataList) => {
                    dataList.forEach(item => {
                        const statCard = document.createElement('div');
                        statCard.className = 'stat-card';
                        statCard.innerHTML = `
                            <h4>${item.jobTitle}</h4>
                            <p>${item.experienceLevel}</p>
                            <p class="salary-range">₱${item.salaryRangeLow.toLocaleString()} - ₱${item.salaryRangeHigh.toLocaleString()}</p>
                        `;
                        statsContainer.appendChild(statCard);
                    });
                };
                appendCards(data); // Original cards
                appendCards(data); // Cloned cards for seamless scroll
            });
    }

    // --- Resume Analyzer Logic ---
    const analyzerDropZone = document.getElementById('analyzer-drop-zone');
    const resumeFileInput = document.getElementById('resume-file-input');
    const resultModal = document.getElementById('result-modal');
    const closeButton = document.querySelector('.close-button');
    const salaryEstimateResultDiv = document.getElementById('salary-estimate-result');

    const processResumeFile = async (file) => {
        if (!file) {
            alert('Please select a file.');
            return;
        }

        let resumeText = '';
        const fileName = file.name.toLowerCase();

        try {
            if (fileName.endsWith('.pdf')) {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    resumeText += textContent.items.map(item => item.str).join(' ') + '\n';
                }
            } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer });
                resumeText = result.value;
            } else if (fileName.endsWith('.txt')) {
                resumeText = await file.text();
            } else {
                alert('Unsupported file type. Please upload a .txt, .pdf, or .docx file.');
                return;
            }

            // Simulate AI analysis with the extracted text
            console.log("Simulating analysis for resume:", resumeText.substring(0, 200) + "...");
            const mockResponse = {
                jobTitle: "Senior Software Engineer",
                estimatedSalary: "₱150,000 - ₱200,000",
                confidence: "85%"
            };
            
            displayAnalysisResult(mockResponse);

        } catch (error) {
            console.error('Error processing resume file:', error);
            alert('There was an error reading your resume. Please ensure it is not corrupted.');
        }
    };

    const displayAnalysisResult = (response) => {
        const resultHTML = `
            <h4>Analysis Complete</h4>
            <p>Based on your resume, we've identified a potential match:</p>
            <div style="margin: 2rem 0; text-align: left; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                <p><strong>Identified Role:</strong> ${response.jobTitle}</p>
                <p><strong>Estimated Salary Range:</strong> <strong style="color: var(--primary-color);">${response.estimatedSalary}</strong></p>
                <p><strong>Confidence Score:</strong> ${response.confidence}</p>
            </div>
            <small>Disclaimer: This is a preliminary estimate and may vary.</small>
        `;
        salaryEstimateResultDiv.innerHTML = resultHTML;
        openModal();
    };

    // Modal control
    const openModal = () => {
        if (resultModal) {
            resultModal.style.display = 'flex';
            setTimeout(() => resultModal.classList.add('visible'), 10);
        }
    };
    const closeModal = () => {
        if (resultModal) {
            resultModal.classList.remove('visible');
            setTimeout(() => resultModal.style.display = 'none', 300);
        }
    };

    // Event listeners for file upload
    if (analyzerDropZone) {
        analyzerDropZone.addEventListener('click', () => resumeFileInput.click());
        analyzerDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            analyzerDropZone.classList.add('drag-over');
        });
        analyzerDropZone.addEventListener('dragleave', () => analyzerDropZone.classList.remove('drag-over'));
        analyzerDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            analyzerDropZone.classList.remove('drag-over');
            if (e.dataTransfer.files.length > 0) {
                processResumeFile(e.dataTransfer.files[0]);
            }
        });
    }

    if (resumeFileInput) {
        resumeFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                processResumeFile(e.target.files[0]);
            }
        });
    }

    // Modal close listeners
    if (closeButton) closeButton.addEventListener('click', closeModal);
    if (resultModal) resultModal.addEventListener('click', (e) => {
        if (e.target === resultModal) closeModal();
    });

    // --- Blog Loading Logic ---
    const postList = document.getElementById('post-list');
    const postContentContainer = document.getElementById('post-content-container');

    function loadPost(fileName) {
        fetch(`posts/${fileName}`)
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const postBody = doc.body;
                const header = postBody.querySelector('header');
                if (header) header.remove();
                postContentContainer.innerHTML = postBody.innerHTML;
            });
    }

    const knownPosts = ['it-finance-salary-data.html', 'driver-salary-report-2026.html'];
    if (postList) {
        knownPosts.forEach(fileName => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#`;
            const title = fileName.replace(/-/g, ' ').replace('.html', '').replace(/\b\w/g, l => l.toUpperCase());
            link.textContent = title;
            link.onclick = (e) => {
                e.preventDefault();
                loadPost(fileName);
            };
            listItem.appendChild(link);
            postList.appendChild(listItem);
        });
        if (knownPosts.length > 0) {
            loadPost(knownPosts[0]);
        }
    }
});
