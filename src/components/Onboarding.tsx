import { useState } from "react";

interface StudentProfile {
  name: string;
  major: string;
  origin: string;
}

interface Props {
  onComplete: (profile: StudentProfile) => void;
}

export default function Onboarding({ onComplete }: Props) {
  const [name, setName] = useState("");
  const [major, setMajor] = useState("");
  const [origin, setOrigin] = useState("");

  const handleSubmit = () => {
    if (!name || !major || !origin) return;
    onComplete({ name, major, origin });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">OpportunityAgent</h1>
          <p className="text-gray-400 text-sm">
            Your personal mentor for navigating opportunities at UToledo.
            Built for students who figured it out the hard way.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nischal"
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Your Major</label>
            <input
              type="text"
              value={major}
              onChange={e => setMajor(e.target.value)}
              placeholder="Computer Science"
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Where are you from?</label>
            <input
              type="text"
              value={origin}
              onChange={e => setOrigin(e.target.value)}
              placeholder="Nepal"
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-white text-gray-950 font-semibold rounded-lg px-4 py-3 mt-2 hover:bg-gray-100 transition-colors"
          >
            Find My Opportunities
          </button>
        </div>
      </div>
    </div>
  );
}