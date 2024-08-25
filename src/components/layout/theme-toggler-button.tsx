"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggler({ className }: { className?: string }) {
  const { theme, setTheme, systemTheme } = useTheme();

  const currentTheme = theme === "system" ? systemTheme : theme;

  const toggleTheme = () => {
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      onClick={ toggleTheme }
      variant="ghost"
      className={ cn("aspect-square p-0", className) }
    >
      <Sun className="hidden dark:block w-5 h-5" />
      <Moon className="dark:hidden w-5 h-5 " />
    </Button>
  );
}
