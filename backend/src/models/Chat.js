import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
    {
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        }, // Reference to User model
        language: { 
            type: String,
            required: true 
        },
        messages: [
            {
            sender: { type: String, enum: ["user", "ai"], required: true },
            text: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
            }
        ]
    },  { timestamps: true }
);

const Chat= mongoose.model("Chat", chatSchema);

export default Chat;