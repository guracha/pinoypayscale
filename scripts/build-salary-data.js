
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const postsDir = path.join(__dirname, '..', 'posts');
const outputFilePath = path.join(__dirname, '..', 'salary_data.json');

let salaryData = [];

// Read all files in the posts directory
fs.readdir(postsDir, (err, files) => {
    if (err) {
        console.error('Error reading posts directory:', err);
        return;
    }

    files.forEach(file => {
        if (path.extname(file) !== '.html') return;

        const filePath = path.join(postsDir, file);
        const htmlContent = fs.readFileSync(filePath, 'utf-8');
        const $ = cheerio.load(htmlContent);

        // Find all tables and extract data
        $('table').each((i, table) => {
            // The job category is in the h3 tag right before the table
            const jobCategory = $(table).prevAll('h3').first().text().trim().replace(/^[A-Z]\.\s/, '');
            if (!jobCategory) return;

            const rows = $(table).find('tr');
            if (rows.length < 2) return; // Skip empty tables

            const headers = [];
            $(rows[0]).find('th').each((i, header) => {
                headers[i] = $(header).text().trim();
            });

            const jobLevelIndex = headers.indexOf('Job Level');
            const salaryIndex = headers.indexOf('Salary Range (Monthly)');

            if (jobLevelIndex === -1 || salaryIndex === -1) return;

            for (let i = 1; i < rows.length; i++) {
                const cells = $(rows[i]).find('td');
                const experienceLevel = $(cells[jobLevelIndex]).text().trim();
                const salaryRangeStr = $(cells[salaryIndex]).text().trim();

                const salaryParts = salaryRangeStr.split('–').map(s => s.trim());
                if (salaryParts.length !== 2) continue;

                const salaryRangeLow = parseInt(salaryParts[0].replace(/[^0-9]/g, ''), 10);
                const salaryRangeHigh = parseInt(salaryParts[1].replace(/[^0-9]/g, ''), 10);

                if (!isNaN(salaryRangeLow) && !isNaN(salaryRangeHigh)) {
                    salaryData.push({
                        jobTitle: jobCategory,
                        experienceLevel: experienceLevel,
                        salaryRangeLow: salaryRangeLow,
                        salaryRangeHigh: salaryRangeHigh,
                        location: "Philippines"
                    });
                }
            }
        });
    });

    // Write the combined data to salary_data.json
    fs.writeFileSync(outputFilePath, JSON.stringify(salaryData, null, 2), 'utf-8');
    console.log(`Successfully generated salary_data.json with ${salaryData.length} entries.`);
});
