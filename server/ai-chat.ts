import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Interface for chat messages
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Interface for chat response
export interface ChatResponse {
  message: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Process a chat conversation using OpenAI
 */
export async function processChat(messages: ChatMessage[]): Promise<ChatResponse> {
  try {
    // Ensure the first message has system role for instruction
    let processedMessages = [...messages];
    if (messages.length === 0 || messages[0].role !== 'system') {
      processedMessages = [
        {
          role: 'system',
          content: 'You are a helpful assistant on a portfolio website. Provide concise, accurate answers about web development, programming, and professional topics. Keep responses friendly and informative. If asked about the portfolio owner, provide information based on their profile data. Limit responses to 3-4 sentences unless a detailed explanation is requested.',
        },
        ...messages,
      ];
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: processedMessages,
      max_tokens: 500,
      temperature: 0.7,
    });

    // Return the response
    return {
      message: completion.choices[0].message.content || "I'm sorry, I couldn't generate a response.",
      usage: completion.usage,
    };
  } catch (error: any) {
    console.error('Error in AI chat processing:', error);
    throw new Error(error.message || 'An error occurred during the chat processing');
  }
}