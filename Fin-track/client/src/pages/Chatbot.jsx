import { useState } from "react";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const apiKey = import.meta.env.VITE_COHERE_API_KEY;
  const modelId = import.meta.env.VITE_COHERE_MODEL || "command-a-03-2025";

  const sendMessage = async (e) => {
    e.preventDefault();
    const userInput = input.trim();
    if (!userInput) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Please enter a valid message." },
      ]);
      return;
    }

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
          message: userInput, // ✅ Cohere expects 'message', not 'messages'
          conversation_id: "finance-bot-session-1",
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Cohere API error ${res.status}: ${errText}`);
      }

      const data = await res.json();
      console.log("Cohere response:", data);

      const reply =
        data?.text ||
        data?.reply ||
        "Sorry, I couldn’t generate a response.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-gray-900 text-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Finance Chatbot</h2>

      <div className="h-80 overflow-y-auto mb-4 border border-gray-700 rounded p-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-gray-400">Ask me anything about stocks or finance!</p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded ${
              msg.role === "user" ? "bg-blue-600 text-right" : "bg-gray-700"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && <p className="text-gray-400">Thinking...</p>}
      </div>

      <form onSubmit={sendMessage} className="flex space-x-2">
        <input
          type="text"
          className="flex-grow p-2 rounded bg-gray-800 border border-gray-700 text-white"
          placeholder="Type your finance question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          disabled={loading}
        >
          Send
        </button>
      </form>
    </div>
  );
}
