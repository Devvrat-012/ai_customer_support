"use client";

import * as React from "react";
import { Monitor, Moon, Sun, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeSelector() {
  const { theme, setTheme, themes } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2">
        <Sun className="h-4 w-4" />
        <span>Theme</span>
        <ChevronDown className="h-3 w-3" />
      </Button>
    );
  }

  const getIcon = (themeName: string) => {
    switch (themeName) {
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

  const getCurrentThemeLabel = () => {
    switch (theme) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case "system":
        return "System";
      default:
        return "Theme";
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 min-w-[100px]"
      >
        {getIcon(theme || "system")}
        <span>{getCurrentThemeLabel()}</span>
        <ChevronDown className="h-3 w-3" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-md shadow-lg z-20">
            <div className="py-1">
              {["light", "dark", "system"].map((themeName) => (
                <button
                  key={themeName}
                  onClick={() => {
                    setTheme(themeName);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-3 ${
                    theme === themeName ? "bg-accent text-accent-foreground" : ""
                  }`}
                >
                  {getIcon(themeName)}
                  <span className="capitalize">{themeName}</span>
                  {theme === themeName && (
                    <span className="ml-auto text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
