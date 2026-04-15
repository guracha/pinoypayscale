
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  systemInstruction: `너는 필리핀 채용 시장 데이터 전문 추출기야. 내가 제공하는 HTML 원문을 분석해서 아래 구조의 JSON 데이터로만 응답해. 마크다운이나 다른 부연 설명은 절대 금지.
   {
     \"jobTitle\": \"Job Name (English)\",
     \"baseSalary\": {
       \"entry\": { \"min\": 0, \"max\": 0 },
       \"mid\": { \"min\": 0, \"max\": 0 },
       \"senior\": { \"min\": 0, \"max\": 0 }
     },
     \"skillModifiers\": [
       { \"skill\": \"Skill Name\", \"bonusPercentage\": 0.0 }
     ]
   }`,
});

async function extractSalaryData() {
  const postsDir = path.join(__dirname, '../posts');
  const files = await fs.readdir(postsDir);
  const salaryData = [];

  for (const file of files) {
    if (path.extname(file) === '.html') {
      const filePath = path.join(postsDir, file);
      try {
        const htmlContent = await fs.readFile(filePath, 'utf-8');
        const result = await model.generateContent(htmlContent);
        const response = await result.response;
        const text = await response.text();
        salaryData.push(JSON.parse(text));
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      }
    }
  }

  const outputPath = path.join(__dirname, '../salary_data.json');
  await fs.writeFile(outputPath, JSON.stringify(salaryData, null, 2));
  console.log('Salary data has been successfully built.');
}

extractSalaryData();
