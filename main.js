
document.addEventListener('DOMContentLoaded', () => {
    // --- COMMON ELEMENTS ---
    const dropZone = document.getElementById('analyzer-drop-zone');
    const fileInput = document.getElementById('resume-file-input');
    const analyzeButton = document.getElementById('analyze-button');
    const modal = document.getElementById('result-modal');
    const closeModalButton = document.querySelector('.close-button');
    const resultContainer = document.getElementById('salary-estimate-result');

    // --- RESUME ANALYZER LOGIC ---

    // Function to handle file selection and analysis
    const handleFile = (file) => {
        if (!file) return;
        
        // Show the analyze button and update text
        analyzeButton.style.display = 'block';
        dropZone.querySelector('p').textContent = `File selected: ${file.name}`;

        analyzeButton.onclick = () => {
            resultContainer.innerHTML = '<p class="text-center">Analyzing your resume... This may take a moment.</p>';
            modal.style.display = 'flex';

            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                let textContent = '';

                if (file.type === "application/pdf") {
                    // Use PDF.js for PDF files
                    pdfjsLib.getDocument({ data: content }).promise.then(pdf => {
                        let text = '';
                        const numPages = pdf.numPages;
                        const promises = [];
                        for (let i = 1; i <= numPages; i++) {
                            promises.push(pdf.getPage(i).then(page => page.getTextContent()));
                        }
                        return Promise.all(promises);
                    }).then(textContents => {
                        textContents.forEach(textContent => {
                            textContent.items.forEach(item => {
                                text += item.str + ' ';
                            });
                            text += '\n';
                        });
                        displayAnalysis(text);
                    });
                } else if (file.name.endsWith('.docx')) {
                     // Use mammoth.js for DOCX files
                    mammoth.extractRawText({ arrayBuffer: content })
                        .then(result => {
                            displayAnalysis(result.value);
                        })
                        .catch(err => {
                             resultContainer.innerHTML = '<p class="text-center text-red-500">Error processing .docx file.</p>';
                             console.error(err);
                        });
                } else {
                    // Plain text
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
    
    // Simulate AI analysis and display results
    const displayAnalysis = (text) => {
        // Simple keyword-based estimation for demonstration
        const keywords = {
            'senior developer': 150000,
            'project manager': 120000,
            'data scientist': 180000,
            'registered nurse': 45000,
            'call center agent': 28000,
            'driver': 25000,
        };

        let estimatedSalary = 40000; // Default base
        let jobTitle = 'Entry-Level Professional';

        for (const [key, value] of Object.entries(keywords)) {
            if (text.toLowerCase().includes(key)) {
                estimatedSalary = value;
                jobTitle = key.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                break;
            }
        }
        
        // Add some variability
        estimatedSalary = Math.round(estimatedSalary * (0.85 + Math.random() * 0.3));

        setTimeout(() => {
            resultContainer.innerHTML = `
                <h3 class="text-xl font-bold text-center mb-4">Salary Analysis Complete</h3>
                <p class="text-center text-sm mb-2">Based on your resume, we identified the likely role of:</p>
                <p class="text-center font-bold text-lg text-blue-600 mb-6">${jobTitle}</p>
                <p class="text-center text-sm uppercase font-bold text-gray-500">Estimated Monthly Salary (PHP)</p>
                <p class="text-center text-5xl font-extrabold text-gray-800 mt-2 mb-4">₱${estimatedSalary.toLocaleString()}</p>
                <p class="text-xs text-center text-gray-500 italic mt-6">*This is a rough estimate based on limited data and market trends.</p>
            `;
        }, 2000);
    };

    // Event listeners for file drop and click
    dropZone.addEventListener('dragover', (e) => e.preventDefault());
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        handleFile(e.dataTransfer.files[0]);
    });
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => handleFile(fileInput.files[0]));

    // Modal close functionality
    closeModalButton.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };
});
