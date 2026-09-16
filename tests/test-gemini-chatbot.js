/**
 * Test Google Gemini Chatbot API Integration
 */

async function testGeminiApi() {
  const apiKey = process.env.GEMINI_API_KEY || "";
  console.log("Testing Gemini API with gemini-3.6-flash...");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: "Hello! What is SAJILOMARTS Nepal?" }]
      }
    ],
    systemInstruction: {
      parts: [{ text: "You are SAJILOMARTS AI, the customer assistant for SAJILOMARTS Nepal, the premier India-to-Nepal direct marketplace sourcing service." }]
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log("Status:", res.status);
  if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
    console.log("✅ Success! Gemini Reply:\n", data.candidates[0].content.parts[0].text);
  } else {
    console.log("Error response:", JSON.stringify(data, null, 2));
  }
}

testGeminiApi();
