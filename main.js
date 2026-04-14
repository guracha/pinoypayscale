
document.addEventListener('DOMContentLoaded', function() {
    const statsContainer = document.getElementById('stats-container');
    const scanResumeBtn = document.getElementById('scan-resume-btn');
    const resumeFileInput = document.getElementById('resume-file');
    const salaryEstimateDiv = document.getElementById('salary-estimate');

    // Function to fetch and display salary data
    function fetchSalaryData() {
        fetch('salary_data.json')
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    statsContainer.innerHTML = ''; // Clear existing hardcoded stats
                    const itemsToShow = data.slice(0, 6);
                    itemsToShow.forEach(stat => {
                        const statCard = document.createElement('div');
                        statCard.className = 'stat-card';

                        const categorySpan = document.createElement('span');
                        categorySpan.textContent = stat.jobTitle;

                        const salaryStrong = document.createElement('strong');
                        salaryStrong.textContent = `₱${stat.salaryRangeLow.toLocaleString()} - ₱${stat.salaryRangeHigh.toLocaleString()}`;

                        const rolePara = document.createElement('p');
                        rolePara.textContent = `${stat.experienceLevel} in ${stat.location}`;

                        statCard.appendChild(categorySpan);
                        statCard.appendChild(salaryStrong);
                        statCard.appendChild(rolePara);

                        statsContainer.appendChild(statCard);
                    });
                } else {
                    statsContainer.innerHTML = '<p>No salary data available at the moment.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching salary data:', error);
                statsContainer.innerHTML = '<p>Could not load salary data.</p>';
            });
    }

    // Function to handle resume scanning
    function scanResume() {
        const file = resumeFileInput.files[0];
        if (!file) {
            salaryEstimateDiv.innerHTML = '<p>Please select a resume file first.</p>';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            const resumeText = event.target.result;
            estimateSalaryFromResume(resumeText);
        };
        reader.readAsText(file);
    }

    // Function to estimate salary from resume text
    function estimateSalaryFromResume(resumeText) {
        // For demonstration, we'll use a simple keyword matching logic.
        // In a real application, you would use a more sophisticated NLP model.
        const keywords = {
            "Software Engineer": ["software", "engineer", "developer"],
            "Product Manager": ["product", "manager"],
            "Data Analyst": ["data", "analyst", "analytics"],
            "UX/UI Designer": ["ux", "ui", "designer"]
        };

        const experienceLevels = {
            "Entry-level": ["entry", "junior", "fresh"],
            "Mid-level": ["mid", "intermediate"],
            "Senior-level": ["senior", "lead", "principal"]
        };

        let detectedJob = null;
        let detectedExperience = null;

        for (const job in keywords) {
            if (keywords[job].some(keyword => resumeText.toLowerCase().includes(keyword))) {
                detectedJob = job;
                break;
            }
        }

        for (const level in experienceLevels) {
            if (experienceLevels[level].some(keyword => resumeText.toLowerCase().includes(keyword))) {
                detectedExperience = level;
                break;
            }
        }

        if (detectedJob) {
            fetch('salary_data.json')
                .then(response => response.json())
                .then(data => {
                    const matchedSalaries = data.filter(entry => 
                        entry.jobTitle === detectedJob && 
                        (!detectedExperience || entry.experienceLevel === detectedExperience)
                    );

                    if (matchedSalaries.length > 0) {
                        // For simplicity, show the first match
                        const salary = matchedSalaries[0];
                        salaryEstimateDiv.innerHTML = `
                            <p>Based on your resume, we estimate your salary as a <strong>${salary.experienceLevel} ${salary.jobTitle}</strong> to be:</p>
                            <h3>₱${salary.salaryRangeLow.toLocaleString()} - ₱${salary.salaryRangeHigh.toLocaleString()}</h3>
                        `;
                    } else {
                        salaryEstimateDiv.innerHTML = '<p>Could not determine a salary estimate for the detected job role.</p>';
                    }
                });
        } else {
            salaryEstimateDiv.innerHTML = '<p>Could not determine job role from the resume.</p>';
        }
    }

    // Initial call to fetch salary data for the stats grid
    fetchSalaryData();

    // Event listener for the scan resume button
    if (scanResumeBtn) {
        scanResumeBtn.addEventListener('click', scanResume);
    }
});
