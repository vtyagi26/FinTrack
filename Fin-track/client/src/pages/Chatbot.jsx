import { useState, useEffect, useRef } from "react";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Use import.meta.env safely
  const apiKey = import.meta.env.VITE_COHERE_API_KEY;
  const modelId = import.meta.env.VITE_COHERE_MODEL || "command-r-plus";

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const userInput = input.trim();
    
    if (!apiKey) {
      setMessages(prev => [...prev, { role: "assistant", content: "❌ API Key missing. Check your .env file." }]);
      return;
    }

    if (!userInput) return;

    const userMsg = { role: "user", content: userInput };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.cohere.ai/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelId,
          message: userInput,
          // Removed hardcoded session for better testing
          stream: false, 
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || `API Error ${res.status}`);
      }

      const data = await res.json();
      const reply = data.text || "No response received.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white font-sans">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900 shadow-md">
        <h2 className="text-xl font-bold text-green-400 flex items-center gap-2">
          <span>📈</span> Fin-Track AI
        </h2>
      </div>

      {/* Message Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <p className="text-lg">How can I help with your finances today?</p>
            <p className="text-sm">Try: "What is a bull market?"</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${
              msg.role === "user" 
                ? "bg-blue-600 rounded-tr-none" 
                : "bg-gray-800 border border-gray-700 rounded-tl-none"
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && <div className="text-gray-500 text-sm animate-pulse">Fin-Track is analyzing...</div>}
        <div ref={scrollRef} />
      </div>

      {/* Input Field */}
      <form onSubmit={sendMessage} className="p-4 bg-gray-900 border-t border-gray-800">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            className="flex-1 p-3 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:border-green-500 transition-colors"
            placeholder="Ask a finance question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded-xl font-semibold transition-all disabled:opacity-50"
            disabled={loading}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}