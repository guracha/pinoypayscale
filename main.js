
document.addEventListener('DOMContentLoaded', () => {
    // --- COMMON ELEMENTS ---
    const dropZone = document.getElementById('analyzer-drop-zone');
    const fileInput = document.getElementById('resume-file-input');
    const analyzeButton = document.getElementById('analyze-button');
    const modal = document.getElementById('result-modal');
    const closeModalButton = document.querySelector('.close-button');
    const resultContainer = document.getElementById('salary-estimate-result');

    // --- RESUME ANALYZER LOGIC ---
    const handleFile = (file) => {
        if (!file) return;
        analyzeButton.style.display = 'block';
        dropZone.querySelector('p').textContent = `File selected: ${file.name}`;
        analyzeButton.onclick = () => {
            resultContainer.innerHTML = '<p class="text-center">Analyzing your resume...</p>';
            modal.style.display = 'flex';
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                if (file.type === "application/pdf") {
                    pdfjsLib.getDocument({ data: content }).promise.then(pdf => {
                        const promises = Array.from({ length: pdf.numPages }, (_, i) => pdf.getPage(i + 1).then(page => page.getTextContent()));
                        return Promise.all(promises);
                    }).then(textContents => {
                        const text = textContents.map(tc => tc.items.map(item => item.str).join(' ')).join('\n');
                        displayAnalysis(text);
                    });
                } else if (file.name.endsWith('.docx')) {
                    mammoth.extractRawText({ arrayBuffer: content })
                        .then(result => displayAnalysis(result.value))
                        .catch(err => { resultContainer.innerHTML = '<p class="text-center text-red-500">Error processing .docx file.</p>'; });
                } else {
                    displayAnalysis(content);
                }
            };
            if (file.type === "application/pdf" || file.name.endsWith('.docx')) {
                reader.readAsArrayBuffer(file);
            } else {
                reader.readAsText(file);
            }
        };
    };
    const displayAnalysis = (text) => {
        const keywords = {
            'senior developer': 150000, 'project manager': 120000, 'data scientist': 180000,
            'registered nurse': 45000, 'call center agent': 28000, 'driver': 25000,
        };
        let estimatedSalary = 40000, jobTitle = 'Entry-Level Professional';
        for (const [key, value] of Object.entries(keywords)) {
            if (text.toLowerCase().includes(key)) {
                estimatedSalary = value;
                jobTitle = key.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                break;
            }
        }
        estimatedSalary = Math.round(estimatedSalary * (0.85 + Math.random() * 0.3));
        setTimeout(() => {
            resultContainer.innerHTML = `
                <h3 class="text-xl font-bold text-center mb-4">Salary Analysis Complete</h3>
                <p class="text-center font-bold text-lg text-blue-600 mb-6">${jobTitle}</p>
                <p class="text-center text-sm uppercase font-bold text-gray-500">Est. Monthly Salary (PHP)</p>
                <p class="text-center text-5xl font-extrabold text-gray-800 mt-2 mb-4">₱${estimatedSalary.toLocaleString()}</p>
                <p class="text-xs text-center text-gray-500 italic mt-6">*Estimate based on market trends.</p>
            `;
        }, 2000);
    };
    dropZone.addEventListener('dragover', (e) => e.preventDefault());
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); });
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => handleFile(fileInput.files[0]));
    closeModalButton.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target === modal) { modal.style.display = 'none'; } };

    // --- BLOG SYSTEM LOGIC ---
    const postList = document.querySelector('#post-list-container ul');
    const postContentContainer = document.getElementById('post-content-container');
    window.myCharts = {}; // Global container for chart instances
    const availablePosts = [
        { title: '2026 PH Labor Market & Compensation Analysis', file: 'posts/labor-market-report-2026.html' },
        { title: '2026 Philippine Driver Salary & Labor Market', file: 'posts/driver-salary-report-2026.html' },
        { title: '2026 Kasambahay & Yaya Market Report', file: 'posts/kasambahay-report-2026.html' },
    ];
    const loadPost = (postFile) => {
        // Destroy all existing chart instances before loading new content
        Object.values(window.myCharts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        window.myCharts = {}; // Reset container for a clean slate

        postContentContainer.innerHTML = '<p>Loading post...</p>';
        fetch(postFile)
            .then(response => response.text())
            .then(html => {
                postContentContainer.innerHTML = html;
                const scriptTag = postContentContainer.querySelector('script');
                if (scriptTag) {
                    const newScript = document.createElement('script');
                    newScript.textContent = scriptTag.textContent;
                    document.body.appendChild(newScript).remove();
                }
            })
            .catch(error => {
                postContentContainer.innerHTML = '<p class="text-red-500">Error loading post.</p>';
                console.error('Error fetching post:', error);
            });
    };
    postList.innerHTML = '';
    availablePosts.forEach((post, index) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#post-${index}`;
        a.textContent = post.title;
        a.dataset.file = post.file;
        a.onclick = (e) => {
            e.preventDefault();
            document.querySelectorAll('#post-list-container a').forEach(link => link.classList.remove('active'));
            a.classList.add('active');
            loadPost(post.file);
        };
        li.appendChild(a);
        postList.appendChild(li);
    });
    if (availablePosts.length > 0) {
        const firstLink = postList.querySelector('a');
        firstLink.classList.add('active');
        loadPost(availablePosts[0].file);
    } else {
        postContentContainer.innerHTML = '<p>No posts available.</p>';
    }

    // --- SPA-like NAVIGATION LOGIC ---
    const mainSections = {
        hero: document.getElementById('hero'),
        analyzer: document.getElementById('resume-analyzer'),
        dashboard: document.getElementById('dashboard'),
        blog: document.getElementById('blog'),
        contact: document.getElementById('contact'),
    };
    const navHome = document.querySelector('header h1');

    function handleNavigation() {
        const hash = window.location.hash;
        Object.values(mainSections).forEach(section => {
            if (section) section.style.display = 'none';
        });

        if (hash.startsWith('#post')) {
             if (mainSections.blog) mainSections.blog.style.display = 'block';
        } else if (hash === '#blog') {
            if (mainSections.blog) mainSections.blog.style.display = 'block';
        } else if (hash === '#dashboard') {
            if (mainSections.dashboard) mainSections.dashboard.style.display = 'block';
        } else if (hash === '#contact') {
            if (mainSections.contact) mainSections.contact.style.display = 'block';
        } else {
            Object.values(mainSections).forEach(section => {
                if (section) section.style.display = 'block';
            });
        }
    }

    window.addEventListener('hashchange', handleNavigation);
    handleNavigation();

    if (navHome) {
        navHome.style.cursor = 'pointer';
        navHome.addEventListener('click', () => {
            window.location.hash = '';
        });
    }
});
