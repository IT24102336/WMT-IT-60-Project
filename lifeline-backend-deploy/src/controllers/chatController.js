const asyncHandler = require("../utils/asyncHandler");

const buildFallbackReply = (message) => {
  const normalized = String(message || "").toLowerCase();

  let reply = "Blood donation saves lives. Stay hydrated and check eligibility before donating.";
  if (normalized.includes("eligibility")) {
    reply = "A donor is usually ineligible after a recent donation, an unsafe test result, or a health questionnaire risk.";
  } else if (normalized.includes("blood type")) {
    reply = "Common blood groups used in the system are A, B, AB, and O with positive or negative Rh factor.";
  } else if (normalized.includes("appointment")) {
    reply = "You can book an appointment after login once your eligibility check passes.";
  }

  return reply;
};

const sendChatReply = asyncHandler(async (req, res) => {
  const rawMessage = String(req.body.message || "").trim();

  if (!rawMessage) {
    res.status(400);
    throw new Error("message is required");
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  const groqModel = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  if (!groqApiKey) {
    return res.status(200).json({
      reply: buildFallbackReply(rawMessage),
      source: "fallback"
    });
  }

  const systemPrompt =
    "You are the LifeLine assistant for a blood donation and management system. " +
    "Answer briefly, clearly, and safely. Focus on blood donation, donor eligibility, appointments, camps, hospitals, and the LifeLine workflow. " +
    "Do not invent medical diagnoses or emergency instructions beyond general guidance. If the user asks for urgent medical advice, recommend contacting a qualified medical professional.";

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: groqModel,
        temperature: 0.4,
        max_tokens: 300,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: rawMessage }
        ]
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const providerMessage =
        data?.error?.message || data?.message || "Groq request failed";
      console.error("Groq chatbot error:", providerMessage);
      return res.status(200).json({
        reply: buildFallbackReply(rawMessage),
        source: "fallback"
      });
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return res.status(200).json({
        reply: buildFallbackReply(rawMessage),
        source: "fallback"
      });
    }

    return res.status(200).json({
      reply,
      source: "groq"
    });
  } catch (error) {
    console.error("Groq chatbot request failed:", error.message);
    return res.status(200).json({
      reply: buildFallbackReply(rawMessage),
      source: "fallback"
    });
  }
});

module.exports = {
  sendChatReply
};
