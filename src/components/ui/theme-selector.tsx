"use client";

import * as React from "react";
import { Monitor, Moon, Sun, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const getIcon = (name: string) => {
    switch (name) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      case "system":
        return <Monitor className="h-4 w-4" />;
      default:
        return <Sun className="h-4 w-4" />;
    }
  };

  const label = !mounted
    ? "Theme"
    : theme === "light"
    ? "Light"
    : theme === "dark"
    ? "Dark"
    : "System";

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen((v) => !v)}
        className="gap-2 min-w-[120px]"
      >
        {getIcon((theme as string) || "system")}
        <span>{label}</span>
        <ChevronDown className="h-3 w-3" />
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 rounded-md border border-gray-200 bg-white text-gray-900 shadow-lg z-20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
            <div className="py-1">
              {(["light", "dark", "system"] as const).map((name) => (
                <button
                  key={name}
                  onClick={() => {
                    setTheme(name);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 rounded-sm transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100 ${
                    theme === name ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100" : ""
                  }`}
                >
                  {getIcon(name)}
                  <span className="capitalize">{name}</span>
                  {theme === name && <span className="ml-auto text-xs">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
