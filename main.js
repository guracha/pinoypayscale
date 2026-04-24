import * as pdfjsLib from 'https://mozilla.github.io/pdf.js/build/pdf.mjs';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://mozilla.github.io/pdf.js/build/pdf.worker.mjs`;

// --- DOM Element Cache ---
document.addEventListener('DOMContentLoaded', () => {
    const ui = {
        navToggle: document.querySelector('.nav-toggle'),
        navMenu: document.querySelector('.nav-menu'),
        analyzerDropZone: document.getElementById('analyzer-drop-zone'),
        resumeFileInput: document.getElementById('resume-file-input'),
        fileNameDisplay: document.getElementById('file-name-display'),
        fileInfo: document.getElementById('file-info'),
        analyzeButton: document.getElementById('analyze-button'),
        resultModal: document.getElementById('result-modal'),
        modalContent: document.querySelector('.modal-content'),
        closeModalButton: document.querySelector('#result-modal .close-button'),
        salaryEstimateResult: document.getElementById('salary-estimate-result'),
        postListContainer: document.querySelector('#post-list-container ul'),
        postContentContainer: document.getElementById('post-content-container'),
        contactForm: document.getElementById('contact-form'),
        contactFormStatus: document.getElementById('contact-form-status'),
        salaryTicker: document.querySelector('.ticker-move'),
    };

    let userFile = null;

    // --- Event Listeners ---
    if (ui.navToggle) {
        ui.navToggle.addEventListener('click', () => {
            ui.navMenu.classList.toggle('active');
        });
    }

    if (ui.analyzerDropZone) {
        // Allow clicking anywhere on the drop zone to open the file dialog
        ui.analyzerDropZone.addEventListener('click', () => {
            ui.resumeFileInput.click();
        });

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            ui.analyzerDropZone.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        // Highlight drop zone when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            ui.analyzerDropZone.addEventListener(eventName, () => ui.analyzerDropZone.classList.add('border-indigo-600', 'bg-indigo-50'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            ui.analyzerDropZone.addEventListener(eventName, () => ui.analyzerDropZone.classList.remove('border-indigo-600', 'bg-indigo-50'), false);
        });

        ui.analyzerDropZone.addEventListener('drop', handleDrop, false);
    }

    if (ui.resumeFileInput) {
        ui.resumeFileInput.addEventListener('change', handleFileSelect);
    }

    if (ui.analyzeButton) {
        ui.analyzeButton.addEventListener('click', handleAnalysis);
    }

    if (ui.closeModalButton) {
        ui.closeModalButton.addEventListener('click', closeModal);
    }

    if (ui.resultModal) {
        ui.resultModal.addEventListener('click', (event) => {
            if (event.target === ui.resultModal) {
                closeModal();
            }
        });
    }
    
    if (ui.contactForm) {
        ui.contactForm.addEventListener('submit', handleContactFormSubmit);
    }

    // --- Functions ---

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    }

    function handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    }

    function handleFile(file) {
        userFile = file;
        ui.fileNameDisplay.textContent = `File "${file.name}"`;
        ui.fileInfo.style.display = 'block';
        console.log("File ready for analysis:", file.name);
    }

    async function handleAnalysis() {
        if (!userFile) {
            alert('Please select a resume file first.');
            return;
        }

        ui.salaryEstimateResult.innerHTML = `
            <div class="text-center">
                <i class="fas fa-spinner fa-spin text-4xl text-indigo-500"></i>
                <p class="mt-4 text-lg">Analyzing your resume...</p>
                <p class="text-sm text-slate-500">This might take a moment.</p>
            </div>`;
        openModal();

        try {
            const resumeText = await extractTextFromFile(userFile);
            // In a real app, you would send this text to a backend API
            // For this demo, we'll simulate the AI analysis
            console.log("Extracted Text:", resumeText.substring(0, 500)); // Log first 500 chars
            simulateAIAnalysis(resumeText);
        } catch (error) {
            console.error("Error during file processing or analysis:", error);
            ui.salaryEstimateResult.innerHTML = `
                <div class="text-center">
                     <i class="fas fa-exclamation-triangle text-4xl text-red-500"></i>
                     <p class="mt-4 text-lg font-bold">Analysis Failed</p>
                     <p class="text-sm text-slate-600">Could not process the resume file. Please try a different format or contact support.</p>
                </div>`;
        }
    }

    async function extractTextFromFile(file) {
        const extension = file.name.split('.').pop().toLowerCase();

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (event) => {
                try {
                    const arrayBuffer = event.target.result;
                    if (extension === 'pdf') {
                        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                        let text = '';
                        for (let i = 1; i <= pdf.numPages; i++) {
                            const page = await pdf.getPage(i);
                            const content = await page.getTextContent();
                            text += content.items.map(item => item.str).join(' ');
                        }
                        resolve(text);
                    } else if (extension === 'docx') {
                        const result = await mammoth.extractRawText({ arrayBuffer });
                        resolve(result.value);
                    } else { // txt and other simple text formats
                        resolve(new TextDecoder().decode(arrayBuffer));
                    }
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = (error) => reject(error);

            reader.readAsArrayBuffer(file);
        });
    }


    function simulateAIAnalysis(text) {
        // Simulate API call delay
        setTimeout(() => {
            // Basic keyword analysis for demonstration
            const skills = ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'AWS', 'Project Management', 'Agile'];
            const foundSkills = skills.filter(skill => new RegExp(`\\b${skill}\\b`, 'i').test(text));
            const experienceYears = text.match(/(\d+)\s*y(?:ears|ear)/i);
            let experience = experienceYears ? parseInt(experienceYears[1], 10) : Math.floor(Math.random() * 10);

            // Simple salary logic
            let baseSalary = 60000;
            let salary = baseSalary + (foundSkills.length * 15000) + (experience * 5000);
            let monthlySalary = Math.round(salary / 12 / 58) * 1000; // Rough USD to PHP conversion and rounding

            const resultHTML = `
                <h3 class="text-2xl font-bold text-center text-slate-800 mb-4">Your Estimated Salary Range</h3>
                <div class="text-center bg-indigo-50 rounded-lg p-6">
                    <p class="text-4xl font-extrabold text-indigo-600">₱${monthlySalary.toLocaleString()} / mo</p>
                    <p class="text-slate-500 mt-2">Based on our analysis for a similar role in the Philippines.</p>
                </div>
                <div class="mt-6">
                    <h4 class="font-bold text-slate-700">Key Skills Identified:</h4>
                    <div class="flex flex-wrap gap-2 mt-2">
                        ${foundSkills.length > 0 ? foundSkills.map(skill => `<span class="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-sm">${skill}</span>`).join('') : '<p class="text-sm text-slate-500">No specific skills from our list were found. Analysis was based on general content.</p>'}
                    </div>
                </div>
                <p class="text-xs text-center text-slate-400 mt-8">Disclaimer: This is an AI-generated estimate and should be used as a guide, not a guarantee.</p>
            `;

            ui.salaryEstimateResult.innerHTML = resultHTML;
        }, 2500);
    }

    function openModal() {
        ui.resultModal.classList.remove('hidden');
    }

    function closeModal() {
        ui.resultModal.classList.add('hidden');
    }

    async function handleContactFormSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const data = new FormData(form);
        
        ui.contactFormStatus.textContent = 'Sending...';

        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                ui.contactFormStatus.textContent = 'Thanks for your message! We will get back to you soon.';
                ui.contactFormStatus.style.color = 'lightgreen';
                form.reset();
            } else {
                const responseData = await response.json();
                if (responseData.errors) {
                    const errorMessages = responseData.errors.map(error => error.message).join(', ');
                    throw new Error(errorMessages);
                }
                throw new Error('An unknown error occurred.');
            }
        } catch (error) {
            ui.contactFormStatus.textContent = `Oops! There was a problem submitting your form: ${error.message}`;
            ui.contactFormStatus.style.color = 'coral';
        }
    }

    // --- Initial Data Loading ---

    function fetchPosts() {
        fetch('posts/index.json')
            .then(response => response.json())
            .then(posts => {
                ui.postListContainer.innerHTML = ''; // Clear existing list
                posts.forEach(post => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = `#${post.id}`;
                    a.textContent = post.title;
                    a.dataset.path = post.path;
                    li.appendChild(a);
                    ui.postListContainer.appendChild(li);
                });
                // Add click listener to the container for delegation
                ui.postListContainer.addEventListener('click', handlePostLinkClick);
            })
            .catch(error => {
                console.error('Error fetching posts:', error);
                ui.postListContainer.innerHTML = '<li>Failed to load posts.</li>';
            });
    }

    function handlePostLinkClick(event) {
        if (event.target.tagName === 'A') {
            event.preventDefault();
            const path = event.target.dataset.path;

            // Remove active class from all links and add to the clicked one
            ui.postListContainer.querySelectorAll('a').forEach(a => a.classList.remove('active'));
            event.target.classList.add('active');

            // Fetch and display post content
            fetch(path)
                .then(response => response.text())
                .then(htmlContent => {
                    ui.postContentContainer.innerHTML = htmlContent;
                    ui.postContentContainer.classList.remove('post-content-placeholder');
                })
                .catch(error => {
                    console.error('Error fetching post content:', error);
                    ui.postContentContainer.innerHTML = 'Error loading content.';
                });
        }
    }
    
    // Fetch and display salary ticker data
    function fetchSalaryData() {
        fetch('posts/index.json') // Assuming posts index has the data
            .then(response => response.json())
            .then(posts => {
                const salaryItems = posts.map(post => {
                    return `<li>${post.title} <strong>${post.salary}</strong></li>`;
                });
                ui.salaryTicker.innerHTML = salaryItems.join('');
            })
            .catch(error => console.error('Error fetching salary data for ticker:', error));
    }


    // --- Initialize Page ---
    fetchPosts();
    fetchSalaryData();
});
