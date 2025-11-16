const express = require('express');
const path = require('path');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

// Ensure API_KEY is set in the Cloud Function's environment variables
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-pro';
const app = express();

// Middleware
app.use(express.json({ limit: '10mb' })); // For parsing application/json
app.use(cors()); // Enable CORS for the API endpoint

const prompt = `
You are an expert OCR and image analysis tool. Your task is to analyze an image containing a 3x3 grid of countries and format the output with perfect column alignment.

Follow these instructions precisely:
1. The image contains a 3x3 grid.
2. Each cell in the grid might contain a country's flag and its name, or it might be empty.
3. Your output MUST be a plain text representation of this 3x3 grid.
4. For each cell that contains a country, extract its flag as a single emoji character and the country's name. Combine them as "emoji name".
5. For each cell that is empty, you MUST represent it as "❌ -".
6. Maintain the exact 3x3 structure using newlines to separate the three rows.

7. **Column Alignment is CRITICAL.** All columns must be perfectly aligned vertically and do not overlap EVER. To achieve this:
   a. After identifying the content for all 9 cells, determine the maximum character length for each of the three columns. For example, if the first column has "🇬🇧 UK", "❌ -", and "🇺🇸 United States", the length each column should have is determined by "🇺🇸 United States".
   b. Pad the text in each cell with trailing spaces so that every cell in the same column has the exact same character length (equal to the maximum length for that column).
   c. Join the padded cells in each row with exactly two spaces between columns.

8. Do NOT add any extra explanations, titles, or markdown formatting like \`\`\`. Your entire response should be only the 9-cell grid text.

Example of perfectly aligned output (notice how countries that come to the right of the lines are padded with spaces between the end of the name of the prior country to align vertically):
🇬🇧 UK              🇨🇦 Canada    🇯🇵 Japan
🇺🇸 United States   ❌ -        🇫🇷 France
🇮🇹 Italy           🇩🇪 Germany   🇲🇽 Mexico
`;

// API route for image extraction
app.post('/api/extractGrid', async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64 || !mimeType) {
      return res.status(400).send('Missing imageBase64 or mimeType in request body.');
    }

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    };

    const textPart = {
      text: prompt,
    };

    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [imagePart, textPart] }
    });
    
    res.status(200).json({ text: response.text.trim() });

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).send('Failed to process the image with the AI model.');
  }
});

// Options for express.static to handle .ts/.tsx files
const staticOptions = {
  setHeaders: (res, filePath) => {
    // Set correct MIME type for TypeScript/TSX files for browser modules
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      res.setHeader('Content-Type', 'text/javascript');
    }
  },
};

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public'), staticOptions));

// For any other GET request, send the index.html file to support client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Export the express app as a Google Cloud Function
exports.extractGrid = app;