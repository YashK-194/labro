import { useState, useEffect } from "react";

const AnimatedHeadline = () => {
  const headlines = [
    "अपनी जरूरत के लिए स्थानीय विशेषज्ञ खोजें, अपनी सेवाएँ जोड़ें, स्थानीय लोगों से जुड़ें",
    "Find Local Experts for Your Needs, List Your Services, Connect with Locals",
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % headlines.length);
    }, 4000); // Change text every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-40 flex justify-center items-center overflow-hidden">
      {headlines.map((headline, index) => (
        <div
          key={index}
          className={`absolute w-full text-center transition-all duration-700 ease-in-out 
            ${
              index === currentIndex
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }
          `}
        >
          {headline}
        </div>
      ))}
    </div>
  );
};

export default AnimatedHeadline;
