import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getPreviousMessages, generateResponse } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import PageLoader from "../components/PageLoader.jsx";
import ReactMarkdown from "react-markdown";


export default function AI() {


  const {authUser} = useAuthUser();
  const [liveMessages, setLiveMessages] = useState([]);
  const [input, setInput] = useState("");


  // Fetch history once, don't modify this after load
  const { data: historyData, isLoading } = useQuery({
  queryKey: ["history", authUser?._id, authUser?.learningLanguage],
  queryFn: () => getPreviousMessages(authUser._id, authUser.learningLanguage),
  enabled: !!authUser,
  });
  const historyMessages = historyData?.messages || [];



  // Mutation to send message and get AI reply
  const {mutate: promptMutation,isLoading: aiFetching} = useMutation({
    mutationFn: async (userMessage) => {
      // Append user message optimistically
      setLiveMessages((prev) => [
        ...prev,
        { sender: "user", text: userMessage, timestamp: new Date() },
      ]);
      const data = await generateResponse(userMessage);
      return data;
    },
    onSuccess: (data) => {
      // Append AI reply
      console.log(data.reply)
      setLiveMessages((prev) => [
        ...prev,
        { sender: "ai", text: data.reply, timestamp: new Date() },
      ]);
    },
    onError: (error) => {
      console.error("Send message failed:", error);
      alert("Failed to send message. Please try again.");
    },
  });

  const messagesContainerRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect( () =>{
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  },[historyMessages, liveMessages]);

  const handleSend = () => {
    if (!input.trim()) return;
    promptMutation(input.trim());
    setInput("");
  };


  if (isLoading) return <PageLoader/>;



  return (
    <div className="flex flex-col h-screen p-4">
  <div
    className="flex-1 min-h-0 overflow-y-auto space-y-2"
    ref={messagesContainerRef}
  >
    {historyMessages.map((msg, idx) => (
      <ChatBubble key={`history-${idx}`} sender={msg.sender} text={msg.text} />
    ))}
    {liveMessages.map((msg, idx) => (
      <ChatBubble key={`live-${idx}`} sender={msg.sender} text={msg.text} />
    ))}
  </div>

  <div className="flex mt-2">
    <input
      id="chat-message"
      name="chatMessage"
      className="input input-bordered w-full"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handleSend()}
      placeholder="Type your message..."
    />
    <button
      className="btn btn-primary ml-2"
      onClick={handleSend}
      disabled={aiFetching}
    >
      {aiFetching ? "Sending..." : "Send"}
    </button>
  </div>
</div>

  );
}

function ChatBubble({ sender, text }) {
  const isUser = sender === "user";
  return (
    <div className={`chat ${isUser ? "chat-end" : "chat-start"}`}>
      <div className="chat-bubble"><ReactMarkdown>{text}</ReactMarkdown></div>
    </div>
  );
}
