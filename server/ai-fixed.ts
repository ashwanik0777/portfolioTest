import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

type BlogPostGenerationParams = {
  title?: string;
  topic?: string;
  keywords?: string[];
  length?: 'short' | 'medium' | 'long';
};

interface GeneratedBlogContent {
  title: string;
  content: string;
  summary: string;
  imagePrompt: string;
  tags: string[];
  readingTime: number;
}

/**
 * Generate a blog post based on provided parameters
 */
export async function generateBlogPost(params: BlogPostGenerationParams): Promise<GeneratedBlogContent> {
  const { title, topic, keywords = [], length = 'medium' } = params;
  
  // Set word count based on requested length
  const wordCount = {
    short: 300,
    medium: 800,
    long: 1500
  }[length];
  
  const promptParts = [];
  promptParts.push(`Generate a professional blog post`);
  
  if (title) {
    promptParts.push(` with the title "${title}"`);
  }
  
  if (topic) {
    promptParts.push(` about ${topic}`);
  }
  
  if (keywords.length > 0) {
    promptParts.push(` including the keywords: ${keywords.join(', ')}`);
  }
  
  promptParts.push(`.
  The blog post should be approximately ${wordCount} words.
  
  Format your response as a valid JSON object with the following fields:
  - title: A catchy title for the blog post
  - content: The complete blog post content with HTML formatting
  - summary: A brief summary of the article (max 50 words)
  - imagePrompt: A prompt that could be used to generate a relevant image 
  - tags: An array of 3-5 relevant tags for the blog post
  - readingTime: Estimated reading time in minutes
  `);

  const prompt = promptParts.join('');

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("Failed to generate blog content");
  }

  const result = JSON.parse(content);
  return result as GeneratedBlogContent;
}

/**
 * Generate smart blog post suggestions based on user profile and existing content
 */
export async function generateBlogSuggestions(
  userProfile: string,
  existingTopics: string[] = []
): Promise<string[]> {
  const promptParts = [];
  promptParts.push(`Based on this professional profile and existing blog topics, suggest 5 new blog post ideas that would be relevant to their expertise.
  
  Professional profile: ${userProfile}
  `);
  
  if (existingTopics.length > 0) {
    promptParts.push(`Existing blog topics: ${existingTopics.join(', ')}`);
  }
  
  promptParts.push(`
  
  Provide your response as a JSON object with a "suggestions" array containing strings, each representing a blog post idea.`);

  const prompt = promptParts.join('');

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("Failed to generate blog suggestions");
  }

  const result = JSON.parse(content);
  return result.suggestions || [];
}

/**
 * Analyze blog content for SEO improvement suggestions
 */
export async function analyzeBlogContent(
  content: string
): Promise<{ suggestions: string[], keywordDensity: Record<string, number> }> {
  // Truncate content if too long
  const truncatedContent = content.length > 4000 ? content.substring(0, 4000) + "..." : content;

  const prompt = `Analyze this blog content for SEO improvement opportunities:
  
  ${truncatedContent}
  
  Provide your response as a JSON object with:
  1. "suggestions" - an array of specific SEO improvement suggestions
  2. "keywordDensity" - an object with key terms and their frequency percentages
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.5,
  });

  const responseContent = response.choices[0].message.content;
  if (!responseContent) {
    throw new Error("Failed to analyze blog content");
  }

  const result = JSON.parse(responseContent);
  return result;
}