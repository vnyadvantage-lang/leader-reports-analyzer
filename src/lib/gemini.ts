import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeLeaderReport(text: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `
Analyze this leader report and provide structured feedback:

${text}

Provide JSON output with:
{
  "summary": "brief summary",
  "strengths": ["list of strengths"],
  "areasForImprovement": ["list of areas"],
  "keyMetrics": {"metric": "value"},
  "overallScore": 0-100,
  "recommendations": ["list of recommendations"]
}
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  try {
    return JSON.parse(text);
  } catch (e) {
    return { raw: text, error: 'Failed to parse JSON' };
  }
}
