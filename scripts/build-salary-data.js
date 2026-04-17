const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const postsDirectory = path.join(__dirname, '..', 'posts');
const outputDirectory = path.join(__dirname, '..', 'public', 'data');
const outputFile = path.join(outputDirectory, 'salaries.json');

async function getSalaryData(text) {
    const prompt = `From the following job posting text, extract the salary information and return it as a structured JSON object. The object should contain 'minimum' and 'maximum' salary fields. If only one number is mentioned, use it for both fields. If no salary is mentioned, return null. Text: ${text}`;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const content = response.text();
        return JSON.parse(content);
    } catch (error) {
        console.error('Error contacting Generative AI:', error);
        return null;
    }
}

async function buildSalaryData() {
    try {
        await fs.ensureDir(outputDirectory);
        const files = await fs.readdir(postsDirectory);
        const salaryData = [];

        for (const file of files) {
            if (path.extname(file) === '.html') {
                const filePath = path.join(postsDirectory, file);
                const fileContent = await fs.readFile(filePath, 'utf8');
                const $ = cheerio.load(fileContent);
                const postText = $('body').text();

                const salary = await getSalaryData(postText);
                if (salary) {
                    salaryData.push({
                        post: file,
                        ...salary
                    });
                }
            }
        }

        await fs.writeJson(outputFile, salaryData, { spaces: 2 });
        console.log('Salary data has been successfully built!');

    } catch (error) {
        console.error('An error occurred during the build process:', error);
    }
}

buildSalaryData();