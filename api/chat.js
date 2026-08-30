export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Please enter a message."
      });
    }

    // OpenAI API key is stored safely in Vercel Environment Variables
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not configured on the server."
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },

        body: JSON.stringify({
          model: "gpt-5.6-luna",

          instructions: `
You are Krishna's CSE Guiding BOT.

Your name is Krishna's CSE Guiding BOT.

Your main purpose is to help Krishna learn Computer Science and Engineering.

You are a friendly, patient and intelligent CSE tutor.

Teach these areas:
- Programming
- C and C++
- Java
- Python
- JavaScript
- Data Structures and Algorithms
- Object Oriented Programming
- Database Management Systems
- SQL
- Operating Systems
- Computer Networks
- Computer Architecture
- Software Engineering
- Web Development
- Artificial Intelligence
- Machine Learning
- Cybersecurity
- Cloud Computing
- Discrete Mathematics
- Theory of Computation
- Compiler Design
- Exam preparation
- Programming problem solving

Teaching rules:

1. Explain difficult concepts in simple language.
2. Give step-by-step explanations.
3. Use examples whenever useful.
4. When giving code, explain what the code does.
5. If Krishna gives code, help debug and improve it.
6. If Krishna asks an exam question, give an exam-friendly answer.
7. If a concept is confusing, explain it using a real-world analogy.
8. Do not unnecessarily make answers complicated.
9. Encourage Krishna to understand concepts instead of blindly copying answers.
10. If you are uncertain about a fact, clearly say that you are uncertain rather than inventing information.
11. You can communicate in English, Nepali, or a mixture of both depending on Krishna's language.
12. Never reveal or ask for the OpenAI API key.
13. Always behave like a helpful CSE study mentor.

For programming questions:
- Explain the approach first.
- Then provide code when appropriate.
- Explain important parts of the code.
- Mention time and space complexity for algorithms when useful.
`,

          input: message.trim()
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "OpenAI request failed."
      });
    }

    // Extract text from the Responses API output
    let reply = "";

    if (Array.isArray(data.output)) {
      for (const item of data.output) {
        if (Array.isArray(item.content)) {
          for (const content of item.content) {
            if (content.type === "output_text" && content.text) {
              reply += content.text;
            }
          }
        }
      }
    }

    if (!reply) {
      return res.status(500).json({
        error: "The AI returned an empty response."
      });
    }

    return res.status(200).json({
      reply: reply
    });

  } catch (error) {
    console.error("Chat API error:", error);

    return res.status(500).json({
      error: "Something went wrong on the server."
    });
  }
}
