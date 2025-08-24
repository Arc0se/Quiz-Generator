require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/generate-mcqs', async (req, res) => {
  try {
    const { prompt, count = 10 } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    if (count < 1 || count > 50) {
      return res.status(400).json({ error: 'Count must be between 1 and 50' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const enhancedPrompt = `Generate exactly ${count} multiple-choice questions based on:\n${prompt}\n\nFormat each as: ["question", ["option1", "option2", "option3", "option4"], correctIndex]\nOnly return a valid JSON array, no other text or markdown.`;
    
    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      // First attempt to parse directly
      const parsedResponse = JSON.parse(text.trim());
      
      if (!Array.isArray(parsedResponse)) {
        throw new Error('Response is not an array');
      }
      
      const validatedMCQs = parsedResponse.map(item => {
        if (!Array.isArray(item) || item.length !== 3) {
          throw new Error('Invalid question format');
        }
        if (typeof item[0] !== 'string') {
          throw new Error('Question must be a string');
        }
        if (!Array.isArray(item[1]) || item[1].length !== 4) {
          throw new Error('Options must be an array of 4 strings');
        }
        if (typeof item[2] !== 'number' || item[2] < 0 || item[2] > 3) {
          throw new Error('Correct index must be between 0 and 3');
        }
        return item;
      });

      return res.json({ mcqs: validatedMCQs });
    } catch (parseError) {
      console.error('Parsing failed, attempting cleanup:', parseError);
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```|```\n([\s\S]*?)\n```|\[.*\]/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[2] || jsonMatch[0]) : text;
      
      try {
        const fallbackParsed = JSON.parse(jsonString);
        return res.json({ mcqs: fallbackParsed });
      } catch (fallbackError) {
        console.error('Fallback parsing failed:', fallbackError);
        throw new Error(`Could not parse response: ${fallbackError.message}`);
      }
    }
  } catch (error) {
    console.error('Error generating MCQs:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to process Gemini response. Please try again with a different prompt.'
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});