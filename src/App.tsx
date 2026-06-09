import { useState } from "react";
import Chat from "./components/Chat";
import Onboarding from "./components/Onboarding";

export interface StudentProfile {
  name: string;
  major: string;
  origin: string;
}

function App() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {!profile ? (
        <Onboarding onComplete={setProfile} />
      ) : (
        <Chat profile={profile} />
      )}
    </div>
  );
}

export default App;