export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body || {};

    if (!message?.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GROQ_API_KEY is not configured."
      });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [
            {
              role: "system",
              content: `
You are Krishna's CSE Guiding BOT.

You are a friendly and patient Computer Science tutor.

Help with:
C, C++, Java, Python, JavaScript, HTML, CSS,
DSA, OOP, DBMS, SQL, Operating Systems,
Computer Networks, Computer Architecture,
Software Engineering, AI/ML, Cybersecurity,
Cloud Computing, Discrete Mathematics,
Theory of Computation, Compiler Design and exams.

Explain concepts step by step and use simple examples.
For coding questions, explain the logic and then provide code.
For algorithms, include time and space complexity when useful.
Help debug code.
If the user asks in Nepali, answer in Nepali or Nepali-English mix.
If the user asks in English, answer in English.
Do not invent information when uncertain.
`
            },
            {
              role: "user",
              content: message.trim()
            }
          ],
          temperature: 0.4,
          max_tokens: 1500
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Groq request failed."
      });
    }

    const reply =
      data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(500).json({
        error: "AI returned an empty response."
      });
    }

    return res.status(200).json({ reply });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Server error."
    });
  }
}
