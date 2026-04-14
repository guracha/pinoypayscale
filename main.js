
document.addEventListener('DOMContentLoaded', () => {

    // --- Scrolling Salary Dashboard (Existing Logic) --- 
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        dashboard.innerHTML = '<h2>Salary Dashboard</h2><div class="scrolling-wrapper"><div id="stats-container" class="stats-grid"></div></div>';
        const statsContainer = document.getElementById('stats-container');

        fetch('salary_data.json')
            .then(response => response.json())
            .then(data => {
                // Original Cards
                data.forEach(item => {
                    const statCard = document.createElement('div');
                    statCard.className = 'stat-card';
                    statCard.innerHTML = `
                        <h4>${item.jobTitle}</h4>
                        <p>${item.experienceLevel}</p>
                        <p class="salary-range">₱${item.salaryRangeLow.toLocaleString()} - ₱${item.salaryRangeHigh.toLocaleString()}</p>
                    `;
                    statsContainer.appendChild(statCard);
                });

                // Cloned Cards for seamless loop
                data.forEach(item => {
                    const statCard = document.createElement('div');
                    statCard.className = 'stat-card';
                    statCard.innerHTML = `
                        <h4>${item.jobTitle}</h4>
                        <p>${item.experienceLevel}</p>
                        <p class="salary-range">₱${item.salaryRangeLow.toLocaleString()} - ₱${item.salaryRangeHigh.toLocaleString()}</p>
                    `;
                    statsContainer.appendChild(statCard);
                });
            });
    }

    // --- Resume Analyzer (New Feature Logic) ---
    const analyzerDropZone = document.getElementById('analyzer-drop-zone');
    const resumeFileInput = document.getElementById('resume-file-input');
    const resultModal = document.getElementById('result-modal');
    const closeButton = document.querySelector('.close-button');
    const salaryEstimateResultDiv = document.getElementById('salary-estimate-result');

    // Function to process the uploaded file
    const processResumeFile = (file) => {
        if (!file || file.type !== 'text/plain') {
            alert('Please upload a valid .txt file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            const resumeText = event.target.result;
            // Simulate AI analysis
            console.log("Simulating analysis for resume:", resumeText.substring(0, 100) + "...");
            const mockResponse = {
                jobTitle: "Senior Software Engineer",
                estimatedSalary: "₱150,000 - ₱200,000",
                confidence: "85%"
            };
            
            // Display the result in the modal
            const resultHTML = `
                <h4>Analysis Complete</h4>
                <p>Based on your resume, we've identified a potential match:</p>
                <div style="margin: 2rem 0; text-align: left; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                    <p><strong>Identified Role:</strong> ${mockResponse.jobTitle}</p>
                    <p><strong>Estimated Salary Range:</strong> <strong style="color: var(--primary-color);">${mockResponse.estimatedSalary}</strong></p>
                    <p><strong>Confidence Score:</strong> ${mockResponse.confidence}</p>
                </div>
                <small>Disclaimer: This is a preliminary estimate and may vary.</small>
            `;
            salaryEstimateResultDiv.innerHTML = resultHTML;
            openModal();
        };
        reader.readAsText(file);
    };

    // Modal control functions
    const openModal = () => {
        if (resultModal) resultModal.style.display = 'flex'; // Changed for visibility
        setTimeout(() => {
            if (resultModal) resultModal.classList.add('visible');
        }, 10); // small delay to allow display property to apply before transition
    };
    const closeModal = () => {
        if (resultModal) resultModal.classList.remove('visible');
        setTimeout(() => { // wait for transition to finish
            if (resultModal) resultModal.style.display = 'none';
        }, 300);
    };

    if (analyzerDropZone) {
        // Trigger file input click when the drop zone is clicked
        analyzerDropZone.addEventListener('click', () => resumeFileInput.click());

        // Drag and drop event listeners
        analyzerDropZone.addEventListener('dragover', (e) => {
            e.preventDefault(); // Necessary to allow drop
            analyzerDropZone.classList.add('drag-over');
        });

        analyzerDropZone.addEventListener('dragleave', () => {
            analyzerDropZone.classList.remove('drag-over');
        });

        analyzerDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            analyzerDropZone.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                processResumeFile(files[0]);
            }
        });
    }

    // Listener for file selection via the hidden input
    if (resumeFileInput) {
        resumeFileInput.addEventListener('change', (e) => {
            const files = e.target.files;
            if (files.length > 0) {
                processResumeFile(files[0]);
            }
        });
    }

    // Listeners for closing the modal
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }
    if (resultModal) {
        resultModal.addEventListener('click', (e) => {
            // Close only if clicking on the overlay itself, not the content
            if (e.target === resultModal) {
                closeModal();
            }
        });
    }

    // --- Blog Loading Logic (Existing Logic) ---
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

    const knownPosts = [
        'it-finance-salary-data.html',
        'driver-salary-report-2026.html'
    ];

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
