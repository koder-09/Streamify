import { generateStreamToken } from "../lib/stream.js";
import Chat from "../models/Chat.js";

export async function getStreamToken(req, res) {
  try {
    const token = generateStreamToken(req.user.id);

    res.status(200).json({token});

  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({message: "Internal Server Error"});
  }
}

export async function generateResponse(req,res){
  try {
    const userId=req.user._id;
    const language=req.user.learningLanguage;
    const { message} = req.body;

    const prevMsg = await Chat.findOne({ user: userId, language });

    // Extract last 10 messages (or less)
    const recentMessages = prevMsg?.messages.slice(-10) || [];

    // Format history in prompt, like:
    // User: hello
    // AI: hi, how can I help?
    // User: ...
    let historyText = "";
    recentMessages.forEach((msg) => {
      if (msg.sender === "user") {
        historyText += `User: ${msg.text}\n`;
      } else if (msg.sender === "ai") {
        historyText += `AI: ${msg.text}\n`;
      }
    });

    // Base instructions for Gemini
    const promptIntro = `You are a ${language} tutor and a friend.
    1. Always reply in ${language}.
    2. Correct grammar and explain in English why it's wrong.
    3. Suggest better phrases for fluency.
    4. Always maintain conversation and keep interacting.
    Try to keep responses under 50 or 100 words.`;

    // Full prompt with history + new user message
    const fullPrompt = promptIntro + historyText + `User: ${message}\nAI:`;


    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt + "\nUser: " + message }] }]
        })
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Error: No reply";



    let chat = await Chat.findOne({ user: userId, language });
    if (!chat) {
      chat = new Chat({ user: userId, language, messages: [] });
    }
    
    chat.messages.push({ sender: "user", text: message });
    if (reply && reply.trim()) {
      chat.messages.push({ sender: "ai", text: reply });
    } else {
      console.warn("Skipping empty AI reply");
    }
    await chat.save();
    res.status(200).json({ reply: reply });

  } catch (error) {
    console.error("Response error:",error);
    res.status(500).json({message: "Clanker server error"});
  }
}

export async function getHistory(req,res){

  const userId=req.user._id;
  const {id: paramId, language}=req.params;

  if(userId!=paramId){
    return res.status(400).json({message: "You can't see history of other users"});
  }

  const chat = await Chat.findOne({ user: userId, language });
  if (!chat) return res.json({ messages: [] });
  res.json({ messages: chat.messages });
}