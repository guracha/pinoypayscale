
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const postsDir = path.join(__dirname, '..', 'posts');
const outputFilePath = path.join(__dirname, '..', 'salary_data.json');

let salaryData = [];

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

        // Strategy 1: Find data in tables
        let foundDataInTable = false;
        $('table').each((i, table) => {
            const jobCategory = $(table).prevAll('h3').first().text().trim().replace(/^[A-Z]\.\s/, '');
            if (!jobCategory) return;

            const rows = $(table).find('tr');
            if (rows.length < 2) return;

            const headers = [];
            $(rows[0]).find('th').each((i, header) => {
                headers[i] = $(header).text().trim();
            });

            const jobLevelIndex = headers.indexOf('Job Level');
            const salaryIndex = headers.indexOf('Salary Range (Monthly)');

            if (jobLevelIndex !== -1 && salaryIndex !== -1) {
                foundDataInTable = true;
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
            }
        });

        // Strategy 2: Find data in script tags if no tables were found
        if (!foundDataInTable) {
            $('script').each((i, script) => {
                const scriptContent = $(script).html();
                const match = /const data = ({[^;]+});/.exec(scriptContent);

                if (match && match[1]) {
                    try {
                        // This is a bit risky, but necessary for this specific script structure.
                        // We'll wrap it in a Function constructor to parse the object literal.
                        const dataObject = new Function(`return ${match[1]}`)();
                        const experienceLabels = ['Entry Level', 'Mid-Level', 'Senior Level', 'Expert Level']; // Assume this order

                        for (const category in dataObject) {
                            const jobTitle = `Driver (${category.charAt(0).toUpperCase() + category.slice(1)})`;
                            const salaries = dataObject[category];
                            
                            salaries.forEach((salary, index) => {
                                if (experienceLabels[index]) {
                                    // In this file, the data is a single value, not a range.
                                    // We'll create a small artificial range for consistency.
                                    salaryData.push({
                                        jobTitle: jobTitle,
                                        experienceLevel: experienceLabels[index],
                                        salaryRangeLow: salary, 
                                        salaryRangeHigh: salary + 5000, // Create a small range
                                        location: "Philippines"
                                    });
                                }
                            });
                        }
                    } catch (e) {
                        console.error(`Error parsing script data in ${file}:`, e);
                    }
                }
            });
        }
    });

    // Remove duplicates before writing
    const uniqueSalaryData = Array.from(new Set(salaryData.map(e => JSON.stringify(e))))
        .map(e => JSON.parse(e));

    fs.writeFileSync(outputFilePath, JSON.stringify(uniqueSalaryData, null, 2), 'utf-8');
    console.log(`Successfully generated salary_data.json with ${uniqueSalaryData.length} entries.`);
});
