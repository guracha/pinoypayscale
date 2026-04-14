
document.addEventListener('DOMContentLoaded', () => {

    // --- Scrolling Salary Dashboard --- 
    const dashboard = document.getElementById('dashboard');
    // Replace the grid with a scrolling wrapper
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

    // --- Resume Scanner Logic ---
    const scanBtn = document.getElementById('scan-resume-btn');
    const resumeFile = document.getElementById('resume-file');
    const salaryEstimateDiv = document.getElementById('salary-estimate');

    if (scanBtn) {
        scanBtn.addEventListener('click', () => {
            if (resumeFile.files.length === 0) {
                salaryEstimateDiv.textContent = 'Please select a TXT file.';
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                const resumeText = event.target.result;
                console.log("Simulating call to 'scan-resume' function with text:", resumeText.substring(0, 100) + "...");
                const mockResponse = {
                    jobTitle: "Senior Software Engineer",
                    estimatedSalary: "₱150,000 - ₱200,000"
                };
                salaryEstimateDiv.innerHTML = `
                    <p><strong>Identified Role:</strong> ${mockResponse.jobTitle}</p>
                    <p><strong>Estimated Salary Range:</strong> ${mockResponse.estimatedSalary}</p>
                `;
            };
            reader.readAsText(resumeFile.files[0]);
        });
    }

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
