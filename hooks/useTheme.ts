import { useState, useEffect } from "react";

type Theme = "dark" | "light" | "orange" | "green" | "architect" | "xmas";

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>("xmas");

  // Load theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (
      savedTheme === "light" ||
      savedTheme === "dark" ||
      savedTheme === "orange" ||
      savedTheme === "green" ||
      savedTheme === "architect" ||
      savedTheme === "xmas"
    ) {
      setTheme(savedTheme as Theme);
    } else {
      setTheme("xmas");
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    document.body.classList.remove(
      "light",
      "orange",
      "green",
      "architect",
      "xmas"
    );
    if (theme !== "dark") {
      document.body.classList.add(theme);
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, setTheme };
};
