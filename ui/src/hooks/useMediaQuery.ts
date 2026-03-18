import { useState, useEffect } from "react";

interface MediaQueryState {
  isMobile: boolean;
  isTablet: boolean;
  isLaptop: boolean;
}

export const useMediaQuery = (): MediaQueryState => {
  const [state, setState] = useState<MediaQueryState>({
    isMobile: false,
    isTablet: false,
    isLaptop: false,
  });

  useEffect(() => {
    const handleMediaChange = () => {
      const isMobile = window.matchMedia("(max-width: 640px)").matches;
      const isTablet = window.matchMedia(
        "(min-width: 641px) and (max-width: 1024px)",
      ).matches;
      const isLaptop = window.matchMedia("(min-width: 1025px)").matches;

      setState({ isMobile, isTablet, isLaptop });
    };

    handleMediaChange();

    const mobileQuery = window.matchMedia("(max-width: 640px)");
    const tabletQuery = window.matchMedia(
      "(min-width: 641px) and (max-width: 1024px)",
    );
    const laptopQuery = window.matchMedia("(min-width: 1025px)");

    mobileQuery.addEventListener("change", handleMediaChange);
    tabletQuery.addEventListener("change", handleMediaChange);
    laptopQuery.addEventListener("change", handleMediaChange);

    return () => {
      mobileQuery.removeEventListener("change", handleMediaChange);
      tabletQuery.removeEventListener("change", handleMediaChange);
      laptopQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  return state;
};
