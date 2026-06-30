const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function genIcebreaker(user1, user2, sharedPlaces) {
  const sharedPlacesText =
    sharedPlaces.length > 0
      ? sharedPlaces
          .map((p) => `${p.placeName}${p.note ? ` - ${p.note}` : ""}`)
          .join(", ")
      : null;

  const prompt = `You are helping someone send their first message on a dating app called Bumpd. Write a casual, natural opening message that ${user1.name || "this person"} can send to ${user2.name || "their match"}.

About the match (${user2.name || "the other person"}):
Bio: ${user2.bio || "-"}
Personality: ${user2.personality || "-"}
${sharedPlacesText ? `They both like these places: ${sharedPlacesText}. Use the match's notes about these places as the main inspiration.` : "They don't have shared places yet."}

Rules:
- Write exactly like a real person casually texting for the first time
- No long dashes, no bullet points, no formal language, no emojis overload
- Max 2-3 short sentences
- Sound spontaneous and genuine, like you just thought of it
- Reference the shared place naturally if available, based on what the match wrote about it
- Do NOT start with "Hey" or "Hi" if possible, be more creative
- Reply with ONLY the message text, nothing else

Example of good output: "eh kamu suka ke kopi nako daur baur kemang juga? kirain cuma aku yang hampir setiap saat kalo mau ngopi ke sana haha, btw biasanya duduk di pojok mana?"
Example of bad output: "Hello! I noticed we both enjoy — Kopi Nako. It would be wonderful to connect over our shared interests."`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text.trim();
}

module.exports = { genIcebreaker };
