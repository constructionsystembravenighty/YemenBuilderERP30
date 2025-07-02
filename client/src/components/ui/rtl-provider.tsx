import { createContext, useContext, useEffect } from "react";

const RTLContext = createContext<{
  isRTL: boolean;
  setRTL: (isRTL: boolean) => void;
}>({
  isRTL: true,
  setRTL: () => {},
});

export function RTLProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Set RTL direction on document
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "ar";
    
    // Add Arabic font class
    document.body.classList.add("text-arabic");
  }, []);

  const setRTL = (isRTL: boolean) => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = isRTL ? "ar" : "en";
  };

  return (
    <RTLContext.Provider value={{ isRTL: true, setRTL }}>
      {children}
    </RTLContext.Provider>
  );
}

export const useRTL = () => useContext(RTLContext);
