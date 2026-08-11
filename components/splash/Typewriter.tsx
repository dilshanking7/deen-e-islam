"use client";

import { useEffect, useState } from "react";

const text = "Islaam-E-Deen";

export default function Typewriter() {
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);

  const [showLearn, setShowLearn] = useState(false);
  const [showPractice, setShowPractice] = useState(false);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    if (index < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + text[index]);
        setIndex(index + 1);
      }, 70);

      return () => clearTimeout(timer);
    } else {
      setTimeout(() => setShowLearn(true), 150);
      setTimeout(() => setShowPractice(true), 450);
      setTimeout(() => setShowShare(true), 750);
    }
  }, [index]);

  return (
    <div className="flex flex-col items-center mt-6 relative z-20">

      <h1 className="text-4xl md:text-5xl font-bold text-green-700 tracking-wide">
        {displayText}
      </h1>

      <div className="flex gap-5 mt-5 text-base font-semibold">

        <span
          className={`transition-all duration-500 ${
            showLearn ? "opacity-100 translate-y-0 text-green-600" : "opacity-0 translate-y-2"
          }`}
        >
          Learn
        </span>

        <span
          className={`transition-all duration-500 ${
            showPractice ? "opacity-100 translate-y-0 text-blue-600" : "opacity-0 translate-y-2"
          }`}
        >
          Practice
        </span>

        <span
          className={`transition-all duration-500 ${
            showShare ? "opacity-100 translate-y-0 text-yellow-600" : "opacity-0 translate-y-2"
          }`}
        >
          Share Islam
        </span>

      </div>

    </div>
  );
}