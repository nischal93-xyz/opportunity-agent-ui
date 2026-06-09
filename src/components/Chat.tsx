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
      content: `Hey ${profile.name}! I know what it's like to arrive somewhere new with no idea what opportunities exist. I'm here to change that. Tell me where you are right now, what you're studying, what you're worried about, and I'll tell you exactly what to do next. You can also upload your resume and I'll give you specific advice based on your actual background.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const extractTextFromFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === "string" && result.length > 0) {
          resolve(result);
        } else {
          resolve("Student resume uploaded but could not be parsed. Please describe your background instead.");
        }
      };
      reader.onerror = () => resolve("Could not read file.");
      reader.readAsText(file, "utf-8");
    });
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessages(prev => [...prev, { role: "user", content: "Uploaded resume: " + file.name }]);

    const text = await extractTextFromFile(file);
    const userMessage = `My name is ${profile.name}. I am from ${profile.origin} studying ${profile.major} at UToledo. RESUME: ${text}`;

    try {
      const response = await fetch("/api/agents/OpportunityAgent/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: userMessage }],
        }),
      });

      const data = await response.json();
      const agentReply = data.text || data.content?.[0]?.text || "Something went wrong. Try again.";

      setMessages(prev => [...prev, { role: "agent", content: agentReply }]);
      setResumeUploaded(true);
    } catch {
      setMessages(prev => [...prev, { role: "agent", content: "Could not reach the agent." }]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = `My name is ${profile.name}. I am from ${profile.origin} studying ${profile.major} at UToledo. ${input}`;
    const displayMessage = input;

    setMessages(prev => [...prev, { role: "user", content: displayMessage }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/agents/OpportunityAgent/generate", {
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
      setMessages(prev => [...prev, { role: "agent", content: "Could not reach the agent. Make sure your backend is running." }]);
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
        <div className="flex items-center gap-2">
          {resumeUploaded && (
            <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full">Resume loaded</span>
          )}
          <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">Live</span>
        </div>
      </div>

      <div className="flex-1 py-6 space-y-6 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user" ? "bg-white text-gray-950" : "bg-gray-900 text-gray-100"}`}>
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
        <div className="flex gap-2 mb-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleResumeUpload}
            accept=".txt,.pdf,.doc,.docx"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="text-xs text-gray-400 border border-gray-700 rounded-lg px-3 py-2 hover:border-gray-500 transition-colors disabled:opacity-40"
          >
            Upload Resume
          </button>
          {resumeUploaded && (
            <span className="text-xs text-gray-500 flex items-center">Resume analyzed</span>
          )}
        </div>
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