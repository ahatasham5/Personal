import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const gemini = {
  async summarizeWeek(logs: any[]) {
    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: `Summarize the activity from the LAST 7 DAYS based on these logs: ${JSON.stringify(logs)}. 
      Focus on Job, Company, and Family categories. Highlight most impactful work and patterns.`,
    });
    return response.text;
  },

  async getBehavioralCoaching(data: any) {
    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: `Based on the user data from the LAST 7 DAYS: ${JSON.stringify(data)}, provide 3 behavioral suggestions. 
      Include "Next best action" for stuck items and an "If-then" plan. Keep it concise and actionable.`,
    });
    return response.text;
  },

  async getAdaptivePlaybook(data: any) {
    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: `Analyze the user's activity from the LAST 7 DAYS: ${JSON.stringify(data)}. 
      If consistency breaks, suggest a "Restart protocol". 
      If low-impact tasks dominate, suggest an "Impact filter". 
      If family time drops, suggest a "Relationship recovery plan". 
      Choose the most relevant playbook to show.`,
    });
    return response.text;
  },

  async generateContentIdeas(userData: any, platform: string, userThoughts?: string) {
    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: `User context (LAST 7 DAYS ONLY):
      - Recent Logs (Work/Family/Company): ${JSON.stringify(userData.recentLogs)}
      - Long-term Goals: ${JSON.stringify(userData.goals)}
      - Recent Diary Entries: ${JSON.stringify(userData.diary)}
      - Recent Reviews (Wins/Losses): ${JSON.stringify(userData.reviews)}
      - Top Ideas: ${JSON.stringify(userData.topIdeas)}
      ${userThoughts ? `- User's specific thoughts/seeds for this content: ${userThoughts}` : ''}

      Generate 3 ready-to-upload, high-authority content pieces for ${platform}. 
      Each piece must include a compelling idea, a platform-specific hook, a full caption, and a descriptive image prompt.
      
      The content MUST be deeply influenced by their specific goals, projects, and daily reflections from the last 7 days.
      Incorporate modern current trends in IT and AI.
      Use Google Search to ensure trends are up-to-the-minute.
      Make the content sound authentic to someone building their future self.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              idea: { type: Type.STRING, description: "The core concept or title of the post" },
              hook: { type: Type.STRING, description: "A platform-specific attention-grabbing opening line" },
              caption: { type: Type.STRING, description: "The full body text of the post, formatted for the platform" },
              imagePrompt: { type: Type.STRING, description: "A detailed prompt for an AI image generator to accompany the post" }
            },
            required: ["idea", "hook", "caption", "imagePrompt"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  }
};
