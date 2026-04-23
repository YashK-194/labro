"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const useNavigation = () => {
  const pathname = usePathname();
  const [isFindActive, setIsFindActive] = useState(false);
  const [isListActive, setIsListActive] = useState(false);
  const [isProfileActive, setIsProfileActive] = useState(false);

  useEffect(() => {
    setIsFindActive(false);
    setIsListActive(false);
    setIsProfileActive(false);

    switch (pathname) {
      case "/find":
        setIsFindActive(true);
        break;
      case "/list":
        setIsListActive(true);
        break;
      case "/profile":
        setIsProfileActive(true);
        break;
      default:
        break;
    }
  }, [pathname]);

  return {
    isFindActive,
    isListActive,
    isProfileActive,
  };
};

export default useNavigation;
