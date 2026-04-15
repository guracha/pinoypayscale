document.addEventListener('DOMContentLoaded', () => {

    // --- CACHE DOM ELEMENTS --- //
    const elements = {
        // Resume Analyzer
        analyzerSection: document.getElementById('resume-analyzer'),
        dropZone: document.getElementById('analyzer-drop-zone'),
        fileInput: document.getElementById('resume-file-input'),
        fileInfo: document.getElementById('file-info'),
        fileNameDisplay: document.getElementById('file-name-display'),
        analyzeButton: document.getElementById('analyze-button'),
        modal: document.getElementById('result-modal'),
        closeModalButton: document.querySelector('#result-modal .close-button'),
        resultContainer: document.getElementById('salary-estimate-result'),
        
        // Blog
        blogSection: document.getElementById('blog'),
        postList: document.querySelector('#post-list-container ul'),
        postContentContainer: document.getElementById('post-content-container'),

        // Contact Form
        contactForm: document.getElementById('contact-form'),
        contactFormStatus: document.getElementById('contact-form-status'),

        // Navigation
        header: document.querySelector('header'),
        navHome: document.querySelector('header h1'),
        navLinks: document.querySelectorAll('header nav a[href^="#"]')
    };

    window.myCharts = {}; // Global container for chart instances

    const availablePosts = [
        { title: '2026 PH Labor Market & Compensation Analysis', file: 'posts/labor-market-report-2026.html' },
        { title: '2026 Philippine Driver Salary & Labor Market Analysis', file: 'posts/driver-salary-report-2026.html' },
        { title: '2026 Kasambahay & Yaya Market Report', file: 'posts/kasambahay-report-2026.html' }
    ];

    // --- RESUME ANALYZER --- //

    function handleFile(file) {
        if (!file) {
            elements.fileInfo.style.display = 'none';
            return;
        }
        elements.fileNameDisplay.textContent = file.name;
        elements.fileInfo.style.display = 'block';
    }

    function displayAnalysis(text) {
        const keywords = {
            'senior software developer': 115000, 'cloud architect': 160000, 'project manager': 120000,
            'data scientist': 180000, 'fp&a manager': 72500, 'senior tech support': 120000,
            'data analyst': 32500, 'registered nurse': 27000, 'customer service': 24000,
            'call center': 28000, 'driver': 25000,
        };
        let estimatedSalary = 40000, jobTitle = 'Entry-Level Professional';
        for (const [key, value] of Object.entries(keywords)) {
            if (text.toLowerCase().includes(key)) {
                estimatedSalary = value;
                jobTitle = key.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                break;
            }
        }
        estimatedSalary = Math.round(estimatedSalary * (0.9 + Math.random() * 0.2));
        
        setTimeout(() => {
            elements.resultContainer.innerHTML = `
                <h3 class="text-2xl font-bold text-center text-slate-800 mb-2">Salary Analysis Complete</h3>
                <p class="text-center text-lg text-slate-600 mb-6">Based on your resume, we identified a potential role of:</p>
                <p class="text-center font-bold text-2xl text-indigo-600 mb-4">${jobTitle}</p>
                <div class="bg-slate-100 rounded-lg p-6 my-4">
                    <p class="text-center text-sm uppercase font-bold text-slate-500">Estimated Monthly Salary (PHP)</p>
                    <p class="text-center text-5xl font-extrabold text-slate-900 mt-2 mb-2">₱${estimatedSalary.toLocaleString()}</p>
                </div>
                <p class="text-xs text-center text-slate-500 italic mt-6">*This is an AI-generated estimate based on current market data and may vary.</p>
            `;
        }, 1500);
    }

    function analyzeResume(file) {
        elements.resultContainer.innerHTML = `
            <div class="text-center">
                <i class="fas fa-circle-notch fa-spin text-4xl text-indigo-500"></i>
                <p class="mt-4 text-lg font-medium text-slate-700">Analyzing your resume...</p>
                <p class="text-sm text-slate-500">This may take a moment.</p>
            </div>`;
        elements.modal.classList.add('active');

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            let textPromise;
            if (file.type === "application/pdf") {
                textPromise = pdfjsLib.getDocument({ data: content }).promise.then(pdf => Promise.all(
                    Array.from({ length: pdf.numPages }, (_, i) => pdf.getPage(i + 1).then(p => p.getTextContent()))
                )).then(contents => contents.map(tc => tc.items.map(i => i.str).join(' ')).join('\n'));
            } else if (file.name.endsWith('.docx')) {
                textPromise = mammoth.extractRawText({ arrayBuffer: content }).then(r => r.value);
            } else {
                textPromise = Promise.resolve(content);
            }
            textPromise.then(displayAnalysis).catch(err => {
                elements.resultContainer.innerHTML = '<p class="text-center text-red-500">Error processing file. Please try another.</p>';
                console.error("File processing error:", err);
            });
        };
        reader.readAsArrayBuffer(file);
    }

    // --- BLOG SYSTEM --- //

    function loadPost(postFile) {
        if (!postFile || !elements.postContentContainer) return;
        
        elements.postContentContainer.classList.remove('post-content-placeholder');
        elements.postContentContainer.innerHTML = '<div class="p-8 text-center"><i class="fas fa-circle-notch fa-spin text-3xl text-indigo-500"></i><p class="mt-3">Loading Post...</p></div>';

        Object.values(window.myCharts).forEach(chart => chart?.destroy());
        window.myCharts = {};

        fetch(postFile)
            .then(response => response.ok ? response.text() : Promise.reject(response.statusText))
            .then(html => {
                elements.postContentContainer.innerHTML = html;
                const scriptTag = elements.postContentContainer.querySelector('script');
                if (scriptTag) {
                    const newScript = document.createElement('script');
                    newScript.textContent = scriptTag.textContent;
                    document.body.appendChild(newScript).remove();
                }
            })
            .catch(error => {
                elements.postContentContainer.innerHTML = '<p class="p-4 text-center text-red-500">Error loading post. Please try again later.</p>';
                console.error('Error fetching post:', error);
            });
    }

    function initializeBlog() {
        if (!elements.postList) return;
        elements.postList.innerHTML = '';
        availablePosts.forEach((post, index) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#post-${index}`;
            a.textContent = post.title;
            a.dataset.file = post.file;
            li.appendChild(a);
            elements.postList.appendChild(li);
        });
    }

    // --- CONTACT FORM --- //
    async function handleContactFormSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const data = new FormData(form);
        const status = elements.contactFormStatus;

        status.innerHTML = 'Sending...';
        status.style.color = 'inherit';

        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                status.innerHTML = "Thanks for your message! We'll be in touch soon.";
                status.style.color = 'green';
                form.reset();
            } else {
                const responseData = await response.json();
                if (Object.hasOwn(responseData, 'errors')) {
                    status.innerHTML = responseData["errors"].map(error => error["message"]).join(", ");
                } else {
                    status.innerHTML = "Oops! There was a problem submitting your form.";
                }
                 status.style.color = 'red';
            }
        } catch (error) {
            status.innerHTML = "Oops! There was a problem submitting your form.";
            status.style.color = 'red';
        }
    }


    // --- NAVIGATION & ROUTING (REVISED & IMPROVED) --- //

    function getHeaderHeight() {
        return elements.header ? elements.header.offsetHeight : 80;
    }

    function customScrollTo(targetElement) {
        if (!targetElement) return;
        const headerHeight = getHeaderHeight();
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20; // 20px extra padding

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
    
    function handleNavigation(hash) {
        if (!hash || hash === '#') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const targetId = hash.substring(1);

        if (targetId.startsWith('post-')) {
            const postIndex = parseInt(targetId.replace('post-', ''), 10);
            if (postIndex >= 0 && postIndex < availablePosts.length) {
                const postLink = elements.postList.querySelector(`a[href="#post-${postIndex}"]`);
                
                if (postLink && !postLink.classList.contains('active')) {
                    document.querySelectorAll('#post-list-container a').forEach(link => link.classList.remove('active'));
                    postLink.classList.add('active');
                    loadPost(postLink.dataset.file);
                }
                
                // Scroll to the blog section itself, not the post content
                customScrollTo(elements.blogSection);
            }
        } else {
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                customScrollTo(targetElement);
            }
        }
    }

    // --- EVENT LISTENERS --- //

    // Resume Analyzer Events
    if (elements.dropZone) {
        elements.dropZone.addEventListener('dragenter', e => { e.preventDefault(); elements.dropZone.classList.add('drag-over'); });
        elements.dropZone.addEventListener('dragover', e => { e.preventDefault(); elements.dropZone.classList.add('drag-over'); });
        elements.dropZone.addEventListener('dragleave', e => { e.preventDefault(); elements.dropZone.classList.remove('drag-over'); });
        elements.dropZone.addEventListener('drop', e => {
            e.preventDefault();
            elements.dropZone.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                elements.fileInput.files = files;
                handleFile(files[0]);
            }
        });
        elements.dropZone.addEventListener('click', () => elements.fileInput.click());
        elements.fileInput.addEventListener('change', () => handleFile(elements.fileInput.files[0]));
        elements.analyzeButton.addEventListener('click', () => {
            const file = elements.fileInput.files[0];
            if (file) analyzeResume(file);
        });
        elements.closeModalButton.addEventListener('click', () => elements.modal.classList.remove('active'));
        elements.modal.addEventListener('click', e => {
            if (e.target === elements.modal) elements.modal.classList.remove('active');
        });
    }

    // Contact Form Event
    if (elements.contactForm) {
        elements.contactForm.addEventListener('submit', handleContactFormSubmit);
    }

    // Navigation Events
    document.body.addEventListener('click', e => {
        const anchor = e.target.closest('a');
        if (!anchor) return;

        const href = anchor.getAttribute('href');
        
        // Handle header home click
        if (anchor.parentElement.tagName === 'H1') {
            e.preventDefault();
            history.pushState(null, '', ' ');
            handleNavigation('#');
            return;
        }

        if (href && href.startsWith('#')) {
            e.preventDefault();
            history.pushState(null, '', href);
            handleNavigation(href);
        }
    });

    window.addEventListener('popstate', () => {
        handleNavigation(window.location.hash);
    });

    // --- INITIALIZATION --- //
    function initializeApp() {
        initializeBlog();
        
        // Handle initial page load based on URL
        const initialHash = window.location.hash;
        if (initialHash) {
            handleNavigation(initialHash);
        } else {
            // Load the first post by default if no hash
            const firstPost = availablePosts[0];
            if (firstPost) {
                const firstLink = elements.postList.querySelector(`a[data-file="${firstPost.file}"]`);
                if(firstLink) {
                    firstLink.classList.add('active');
                    // Use replaceState to not pollute history on first load
                    history.replaceState(null, '', firstLink.href); 
                    loadPost(firstPost.file);
                }
            }
        }
    }

    initializeApp();
});