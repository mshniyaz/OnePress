const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are an expert audio analysis AI designed to evaluate situational recordings. Your objective is to accurately transcribe, translate, and triage the provided audio, strictly returning the results in a predefined JSON format.

Analyze the provided audio file and execute the following tasks:

1. Original Transcription (rawTranscript): Transcribe the audio in its original language. Include tonal markers in brackets (e.g., [distressed], [calm], [urgent]) to reflect the speaker's state.

2. English Translation (engTranscript): Translate the transcription into English. If it is already in English, duplicate the rawTranscript here. Retain all tonal markers.

3. Language (lang): Identify the primary original language spoken in the audio.

4. Priority Triage (priority): Assign a priority level integer based on the context:
   - 1: Life-threatening/Immediate. Crucial Rule: If the audio is pure silence, default to 1.
   - 2: Urgent but stable.
   - 3: Non-urgent.

5. Categorization (tags): Identify relevant tags strictly from this list: ["medical", "mental", "social", "financial"]. Return an empty array [] if none apply.

6. AI Summary (aiSummary): Provide a concise, objective summary of the situation.

Return ONLY a valid JSON object with these exact keys:
{
  "rawTranscript": "",
  "engTranscript": "",
  "lang": "",
  "priority": 1,
  "tags": [],
  "aiSummary": ""
}

Do not include any other text, markdown formatting, or code blocks. Return only the raw JSON object.`;

/**
 * Send an audio blob to Gemini for analysis and return structured case data.
 * @param {Blob} audioBlob - The recorded audio blob (audio/webm)
 * @returns {Promise<object>} Parsed AI analysis result
 */
export async function analyzeAudio(audioBlob) {
  console.log("[AI] Starting audio analysis...");
  console.log("[AI] Audio blob size:", audioBlob.size, "bytes, type:", audioBlob.type);

  // Convert blob to base64
  const buffer = await audioBlob.arrayBuffer();
  const base64Audio = btoa(
    new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
  );
  console.log("[AI] Base64 encoded, length:", base64Audio.length);

  console.log("[AI] Sending request to Gemini...");
  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: SYSTEM_PROMPT },
            {
              inline_data: {
                mime_type: "audio/webm",
                data: base64Audio,
              },
            },
          ],
        },
      ],
    }),
  });

  console.log("[AI] Gemini responded with status:", response.status);

  if (!response.ok) {
    const errBody = await response.text();
    console.error("[AI] Gemini error body:", errBody);
    throw new Error(`Gemini API error (${response.status}): ${errBody}`);
  }

  const result = await response.json();
  console.log("[AI] Raw Gemini response:", JSON.stringify(result, null, 2));

  // Extract the text from Gemini's response
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.error("[AI] No text found in response candidates");
    throw new Error("No response text from Gemini");
  }

  console.log("[AI] Extracted text:", text);

  // Clean and parse the JSON (strip markdown code fences if present)
  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  const parsed = JSON.parse(cleaned);
  console.log("[AI] Parsed result:", parsed);

  // Validate required fields
  const required = ["rawTranscript", "engTranscript", "lang", "priority", "tags", "aiSummary"];
  for (const key of required) {
    if (!(key in parsed)) {
      throw new Error(`Missing field in AI response: ${key}`);
    }
  }

  console.log("[AI] Analysis complete ✓");
  return parsed;
}
