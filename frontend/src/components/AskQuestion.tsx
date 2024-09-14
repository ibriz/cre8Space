import { useState } from "react";
import { AskIcon } from "./Icons";
import Chat from "./Chat";

const AskQuestion = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <div
        className="cursor-pointer rounded-3xl border border-primary bg-white px-3"
        onClick={() => setIsChatOpen(true)}
      >
        <div className="flex items-center justify-center gap-2">
          <AskIcon className="w-20 text-primary" />
          <div className="text-xl font-semibold text-primary">
            Ask Questions
          </div>
        </div>
      </div>
      {isChatOpen && <Chat onClose={() => setIsChatOpen(false)} />}
    </>
  );
};

export default AskQuestion;
