"use client";

import { useState } from "react";
import LandingPage from "@/components/landing";
import MainApp from "@/components/main-app";
import { useTheme } from "@/hooks/useTheme";
import type { AppTab } from "@/types/app";

export default function Home() {
  const [showApp, setShowApp] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>("exterior");
  const { theme, setTheme } = useTheme();

  const handleQuickLink = (tab: AppTab) => {
    setActiveTab(tab);
    setShowApp(true);
  };

  return (
    <>
      {!showApp && (
        <LandingPage
          onEnter={() => setShowApp(true)}
          onQuickLink={handleQuickLink}
        />
      )}
      {showApp && (
        <MainApp
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          theme={theme}
          setTheme={setTheme}
          onBackToHome={() => setShowApp(false)}
        />
      )}
    </>
  );
}
