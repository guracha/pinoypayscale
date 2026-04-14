
// functions/scan-resume.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// This is a Cloudflare Pages Function that handles POST requests to /scan-resume.
export async function onRequestPost(context) {
    try {
        // 1. Get Resume & API Key
        const resumeText = await context.request.text();
        // The API key is stored as an environment variable in Cloudflare Pages.
        const genAI = new GoogleGenerativeAI(context.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // 2. Fetch Salary Data from the project's assets
        const siteUrl = new URL(context.request.url);
        const salaryDataUrl = `${siteUrl.origin}/salary_data.json`;
        const salaryResponse = await fetch(salaryDataUrl);
        if (!salaryResponse.ok) {
            throw new Error(`Failed to fetch salary data: ${salaryResponse.statusText}`);
        }
        const salaryData = await salaryResponse.json();

        // 3. Use Gemini to Extract Job Info from Resume
        const jobTitles = [...new Set(salaryData.map(item => item.jobTitle))].join(", ");
        const experienceLevels = [...new Set(salaryData.map(item => item.experienceLevel))].join(", ");

        const prompt = `
            Analyze the following resume text and determine the most likely job title and experience level.

            **Resume Text:**
            "${resumeText}"

            **Instructions:**
            1.  **Job Title:** Identify the most fitting job title from this list: [${jobTitles}]. If no suitable title is found, respond with "Unknown".
            2.  **Experience Level:** Identify the most fitting experience level from this list: [${experienceLevels}]. If no suitable level is found, respond with "Unknown".

            **Return your answer in a pure JSON format like this: {"jobTitle": "...". "experienceLevel": "..."}.**
        `;

        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();
        const extractedInfo = JSON.parse(responseText.replace(/```json|```/g, '').trim());

        if (extractedInfo.jobTitle === "Unknown" || extractedInfo.experienceLevel === "Unknown") {
            return new Response(JSON.stringify({ message: 'Could not determine job role or experience level from the resume.' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 404
            });
        }

        // 4. Find the matching salary in the data
        const matchedEntry = salaryData.find(entry =>
            entry.jobTitle === extractedInfo.jobTitle &&
            entry.experienceLevel === extractedInfo.experienceLevel
        );

        let estimate;
        if (matchedEntry) {
            estimate = {
                jobTitle: matchedEntry.jobTitle,
                experienceLevel: matchedEntry.experienceLevel,
                salaryRangeLow: matchedEntry.salaryRangeLow,
                salaryRangeHigh: matchedEntry.salaryRangeHigh,
            };
        } else {
            // Fallback if a direct match isn't found, though Gemini should return matching values.
            estimate = {
                message: 'A salary estimate could not be found for the identified job role and experience.'
            };
        }

        // 5. Return the final estimate
        return new Response(JSON.stringify(estimate), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Error in scan-resume function:", error);
        return new Response(JSON.stringify({ message: 'An internal error occurred: ' + error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
