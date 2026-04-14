
document.addEventListener('DOMContentLoaded', function() {
    const statsContainer = document.getElementById('stats-container');
    const scanResumeBtn = document.getElementById('scan-resume-btn');
    const resumeFileInput = document.getElementById('resume-file');
    const salaryEstimateDiv = document.getElementById('salary-estimate');

    // Function to fetch and display salary data for the grid
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

    // Function to handle resume scanning by calling the backend function
    function scanResume() {
        const file = resumeFileInput.files[0];
        if (!file) {
            salaryEstimateDiv.innerHTML = '<p>Please select a resume file first.</p>';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            const resumeText = event.target.result;
            salaryEstimateDiv.innerHTML = '<p>Scanning your resume...</p>';

            // Call the Cloudflare Pages Function
            fetch('/scan-resume', {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: resumeText,
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errorInfo => {
                        throw new Error(errorInfo.message || 'Server responded with an error.');
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.jobTitle) {
                    salaryEstimateDiv.innerHTML = `
                        <p>Based on your resume, we estimate your salary as a <strong>${data.experienceLevel} ${data.jobTitle}</strong> to be:</p>
                        <h3>₱${data.salaryRangeLow.toLocaleString()} - ₱${data.salaryRangeHigh.toLocaleString()}</h3>
                    `;
                } else {
                    salaryEstimateDiv.innerHTML = `<p>${data.message || 'Could not get an estimate.'}</p>`;
                }
            })
            .catch(error => {
                console.error('Error scanning resume:', error);
                salaryEstimateDiv.innerHTML = `<p>An error occurred: ${error.message}</p>`;
            });
        };
        reader.readAsText(file);
    }

    // Initial call to fetch salary data for the stats grid
    fetchSalaryData();

    // Event listener for the scan resume button
    if (scanResumeBtn) {
        scanResumeBtn.addEventListener('click', scanResume);
    }
});
