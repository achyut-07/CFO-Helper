import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Validate API key exists
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  console.error('❌ VITE_GEMINI_API_KEY is not configured');
  throw new Error('VITE_GEMINI_API_KEY is not configured. Please add your Gemini API key to the environment variables.');
}

// Validate API key format (should start with AIza)
if (!API_KEY.startsWith('AIza')) {
  console.warn('⚠️ API key format may be incorrect. Gemini API keys typically start with "AIza"');
}

console.log('✅ Gemini API key configured successfully (length:', API_KEY.length, 'chars)');

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
  private conversationHistory: ChatMessage[] = [];
  private requestCount: number = 0;
  private lastRequestTime: number = 0;
  private currentModelName: string = '';
  private availableModels: string[] = [];
  private readonly MAX_REQUESTS_PER_MINUTE = 10;
  private readonly MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests

  constructor() {
    // Model will be created dynamically in sendMessage with fallback support
    this.initializeModels();
  }

  private initializeModels() {
    // Use the working models from our tests, prioritizing 2.0 and 2.5 flash models as requested
    this.availableModels = [
      'gemini-2.0-flash',                   // ✅ Working model
      'gemini-2.5-flash',                   // ✅ Working model  
      'gemini-2.5-flash-preview-05-20',    // ✅ Working model
      'gemini-flash-latest',                // ✅ Working model
      'gemini-pro-latest',                  // ✅ Working model
      'gemini-2.5-flash-lite'               // ✅ Working model
    ];
    
    this.currentModelName = this.availableModels[0];
    console.log('🎯 Using working model:', this.currentModelName);
    console.log('📋 Available fallback models:', this.availableModels);
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

      // Generate AI response with fallback models
      // Use the available models list with current model prioritized
      const modelNames = [
        this.currentModelName,
        ...this.availableModels
      ].filter((model, index, arr) => arr.indexOf(model) === index); // Remove duplicates
      
      let lastError: Error | null = null;
      
      for (const modelName of modelNames) {
        try {
          console.log(`🧪 Trying model: ${modelName}`);
          
          const fallbackModel = genAI.getGenerativeModel({ 
            model: modelName,
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
          
          const result = await fallbackModel.generateContent(fullPrompt);
          const response = await result.response;
          const aiResponse = response.text();
          
          console.log(`✅ Success with ${modelName}! Response length: ${aiResponse.length} chars`);
          
          // If successful, remember this model for future requests
          if (this.currentModelName !== modelName) {
            console.log(`🔄 Switched to model: ${modelName}`);
            this.currentModelName = modelName;
          }
          
          // Add AI response to history and return immediately
          const aiChatMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: aiResponse,
            isUser: false,
            timestamp: new Date()
          };
          this.conversationHistory.push(aiChatMessage);
          return aiChatMessage;
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          
          // Check if it's a temporary service issue (503)
          if (errorMessage.includes('503') || errorMessage.includes('service is currently unavailable')) {
            console.warn(`⏳ Model ${modelName} temporarily unavailable`);
          } else {
            console.warn(`❌ Model ${modelName} failed: ${errorMessage}`);
          }
          
          lastError = error as Error;
          continue;
        }
      }
      
      // Only reach here if ALL models failed
      console.error('🚨 All models failed. Last error:', lastError?.message);
      
      // Check if it was a temporary service issue
      const isTemporaryIssue = lastError && lastError.message.includes('503');
      
      // Return a helpful fallback response
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: isTemporaryIssue 
          ? "⏳ The AI service is temporarily busy. This usually resolves quickly! In the meantime, here are some key financial insights:\n\n💡 **Quick Financial Tips:**\n• Track your monthly cash flow closely\n• Maintain 3-6 months of operating expenses as emergency fund\n• Review your biggest expense categories monthly\n• Monitor profit margins and adjust pricing if needed\n• Plan for seasonal variations in revenue\n\n🔄 Please try your question again in a few moments!"
          : "I'm currently experiencing technical difficulties connecting to the AI service. However, I can still help you with general financial advice:\n\n💡 **Quick Tips:**\n• Monitor your cash flow regularly\n• Keep 3-6 months of expenses as emergency fund\n• Review and optimize your biggest expense categories\n• Track your profit margins monthly\n\nPlease try asking your question again in a moment, or contact support if the issue persists.",
        isUser: false,
        timestamp: new Date()
      };
      this.conversationHistory.push(fallbackMessage);
      return fallbackMessage;
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error('Failed to generate AI response. Please try again.');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing connection with model:', this.currentModelName);
      const testModel = genAI.getGenerativeModel({ model: this.currentModelName });
      const result = await testModel.generateContent('Hello, respond with just "OK"');
      const response = await result.response;
      const text = response.text();
      console.log('✅ Model test successful:', text);
      return true;
    } catch (error) {
      console.error('❌ Model test failed:', error);
      return false;
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