"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ThemeSelector } from "@/components/ui/theme-selector";

export function ThemeDemo() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Theme Test Components</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Toggle:</span>
          <ThemeToggle />
          <span className="text-sm text-muted-foreground">Selector:</span>
          <ThemeSelector />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Theme Test Card</CardTitle>
            <CardDescription>
              This card should adapt to light/dark themes automatically
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-input">Test Input</Label>
              <Input id="test-input" placeholder="Type something..." />
            </div>
            <div className="flex gap-2">
              <Button>Primary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="secondary">Secondary Button</Button>
            </div>
            <div className="flex gap-2">
              <Button variant="destructive">Destructive</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="link">Link Button</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Color Palette Test</CardTitle>
            <CardDescription>
              Testing all theme colors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-background border rounded">Background</div>
              <div className="p-3 bg-card border rounded">Card</div>
              <div className="p-3 bg-primary text-primary-foreground rounded">Primary</div>
              <div className="p-3 bg-secondary text-secondary-foreground rounded">Secondary</div>
              <div className="p-3 bg-muted text-muted-foreground rounded">Muted</div>
              <div className="p-3 bg-accent text-accent-foreground rounded">Accent</div>
              <div className="p-3 bg-destructive text-destructive-foreground rounded">Destructive</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
