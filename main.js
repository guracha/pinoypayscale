
document.addEventListener('DOMContentLoaded', function() {
    const statsContainer = document.getElementById('stats-container');

    fetch('salary_data.json')
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                statsContainer.innerHTML = ''; // Clear existing hardcoded stats
                // Display only a few items to avoid clutter
                const itemsToShow = data.slice(0, 6);
                itemsToShow.forEach(stat => {
                    const statCard = document.createElement('div');
                    statCard.className = 'stat-card';

                    const categorySpan = document.createElement('span');
                    // Use jobTitle from the new data structure
                    categorySpan.textContent = stat.jobTitle;

                    const salaryStrong = document.createElement('strong');
                    // Construct the salary range from salaryRangeLow and salaryRangeHigh
                    salaryStrong.textContent = `₱${stat.salaryRangeLow.toLocaleString()} - ₱${stat.salaryRangeHigh.toLocaleString()}`;

                    const rolePara = document.createElement('p');
                    // Combine experienceLevel and location for a descriptive role
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
});
