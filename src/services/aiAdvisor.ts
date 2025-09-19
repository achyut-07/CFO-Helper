import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Validate API key exists
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error('VITE_GEMINI_API_KEY is not configured. Please add your Gemini API key to the environment variables.');
}

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(API_KEY);

export interface FinancialContext {
  currentRevenue: number;
  projectedRevenue: number;
  expenses: number;
  growthRate: number;
  timeHorizon: number;
  cashFlow: number;
  profitMargin: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

class AIFinancialAdvisor {
  private model;
  private conversationHistory: ChatMessage[] = [];
  private requestCount: number = 0;
  private lastRequestTime: number = 0;
  private readonly MAX_REQUESTS_PER_MINUTE = 10;
  private readonly MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests

  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });
  }

  private buildFinancialPrompt(context?: FinancialContext): string {
    const basePrompt = `You are an expert CFO and financial advisor AI assistant. You provide clear, actionable financial advice and insights. 
    
    Your role is to:
    - Analyze financial data and provide strategic recommendations
    - Identify potential risks and opportunities
    - Suggest cost optimization strategies
    - Recommend revenue growth initiatives
    - Provide cash flow management advice
    - Offer industry best practices and benchmarks
    
    Keep your responses concise, practical, and focused on actionable insights. Use bullet points for clarity when appropriate.`;

    if (context) {
      return `${basePrompt}
      
      Current Financial Context:
      - Current Revenue: $${context.currentRevenue?.toLocaleString() || 'N/A'}
      - Projected Revenue: $${context.projectedRevenue?.toLocaleString() || 'N/A'}
      - Monthly Expenses: $${context.expenses?.toLocaleString() || 'N/A'}
      - Growth Rate: ${context.growthRate || 'N/A'}%
      - Time Horizon: ${context.timeHorizon || 'N/A'} months
      - Cash Flow: $${context.cashFlow?.toLocaleString() || 'N/A'}
      - Profit Margin: ${context.profitMargin?.toFixed(2) || 'N/A'}%
      
      Please consider this financial data when providing your advice.`;
    }

    return basePrompt;
  }

  private checkRateLimit(): void {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    // Check minimum interval between requests
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      throw new Error('Please wait a moment before sending another message.');
    }

    // Reset request count every minute
    if (timeSinceLastRequest > 60000) {
      this.requestCount = 0;
    }

    // Check request count limit
    if (this.requestCount >= this.MAX_REQUESTS_PER_MINUTE) {
      throw new Error('Too many requests. Please wait a minute before trying again.');
    }

    this.requestCount++;
    this.lastRequestTime = now;
  }

  async sendMessage(
    userMessage: string, 
    financialContext?: FinancialContext
  ): Promise<ChatMessage> {
    try {
      // Check rate limiting
      this.checkRateLimit();

      // Input validation
      if (!userMessage || userMessage.trim().length === 0) {
        throw new Error('Please enter a message.');
      }

      if (userMessage.length > 1000) {
        throw new Error('Message is too long. Please keep it under 1000 characters.');
      }
      // Add user message to history
      const userChatMessage: ChatMessage = {
        id: Date.now().toString(),
        content: userMessage,
        isUser: true,
        timestamp: new Date()
      };
      this.conversationHistory.push(userChatMessage);

      // Build conversation context
      const systemPrompt = this.buildFinancialPrompt(financialContext);
      const conversationContext = this.conversationHistory
        .slice(-5) // Keep last 5 messages for context
        .map(msg => `${msg.isUser ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      const fullPrompt = `${systemPrompt}

      Previous conversation:
      ${conversationContext}
      
      User: ${userMessage}
      
      Assistant:`;

      // Generate AI response
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const aiResponse = response.text();

      // Add AI response to history
      const aiChatMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date()
      };
      this.conversationHistory.push(aiChatMessage);

      return aiChatMessage;
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error('Failed to generate AI response. Please try again.');
    }
  }

  async generateFinancialInsights(context: FinancialContext): Promise<ChatMessage> {
    const insightPrompt = `Based on the current financial metrics, provide 3-4 key insights and recommendations for improvement. Focus on:
    1. Cash flow optimization
    2. Revenue growth opportunities
    3. Cost reduction strategies
    4. Risk assessment and mitigation`;

    return this.sendMessage(insightPrompt, context);
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }
}

// Export a singleton instance
export const aiAdvisor = new AIFinancialAdvisor();
export default AIFinancialAdvisor;