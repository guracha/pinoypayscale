
document.addEventListener('DOMContentLoaded', () => {
    // Load Salary Data for Dashboard
    fetch('salary_data.json')
        .then(response => response.json())
        .then(data => {
            const statsContainer = document.getElementById('stats-container');
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

    // Resume Scanner Logic
    const scanBtn = document.getElementById('scan-resume-btn');
    const resumeFile = document.getElementById('resume-file');
    const salaryEstimateDiv = document.getElementById('salary-estimate');

    scanBtn.addEventListener('click', () => {
        if (resumeFile.files.length === 0) {
            salaryEstimateDiv.textContent = 'Please select a TXT file.';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            const resumeText = event.target.result;
            // Simulate a call to a Cloud Function
            console.log("Simulating call to 'scan-resume' function with text:", resumeText.substring(0, 100) + "...");
            
            // This is a mock response. In a real scenario, you'd use fetch() to call the function.
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

    // Blog Loading Logic
    const postList = document.getElementById('post-list');
    const postContentContainer = document.getElementById('post-content-container');

    // Function to fetch and display a post
    function loadPost(fileName) {
        fetch(`posts/${fileName}`)
            .then(response => response.text())
            .then(html => {
                postContentContainer.innerHTML = html;
                // If the loaded content has its own scripts, you might need to handle them
            });
    }

    // Fetch the list of posts
    // In a real hosting environment, you might need a server-side script to list files.
    // For this static site, we'll hardcode the known posts.
    const knownPosts = [
        'it-finance-salary-data.html',
        'driver-salary-report-2026.html'
    ];

    knownPosts.forEach(fileName => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#`;
        // Extract a user-friendly title from the filename
        const title = fileName.replace(/-/g, ' ').replace('.html', '').replace(/\b\w/g, l => l.toUpperCase());
        link.textContent = title;
        link.onclick = (e) => {
            e.preventDefault();
            loadPost(fileName);
        };
        listItem.appendChild(link);
        postList.appendChild(listItem);
    });

    // Load the first post by default
    if (knownPosts.length > 0) {
        loadPost(knownPosts[0]);
    }
});
