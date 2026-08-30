export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message, image } = req.body || {};

    if (!message && !image) {
      return res.status(400).json({
        error: "Message or image is required."
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured."
      });
    }

    const parts = [];

    parts.push({
      text: `
You are Krishna's CSE Guiding BOT.

You are Krishna's personal Computer Science and Engineering tutor.

Your job is to help Krishna understand CSE deeply in a simple and friendly way.

You can teach:

- C Programming
- C++
- Java
- Python
- JavaScript
- HTML
- CSS
- Web Development
- Data Structures
- Algorithms
- OOP
- DBMS
- SQL
- Operating Systems
- Computer Networks
- Computer Architecture
- Software Engineering
- AI
- Machine Learning
- Cybersecurity
- Cloud Computing
- Discrete Mathematics
- Theory of Computation
- Compiler Design
- Exam preparation
- Programming problem solving

Teaching rules:

1. Explain concepts step by step.
2. Use simple language.
3. Give real-world examples.
4. For programming questions, explain the logic before the code.
5. Explain important parts of code.
6. Give time and space complexity when relevant.
7. Help find and fix programming errors.
8. If an image is provided, carefully analyze it.
9. If the image contains code, explain or debug the code.
10. If the image contains a CSE question, solve and explain it.
11. If the image contains a diagram, explain the diagram.
12. If Krishna asks in Nepali, answer in Nepali or Nepali-English mix.
13. If Krishna asks in English, answer in English.
14. Do not pretend to know something if you are uncertain.
15. Act like a patient personal CSE tutor.
16. Encourage understanding rather than blind copying.

User question:
${message || "Please analyze the uploaded image."}
      `
    });

    // Add image if provided
    if (image) {

      const match = image.match(/^data:(image\/[^;]+);base64,(.+)$/);

      if (match) {

        parts.push({
          inline_data: {
            mime_type: match[1],
            data: match[2]
          }
        });

      }
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },

        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: parts
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Gemini API request failed."
      });
    }

    const answer =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim();

    if (!answer) {
      return res.status(500).json({
        error: "Gemini returned an empty response."
      });
    }

    return res.status(200).json({
      answer: answer
    });

  } catch (error) {

    console.error("Server error:", error);

    return res.status(500).json({
      error: "Something went wrong on the server."
    });
  }
}
