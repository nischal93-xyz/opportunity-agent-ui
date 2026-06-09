import { useState, useRef, useEffect } from "react";

interface StudentProfile {
  name: string;
  major: string;
  origin: string;
}

interface Message {
  role: "user" | "agent";
  content: string;
}

interface Props {
  profile: StudentProfile;
}

export default function Chat({ profile }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      content: `Hey ${profile.name}! I know what it's like to arrive somewhere new with no idea what opportunities exist. I'm here to change that. Tell me where you are right now, what you're studying, what you're worried about, and I'll tell you exactly what to do next.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = `My name is ${profile.name}. I am from ${profile.origin} studying ${profile.major} at UToledo. ${input}`;
    const displayMessage = input;

    setMessages(prev => [...prev, { role: "user", content: displayMessage }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:4111/api/agents/OpportunityAgent/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: userMessage }],
        }),
      });

      const data = await response.json();
      const agentReply = data.text || data.content?.[0]?.text || "Something went wrong. Try again.";

      setMessages(prev => [...prev, { role: "agent", content: agentReply }]);
    } catch {
      setMessages(prev => [...prev, { role: "agent", content: "Could not reach the agent. Make sure your backend is running on port 4111." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto px-4">
      <div className="py-4 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">OpportunityAgent</h1>
          <p className="text-xs text-gray-500">Mentoring {profile.name} from {profile.origin}</p>
        </div>
        <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">Live</span>
      </div>

      <div className="flex-1 py-6 space-y-6 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-white text-gray-950"
                  : "bg-gray-900 text-gray-100"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-900 rounded-2xl px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="py-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Tell me where you are right now..."
            disabled={loading}
            className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-600 disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-white text-gray-950 font-semibold rounded-xl px-5 py-3 text-sm hover:bg-gray-100 transition-colors disabled:opacity-40"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-2 text-center">Press Enter to send</p>
      </div>
    </div>
  );
}