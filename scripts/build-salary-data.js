
const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');

const postsDir = path.join(__dirname, '..', 'posts');
const outputDir = path.join(__dirname, '..', 'dist');
const outputFilePath = path.join(outputDir, 'salary_data.json');

// Ensure the output directory exists
fs.ensureDirSync(outputDir);

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

        // ... (The data extraction logic remains the same as before)
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
                        const dataObject = new Function(`return ${match[1]}`)();
                        const experienceLabels = ['Entry Level', 'Mid-Level', 'Senior Level', 'Expert Level'];

                        for (const category in dataObject) {
                            const jobTitle = `Driver (${category.charAt(0).toUpperCase() + category.slice(1)})`;
                            const salaries = dataObject[category];
                            
                            salaries.forEach((salary, index) => {
                                if (experienceLabels[index]) {
                                    salaryData.push({
                                        jobTitle: jobTitle,
                                        experienceLevel: experienceLabels[index],
                                        salaryRangeLow: salary, 
                                        salaryRangeHigh: salary + 5000, 
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

    // 1. Write the salary data to the dist directory
    const uniqueSalaryData = Array.from(new Set(salaryData.map(e => JSON.stringify(e))))
        .map(e => JSON.parse(e));
    fs.writeFileSync(outputFilePath, JSON.stringify(uniqueSalaryData, null, 2), 'utf-8');
    console.log(`Successfully generated salary_data.json with ${uniqueSalaryData.length} entries.`);

    // 2. Copy all necessary static files and folders to the dist directory
    const projectRoot = path.join(__dirname, '..');
    const filesToCopy = ['index.html', 'style.css', 'main.js', 'job_data.json'];
    
    filesToCopy.forEach(file => {
        fs.copySync(path.join(projectRoot, file), path.join(outputDir, file));
        console.log(`Copied ${file} to dist.`);
    });

    // 3. Copy the posts directory recursively
    fs.copySync(postsDir, path.join(outputDir, 'posts'));
    console.log('Copied posts directory to dist.');

    console.log('Build process complete. The `dist` directory is ready for deployment.');
});

