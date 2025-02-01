import { useState, useEffect } from 'react';

const AnimatedHeadline = () => {
  const headlines = [
    "Find Local Experts for Your Needs",
    "List Your Services, Connect with Locals"
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % headlines.length);
      }, 1000); // Wait time after the first line slides out
      
      // Reset animation state after both slide-out and slide-in are complete
      setTimeout(() => {
        setIsAnimating(false);
      }, 3000); // Time after full animation cycle
      
    }, 6000); // Increased from 6000 to 8000 to show second heading longer

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden h-24 sm:h-32">
      <div
        className={`transform transition-all duration-700 ease-in-out absolute w-full
          ${isAnimating ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}
      >
        {headlines[currentIndex]}
      </div>
      <div
        className={`transform transition-all duration-700 ease-in-out absolute w-full
          ${isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
      >
        {headlines[(currentIndex + 1) % headlines.length]}
      </div>
    </div>
  );
};

export default AnimatedHeadline;
