"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";

interface TEditorProvider {
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  openBrowser: boolean;
  setOpenBrowser: (value: boolean) => void;
}

const initialValue = {
  isLoading: false,
  setIsLoading: () => {},
  openBrowser: false,
  setOpenBrowser: () => {},
};

const EditorProvider = createContext<TEditorProvider>(initialValue);

export const useEditorContext = () => useContext(EditorProvider);

export function EditorProviderComp({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openBrowser, setOpenBrowser] = useState<boolean>(false);

  // Minimum time (ms) the loading indicator should be visible
  const MIN_VISIBLE_MS = 1000;

  // refs to track timings and timers
  const shownAtRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  // clear timers on unmount
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, []);

  const handleLoading = (value?: boolean) => {
    const v = !!value;

    // clear any pending hide timer
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (v) {
      // show immediately
      shownAtRef.current = Date.now();
      setIsLoading(true);
      return;
    }

    // hide logic
    const shownAt = shownAtRef.current ?? 0;
    const elapsed = Date.now() - shownAt;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);

    if (remaining === 0) {
      setIsLoading(false);
      shownAtRef.current = null;
    } else {
      hideTimerRef.current = window.setTimeout(() => {
        setIsLoading(false);
        shownAtRef.current = null;
        hideTimerRef.current = null;
      }, remaining);
    }
  };

  const handleOpenBrowser = (value?: boolean) => {
    setOpenBrowser(value || false);
  };

  return (
    <EditorProvider.Provider
      value={{
        isLoading: isLoading,
        setIsLoading: handleLoading,
        openBrowser: openBrowser,
        setOpenBrowser: handleOpenBrowser,
      }}
    >
      {children}
    </EditorProvider.Provider>
  );
}