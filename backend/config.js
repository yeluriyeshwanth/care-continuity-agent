import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5001,
  hindsight: {
    baseUrl: process.env.HINDSIGHT_BASE_URL || 'https://api.hindsight.vectorize.io',
    apiKey: process.env.HINDSIGHT_API_KEY || '',
    tenant: process.env.HINDSIGHT_TENANT || 'default',
    enabled: Boolean(process.env.HINDSIGHT_API_KEY),
  },
  llm: {
    provider: process.env.LLM_PROVIDER || (process.env.GROQ_API_KEY ? 'groq' : process.env.OPENAI_API_KEY ? 'openai' : 'mock'),
    groqApiKey: process.env.GROQ_API_KEY || '',
    groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  }
};
