import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AskIcon, CrossIcon } from "./Icons";
import { queryAI, QueryResponse } from "../services/ChatService";

interface ChatProps {
  onClose: () => void;
}

interface ChatMessage {
  type: "sent" | "received" | "loading";
  text: string;
  references?: QueryResponse["references"];
}

const Chat: React.FC<ChatProps> = ({ onClose }) => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { type: "received", text: "Hello! How can I help you today?" },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setIsLoading(true);
      const userMessage: ChatMessage = { type: "sent", text: message };
      setChatHistory((prev) => [...prev, userMessage]);
      setMessage("");

      const typingMessage: ChatMessage = { type: "loading", text: "..." };
      setChatHistory((prev) => [...prev, typingMessage]);

      try {
        const aiResponse = await queryAI(message);
        const aiMessage: ChatMessage = {
          type: "received",
          text: aiResponse.response,
          references: aiResponse.references,
        };
        setChatHistory((prev) => {
          const updatedHistory = [...prev];
          updatedHistory[updatedHistory.length - 1] = aiMessage;
          return updatedHistory;
        });
      } catch (error) {
        console.error("Error querying AI:", error);
        setChatHistory((prev) => [
          ...prev.slice(0, -1),
          {
            type: "received",
            text: "Sorry, I'm not sure.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 mt-[120px] flex w-96 translate-x-0 transform flex-col bg-white shadow-lg transition-transform duration-300">
      <div className="flex items-center justify-between border-b px-4 py-1">
        <AskIcon className="w-20 text-primary" />
        <h2 className="text-xl font-semibold">Ask Questions</h2>
        <button onClick={onClose} className="rounded-full bg-primary">
          <CrossIcon className="w-8" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-4">
          {chatHistory.map((msg, index) => (
            <div key={index}>
              <div
                className={`max-w-[70%] rounded-[20px] px-4 py-2 text-lg ${
                  msg.type === "sent"
                    ? "ml-auto rounded-r-[5px] bg-blue-100"
                    : msg.type === "loading"
                      ? "animate-pulse rounded-l-[5px] bg-gray-100 text-xl"
                      : "rounded-l-[5px] bg-gray-100"
                }`}
              >
                {msg.text}
              </div>
              {msg.references && msg.references.length > 0 && (
                <div className="mt-2 text-sm text-gray-500">
                  <p>References:</p>
                  <ul className="list-disc pl-5">
                    {msg.references.map((ref, idx) => (
                      <li key={idx}>
                        <Link
                          to={`/content/${ref.metadata.blob_id_u256}`}
                          state={{
                            description: ref.metadata.description,
                            type: ref.metadata.file_type,
                            owner: ref.metadata.owner,
                            title: ref.metadata.title,
                          }}
                          className="text-blue-500 hover:underline"
                        >
                          {ref.metadata.title || "Untitled"} (
                          {ref.metadata.file_type})
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={sendMessage} className="border-t p-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="ask..."
          className="w-full rounded-lg border p-2"
          disabled={isLoading}
        />
      </form>
    </div>
  );
};

export default Chat;
