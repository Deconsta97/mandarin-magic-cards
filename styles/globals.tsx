import * as React from "react";

/**
 * Mount this once near the root of your Framer app:
 *
 *   <GlobalStyles />
 *
 * Optional:
 *   toggleDarkMode(true)  // adds .dark to <html>
 *   toggleDarkMode(false) // removes .dark from <html>
 */

export function GlobalStyles() {
  return (
    <style
      // Framer supports style tags in code components
      dangerouslySetInnerHTML={{
        __html: `
/* ============ Tokens / Design System ============ */
:root {
  --font-size: 16px;

  /* Typography scale used below (since Tailwind @theme isn't available here) */
  --text-2xl: 1.5rem;
  --text-xl: 1.25rem;
  --text-lg: 1.125rem;
  --text-base: 1rem;

  --background: #ffffff;
  --foreground: oklch(0.145 0 0);
  --card: #ffffff;
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: #030213;
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.95 0.0058 264.53);
  --secondary-foreground: #030213;
  --muted: #ececf0;
  --muted-foreground: #717182;
  --accent: #e9ebef;
  --accent-foreground: #030213;
  --destructive: #d4183d;
  --destructive-foreground: #ffffff;
  --border: rgba(0, 0, 0, 0.1);
  --input: transparent;
  --input-background: #f3f3f5;
  --switch-background: #cbced4;
  --font-weight-medium: 500;
  --font-weight-normal: 400;
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --radius: 0.625rem;

  /* Sidebar palette */
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: #030213;
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);

  /* Derived radii (from @theme inline) */
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

/* Dark scheme overrides (was .dark block) */
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.145 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.145 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.396 0.141 25.723);
  --destructive-foreground: oklch(0.637 0.237 25.331);
  --border: oklch(0.269 0 0);
  --input: oklch(0.269 0 0);
  --ring: oklch(0.439 0 0);

  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);

  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(0.269 0 0);
  --sidebar-ring: oklch(0.439 0 0);
}

/* ============ Global Resets / Base ============ */
html { font-size: var(--font-size); }

*,
*::before,
*::after {
  box-sizing: border-box;
  border-color: var(--border);
  outline-color: color-mix(in oklab, var(--ring) 50%, transparent);
}

body {
  margin: 0;
  background: var(--background);
  color: var(--foreground);
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  line-height: 1.5;
}

/* Base typography (approximation of your @layer base rules) */
h1 { font-size: var(--text-2xl); font-weight: var(--font-weight-medium); line-height: 1.5; margin: 0; }
h2 { font-size: var(--text-xl);  font-weight: var(--font-weight-medium); line-height: 1.5; margin: 0; }
h3 { font-size: var(--text-lg);  font-weight: var(--font-weight-medium); line-height: 1.5; margin: 0; }
h4 { font-size: var(--text-base);font-weight: var(--font-weight-medium); line-height: 1.5; margin: 0; }

p, label, button, input {
  font-size: var(--text-base);
  line-height: 1.5;
}
p, input { font-weight: var(--font-weight-normal); }
label, button { font-weight: var(--font-weight-medium); }

/* Utility: cards/popovers/surfaces can read tokens directly */
      `,
      }}
    />
  );
}

/** Simple helper if you want to flip themes in Framer code components */
export function toggleDarkMode(on: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", on);
}
