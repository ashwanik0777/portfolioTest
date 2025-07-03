import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

export interface ContentItem {
  title: string;
  type: 'blog' | 'project' | 'skill';
  description: string;
  relevanceScore: number;
  url: string;
}

export interface ContentRecommendation {
  items: ContentItem[];
  reasoning: string;
}

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
  
  const prompt = `Generate a professional blog post${title ? ` with the title "${title}"` : ''}${
    topic ? ` about ${topic}` : ''
  }${keywords.length > 0 ? ` including the keywords: ${keywords.join(', ')}` : ''}.
  The blog post should be approximately ${wordCount} words.
  
  Format your response as a valid JSON object with the following fields:
  - title: A catchy title for the blog post
  - content: The complete blog post content with HTML formatting
  - summary: A brief summary of the article (max 50 words)
  - imagePrompt: A prompt that could be used to generate a relevant image 
  - tags: An array of 3-5 relevant tags for the blog post
  - readingTime: Estimated reading time in minutes
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = response.choices[0].message.content || '';
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
  const prompt = `Based on this professional profile and existing blog topics, suggest 5 new blog post ideas that would be relevant to their expertise.
  
  Professional profile: ${userProfile}
  
  ${existingTopics.length > 0 ? `Existing blog topics: ${existingTopics.join(', ')}` : ''}
  
  Provide your response as a JSON array of strings, each representing a blog post idea.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  const content = response.choices[0].message.content || '';
  const result = JSON.parse(content);
  return result.suggestions || [];
}

/**
 * Analyze blog content for SEO improvement suggestions
 */
export async function analyzeBlogContent(
  blogContent: string
): Promise<{ suggestions: string[], keywordDensity: Record<string, number> }> {
  const prompt = `Analyze this blog content for SEO improvement opportunities:
  
  ${blogContent.substring(0, 4000)}
  
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

  const content = response.choices[0].message.content || '';
  const result = JSON.parse(content);
  return result;
}

/**
 * Generate personalized content recommendations based on user interests and portfolio content
 */
export async function generateContentRecommendations(
  userInterests: string[],
  currentContent: string,
  availableContent: {
    blogs: Array<{ title: string, summary: string, slug: string, tags: string }>,
    projects: Array<{ title: string, description: string, id: number, category: string }>,
    skills: Array<{ name: string, category: string, id: number }>
  },
  count: number = 3
): Promise<ContentRecommendation> {
  // Construct a comprehensive prompt for the AI
  const prompt = `Based on the user's interests and the current content they're viewing, recommend ${count} other content items from the available portfolio content.
  
  User interests: ${userInterests.join(', ')}
  
  Current content: ${currentContent}
  
  Available content:
  
  Blogs:
  ${availableContent.blogs.map(blog => `- ${blog.title}: ${blog.summary} (Tags: ${blog.tags})`).join('\n')}
  
  Projects:
  ${availableContent.projects.map(project => `- ${project.title}: ${project.description} (Category: ${project.category})`).join('\n')}
  
  Skills:
  ${availableContent.skills.map(skill => `- ${skill.name} (Category: ${skill.category})`).join('\n')}
  
  Provide your response as a JSON object with:
  1. "items" - an array of recommended content items, each with:
     - "title": The title of the content
     - "type": The type of content ("blog", "project", or "skill")
     - "description": A brief description of why this is relevant
     - "relevanceScore": A number from 0-100 indicating how relevant this is to the user
     - "url": The URL to the content (for blogs: "/blog/{slug}", for projects: "/projects#{id}", for skills: "/skills#{id}")
  2. "reasoning": A brief explanation of why these items were recommended
  
  Ensure that recommendations are diverse and highly relevant to both the user's interests and current content.
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = response.choices[0].message.content || '';
  try {
    const result = JSON.parse(content);
    return result as ContentRecommendation;
  } catch (error) {
    console.error("Error parsing AI recommendation response:", error);
    return {
      items: [],
      reasoning: "Unable to generate recommendations at this time."
    };
  }
}