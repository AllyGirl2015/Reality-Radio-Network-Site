# Reality Radio Network - Style Guide & Design System

## 📋 Overview

This document provides a complete guide to the visual design, styling patterns, and implementation details of the Reality Radio Network website. Use this as a reference to replicate the style in other projects.

---

## 🎨 Color Palette

### Primary Colors
- **Cyan Neon**: `#00f3ff` / `#0ff` - Main brand color, high-energy accent
- **Purple**: `#a855f7` - Secondary brand color, sophistication
- **Pink**: `#ff1493` / `rgb(255, 20, 147)` - Accent for highlights
- **Indigo**: `#4f46e5` - Deep accent for Discord/community elements

### Background Colors
- **Pure Black**: `#000000` - Main background
- **Black with Opacity**: `rgba(0, 0, 0, 0.4)` / `rgba(0, 0, 0, 0.5)` - Card backgrounds
- **Transparent Overlays**: Various opacity levels (10%, 20%, 30%, 40%, 50%)

### Text Colors
- **White**: `#ffffff` - Primary text
- **Gray Scale**:
  - `text-gray-300` - Body text
  - `text-gray-400` - Secondary text
  - `text-gray-500` - Tertiary/muted text

### Status Colors
- **Red**: `#ef4444` / `rgb(239, 68, 68)` - YouTube, alerts
- **Pink**: `#ec4899` - Instagram
- **Gray**: `#9ca3af` - TikTok, neutral elements
- **Yellow**: `#ffff00` - Special CTAs

---

## 🌌 Space Background

### Implementation

The site features an animated space background with stars and nebulas using HTML5 Canvas.

```tsx
'use client';

import { useEffect, useRef } from 'react';

// Seeded random number generator (mulberry32)
function createSeededRandom(seed: number) {
  return function() {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Convert string to seed number
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export default function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Detect mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;

    // Fixed seed for consistent background
    const seed = hashString('reality-radio-network-space-2025');
    const random = createSeededRandom(seed);

    // Set canvas size
    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Star class
    class Star {
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
      twinkleSpeed: number;
      twinklePhase: number;

      constructor() {
        this.x = random() * (canvas?.width || window.innerWidth);
        this.y = random() * (canvas?.height || window.innerHeight);
        this.size = random() * 2;
        this.speed = random() * 0.05;
        this.opacity = random();
        this.twinkleSpeed = random() * 0.02 + 0.01;
        this.twinklePhase = random() * Math.PI * 2;
      }

      update() {
        this.twinklePhase += this.twinkleSpeed;
        this.opacity = (Math.sin(this.twinklePhase) + 1) / 2;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.8})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Nebula/Galaxy cloud class
    class Nebula {
      x: number;
      y: number;
      size: number;
      color: string;
      opacity: number;
      pulseSpeed: number;
      pulsePhase: number;

      constructor() {
        this.x = random() * (canvas?.width || window.innerWidth);
        this.y = random() * (canvas?.height || window.innerHeight);
        this.size = random() * 300 + 200;
        
        // Neon colors for nebulas
        const colors = [
          'rgba(0, 243, 255, 0.15)', // Cyan
          'rgba(138, 43, 226, 0.15)', // Purple
          'rgba(255, 20, 147, 0.12)', // Pink
          'rgba(0, 255, 255, 0.1)',   // Bright cyan
        ];
        this.color = colors[Math.floor(random() * colors.length)];
        this.opacity = random() * 0.3 + 0.1;
        this.pulseSpeed = random() * 0.001 + 0.0005;
        this.pulsePhase = random() * Math.PI * 2;
      }

      update() {
        this.pulsePhase += this.pulseSpeed;
        this.opacity = (Math.sin(this.pulsePhase) + 1) / 2 * 0.3 + 0.1;
      }

      draw() {
        if (!ctx) return;
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size
        );
        
        gradient.addColorStop(0, this.color.replace(/[\d.]+\)$/g, `${this.opacity})`));
        gradient.addColorStop(0.5, this.color.replace(/[\d.]+\)$/g, `${this.opacity * 0.5})`));
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(
          this.x - this.size,
          this.y - this.size,
          this.size * 2,
          this.size * 2
        );
      }
    }

    // Create stars and nebulas
    const stars: Star[] = [];
    const nebulas: Nebula[] = [];

    // Reduce particles on mobile for better performance
    const starCount = isMobile ? 80 : 200;
    const nebulaCount = isMobile ? 2 : 5;

    for (let i = 0; i < starCount; i++) {
      stars.push(new Star());
    }

    for (let i = 0; i < nebulaCount; i++) {
      nebulas.push(new Nebula());
    }

    // Animation loop
    let lastFrameTime = 0;
    const targetFPS = isMobile ? 30 : 60; // Lower FPS on mobile
    const frameInterval = 1000 / targetFPS;

    function animate(currentTime: number) {
      if (!canvas || !ctx) return;
      
      // Throttle animation frame rate
      const elapsed = currentTime - lastFrameTime;
      if (elapsed < frameInterval) {
        requestAnimationFrame(animate);
        return;
      }
      lastFrameTime = currentTime - (elapsed % frameInterval);
      
      // Clear canvas with dark space color
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw and update nebulas (background layer)
      nebulas.forEach(nebula => {
        nebula.update();
        nebula.draw();
      });

      // Draw and update stars (foreground layer)
      stars.forEach(star => {
        star.update();
        star.draw();
      });

      requestAnimationFrame(animate);
    }

    animate(0);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
      style={{ background: '#000000' }}
    />
  );
}
```

### Key Features:
- **Seeded Random**: Consistent star/nebula positions across page loads
- **Mobile Optimization**: Reduced particle count and FPS on mobile devices
- **Smooth Animation**: 60 FPS on desktop, 30 FPS on mobile
- **Twinkling Stars**: Stars pulse with sine wave opacity
- **Glowing Nebulas**: Radial gradients with pulsing opacity
- **Canvas-based**: Hardware-accelerated rendering
- **Responsive**: Automatically resizes with viewport

### Usage in Layout:
```tsx
import SpaceBackground from "@/components/SpaceBackground";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SpaceBackground />
        {children}
      </body>
    </html>
  );
}
```

---

## 🎯 Button Styles

### Neon Button System

All buttons follow a consistent neon aesthetic with glow effects and smooth transitions.

```css
/* globals.css */

@layer components {
  /* Primary Cyan Button */
  .btn-neon {
    @apply px-8 py-3 rounded-lg font-semibold transition-all duration-300;
    @apply bg-[#00f3ff]/10 border-2 border-[#00f3ff] text-[#00f3ff];
  }
  
  .btn-neon:hover {
    @apply bg-[#00f3ff]/20;
    box-shadow: 0 0 5px #00f3ff, 0 0 15px #00f3ff;
  }
  
  /* Cyan Variant */
  .btn-neon-cyan {
    @apply px-8 py-3 rounded-lg font-semibold transition-all duration-300;
    @apply bg-[#0ff]/10 border-2 border-[#0ff] text-[#0ff];
  }
  
  .btn-neon-cyan:hover {
    @apply bg-[#0ff]/20;
    box-shadow: 0 0 5px #0ff, 0 0 15px #0ff;
  }
  
  /* Purple Button */
  .btn-neon-purple {
    @apply px-8 py-3 rounded-lg font-semibold transition-all duration-300;
    @apply bg-[#a855f7]/30 border-2 border-[#a855f7] text-white;
  }
  
  .btn-neon-purple:hover {
    @apply bg-[#a855f7]/40;
    box-shadow: 0 0 5px #a855f7, 0 0 15px #a855f7;
  }
  
  /* Yellow Button */
  .btn-neon-yellow {
    @apply px-8 py-3 rounded-lg font-semibold transition-all duration-300;
    @apply bg-[#ffff00]/10 border-2 border-[#ffff00] text-[#ffff00];
  }
  
  .btn-neon-yellow:hover {
    @apply bg-[#ffff00]/20;
    box-shadow: 0 0 5px #ffff00, 0 0 15px #ffff00;
  }
}
```

### Button Usage Examples:

```tsx
// Primary CTA
<Link href="/store" className="btn-neon flex items-center gap-2">
  <ShoppingBag className="w-5 h-5" />
  Shop Music
</Link>

// Secondary CTA
<Link href="/talent" className="btn-neon-purple flex items-center gap-2">
  View All Artists
  <ArrowRight className="w-5 h-5" />
</Link>

// Special CTA
<Link href="/store" className="btn-neon-yellow flex items-center gap-2">
  <ShoppingBag className="w-5 h-5" />
  Shop All
</Link>
```

---

## 💳 Card Components

### Neon Card Style

```css
.card-neon {
  @apply bg-black/50 backdrop-blur-sm border border-[#00f3ff]/30 rounded-lg p-6;
  @apply hover:border-[#00f3ff]/60 transition-all duration-300;
}

.card-neon:hover {
  box-shadow: 0 0 3px #00f3ff, 0 0 10px #00f3ff;
}
```

### Standard Card Pattern

Most cards follow this pattern:

```tsx
<div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
  {/* Card content */}
</div>
```

**Variants:**
- `border-purple-500/30` → `hover:border-purple-400`
- `border-cyan-500/30` → `hover:border-cyan-400`
- `border-pink-500/30` → `hover:border-pink-400`

---

## ✨ Text Styles

### Neon Text Effects

```css
/* Primary neon text */
.neon-text {
  @apply text-[#00f3ff];
  text-shadow: 0 0 5px #00f3ff, 0 0 10px #00f3ff;
}

/* Cyan variant */
.neon-text-cyan {
  @apply text-[#0ff];
  text-shadow: 0 0 5px #0ff, 0 0 10px #0ff;
}

/* Purple variant */
.neon-text-purple {
  @apply text-[#a855f7];
  text-shadow: 0 0 5px #a855f7, 0 0 10px #a855f7;
}
```

### Gradient Text

The site extensively uses gradient text for headings:

```tsx
// Cyan to Purple
<span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
  The Future
</span>

// Purple to Pink
<span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
  Artists
</span>

// Cyan via Purple to Pink
<span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
  Vision
</span>

// Animated pulsing gradient
<span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-clip-text text-transparent animate-pulse">
  Starts Here
</span>
```

---

## 🎨 Border Styles

### Neon Borders

```css
/* Primary border */
.neon-border {
  @apply border-2 border-[#00f3ff];
  box-shadow: 0 0 3px #00f3ff, 0 0 10px #00f3ff;
}

/* Cyan variant */
.neon-border-cyan {
  @apply border-2 border-[#0ff];
  box-shadow: 0 0 3px #0ff, 0 0 10px #0ff;
}

/* Purple variant */
.neon-border-purple {
  @apply border-2 border-[#a855f7];
  box-shadow: 0 0 3px #a855f7, 0 0 10px #a855f7;
}
```

### Subtle Borders (Most Common)

```tsx
// Purple borders
<div className="border border-purple-500/30 hover:border-purple-400">

// Cyan borders
<div className="border border-cyan-500/30 hover:border-cyan-400">

// Pink borders  
<div className="border border-pink-500/30 hover:border-pink-400">
```

---

## 🔘 Social Media Icons

### Implementation Pattern

```tsx
{/* Discord - Primary CTA */}
<a 
  href="https://discord.realityradionetwork.com" 
  target="_blank" 
  rel="noopener noreferrer"
  className="flex items-center justify-center gap-3 px-6 py-4 mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-indigo-500/50"
>
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
  <span>Join Discord Server</span>
</a>

{/* Icon Button Pattern */}
<a 
  href="https://www.instagram.com/..." 
  target="_blank" 
  rel="noopener noreferrer"
  className="flex items-center justify-center w-10 h-10 rounded-lg bg-black/50 border border-pink-500/30 hover:border-pink-400 hover:bg-pink-500/10 text-pink-400 transition-all duration-300"
  aria-label="Instagram"
>
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    {/* Instagram SVG path */}
  </svg>
</a>
```

### Color Mapping:
- **Discord**: `indigo-600` to `purple-600` gradient
- **Instagram**: `pink-500/30` border, `pink-400` text
- **TikTok**: `gray-500/30` border, `gray-400` text
- **YouTube**: `red-500/30` border, `red-400` text

---

## 📐 Layout Patterns

### Section Component

```tsx
<Section className="py-12 md:py-16">
  <div className="max-w-5xl mx-auto px-4">
    {/* Content */}
  </div>
</Section>

<Section background="solid">
  {/* Darker background */}
</Section>

<Section background="gradient">
  {/* Gradient background */}
</Section>
```

### Grid Patterns

```tsx
// 3-column responsive grid
<div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
  {/* Items */}
</div>

// 2-column hero layout
<div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-start">
  {/* Left content */}
  {/* Right content */}
</div>
```

---

## 🎬 Animations

### CSS Animations

```css
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.animate-scale-in {
  animation: scale-in 0.4s ease-out;
}
```

### Transition Classes

```tsx
// Standard transition
className="transition-all duration-300"

// Hover scale
className="hover:scale-110 transition-transform duration-300"

// Hover shadow
className="hover:shadow-lg hover:shadow-purple-500/20 transition-all"
```

---

## 🖱️ Interactive Elements

### Hover Effects

```tsx
// Card hover
className="hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"

// Button hover
className="hover:bg-[#00f3ff]/20"
// + box-shadow: 0 0 5px #00f3ff, 0 0 15px #00f3ff

// Image hover
className="group-hover:scale-110 transition-transform duration-300"

// Text hover
className="group-hover:text-purple-300 transition-colors"
```

---

## 🎯 Component Patterns

### Artist/Product Card

```tsx
<Link
  href={artist.href}
  className="group bg-black/40 border border-purple-500/30 rounded-lg overflow-hidden p-4 sm:p-6 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
>
  <div className="aspect-square mb-4 rounded-lg overflow-hidden relative">
    <Image
      src={artist.image}
      alt={artist.name}
      fill
      className="object-cover group-hover:scale-110 transition-transform duration-300"
    />
  </div>
  <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent group-hover:from-purple-400 group-hover:to-pink-400 transition-all">
    {artist.name}
  </h3>
  <p className="text-gray-400 text-sm">{artist.genre}</p>
</Link>
```

### Stats Display

```tsx
<div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 mt-6 md:mt-8 pt-6 md:pt-8 border-t border-purple-500/20">
  <div>
    <div className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
      22+
    </div>
    <div className="text-xs sm:text-sm text-gray-400 mt-1">Artists</div>
  </div>
  {/* More stats */}
</div>
```

---

## 📱 Responsive Design

### Breakpoint Strategy

```tsx
// Mobile First Approach
className="text-sm sm:text-base md:text-lg lg:text-xl"

// Padding Scale
className="p-4 sm:p-6 md:p-8"

// Gap Scale
className="gap-3 sm:gap-4 md:gap-6 lg:gap-8"

// Grid Columns
className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
```

### Common Responsive Patterns

```tsx
// Hero heading
className="text-3xl sm:text-4xl md:text-4xl lg:text-4xl xl:text-5xl"

// Section padding
className="py-12 md:py-16 lg:py-20"

// Container max-width
className="max-w-5xl mx-auto px-4"

// Flex direction change
className="flex flex-col sm:flex-row"
```

---

## 🔍 Accessibility

### Focus States

```css
.focus\:not-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: 0.5rem 1rem;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

### Skip to Content Link

```tsx
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#00f3ff] focus:text-black focus:rounded-lg focus:font-semibold">
  Skip to main content
</a>
```

### Aria Labels

```tsx
<a aria-label="Instagram" href="...">
<a aria-label="YouTube RBEW" href="...">
```

---

## 🎨 Custom Scrollbar

```css
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #000;
}

::-webkit-scrollbar-thumb {
  background: #00f3ff;
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: #0ff;
  box-shadow: 0 0 10px #0ff;
}
```

---

## 🚀 Performance Optimizations

### Mobile Considerations

1. **Reduced Particle Count**: 80 stars on mobile vs 200 on desktop
2. **Lower FPS**: 30 FPS on mobile vs 60 FPS on desktop
3. **Simpler Effects**: Fewer nebulas (2 vs 5)
4. **Optimized Images**: Use Next.js Image component with proper sizing

### Best Practices

```tsx
// Lazy load images
import Image from 'next/image';

<Image
  src={image}
  alt={alt}
  fill
  className="object-cover"
/>

// Suppress hydration warnings when needed
<body suppressHydrationWarning={true}>

// Use 'use client' for interactive components
'use client';
```

---

## 📦 Complete Globals CSS

```css
@import "tailwindcss";

:root {
  --background: #000000;
  --foreground: #ffffff;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

@layer components {
  .neon-text {
    @apply text-[#00f3ff];
    text-shadow: 0 0 5px #00f3ff, 0 0 10px #00f3ff;
  }
  
  .neon-text-cyan {
    @apply text-[#0ff];
    text-shadow: 0 0 5px #0ff, 0 0 10px #0ff;
  }
  
  .neon-text-purple {
    @apply text-[#a855f7];
    text-shadow: 0 0 5px #a855f7, 0 0 10px #a855f7;
  }
  
  .neon-border {
    @apply border-2 border-[#00f3ff];
    box-shadow: 0 0 3px #00f3ff, 0 0 10px #00f3ff;
  }
  
  .neon-border-cyan {
    @apply border-2 border-[#0ff];
    box-shadow: 0 0 3px #0ff, 0 0 10px #0ff;
  }
  
  .neon-border-purple {
    @apply border-2 border-[#a855f7];
    box-shadow: 0 0 3px #a855f7, 0 0 10px #a855f7;
  }
  
  .btn-neon {
    @apply px-8 py-3 rounded-lg font-semibold transition-all duration-300;
    @apply bg-[#00f3ff]/10 border-2 border-[#00f3ff] text-[#00f3ff];
  }
  
  .btn-neon:hover {
    @apply bg-[#00f3ff]/20;
    box-shadow: 0 0 5px #00f3ff, 0 0 15px #00f3ff;
  }
  
  .btn-neon-cyan {
    @apply px-8 py-3 rounded-lg font-semibold transition-all duration-300;
    @apply bg-[#0ff]/10 border-2 border-[#0ff] text-[#0ff];
  }
  
  .btn-neon-cyan:hover {
    @apply bg-[#0ff]/20;
    box-shadow: 0 0 5px #0ff, 0 0 15px #0ff;
  }
  
  .btn-neon-purple {
    @apply px-8 py-3 rounded-lg font-semibold transition-all duration-300;
    @apply bg-[#a855f7]/30 border-2 border-[#a855f7] text-white;
  }
  
  .btn-neon-purple:hover {
    @apply bg-[#a855f7]/40;
    box-shadow: 0 0 5px #a855f7, 0 0 15px #a855f7;
  }
  
  .btn-neon-yellow {
    @apply px-8 py-3 rounded-lg font-semibold transition-all duration-300;
    @apply bg-[#ffff00]/10 border-2 border-[#ffff00] text-[#ffff00];
  }
  
  .btn-neon-yellow:hover {
    @apply bg-[#ffff00]/20;
    box-shadow: 0 0 5px #ffff00, 0 0 15px #ffff00;
  }
  
  .card-neon {
    @apply bg-black/50 backdrop-blur-sm border border-[#00f3ff]/30 rounded-lg p-6;
    @apply hover:border-[#00f3ff]/60 transition-all duration-300;
  }
  
  .card-neon:hover {
    box-shadow: 0 0 3px #00f3ff, 0 0 10px #00f3ff;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #000;
}

::-webkit-scrollbar-thumb {
  background: #00f3ff;
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: #0ff;
  box-shadow: 0 0 10px #0ff;
}

/* Screen reader only - accessible but invisible */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.focus\:not-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: 0.5rem 1rem;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.animate-scale-in {
  animation: scale-in 0.4s ease-out;
}
```

---

## 🎯 Quick Reference

### Most Used Color Combinations

1. **Card Background**: `bg-black/40 border border-purple-500/30`
2. **Hover Effect**: `hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20`
3. **Gradient Text**: `bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent`
4. **Button**: `btn-neon` or `btn-neon-purple` or `btn-neon-yellow`
5. **Section Padding**: `py-12 md:py-16` or `py-8 sm:py-12 md:py-16 lg:py-20`

### Typography Scale

```
Headings:
- Hero: text-3xl sm:text-4xl md:text-4xl lg:text-4xl xl:text-5xl
- H2: text-3xl md:text-4xl lg:text-5xl
- H3: text-xl md:text-2xl
- H4: text-lg md:text-xl

Body:
- Primary: text-sm sm:text-base md:text-lg
- Secondary: text-xs sm:text-sm
```

---

## 📝 Implementation Checklist

To replicate this style in another project:

- [ ] Copy `SpaceBackground.tsx` component
- [ ] Copy entire `globals.css` file
- [ ] Set up Tailwind CSS with Next.js
- [ ] Install Inter font from Google Fonts
- [ ] Create neon button components
- [ ] Implement gradient text patterns
- [ ] Set up card hover effects
- [ ] Configure responsive breakpoints
- [ ] Add custom scrollbar styles
- [ ] Implement accessibility features (skip link, aria-labels)
- [ ] Test on mobile devices for performance

---

## 🎓 Design Philosophy

The Reality Radio Network style is built on these principles:

1. **Futuristic Aesthetic**: Space-themed background with neon accents
2. **High Contrast**: Pure black background with vibrant neon colors
3. **Smooth Interactions**: All transitions are 300ms with ease curves
4. **Mobile-First**: Optimized for performance on all devices
5. **Accessibility**: Proper ARIA labels, focus states, and skip links
6. **Consistency**: Repeating patterns across all components
7. **Gradients Over Solid**: Text and backgrounds use multi-color gradients
8. **Glow Effects**: Hover states add neon glow with box-shadow
9. **Glass Morphism**: Cards use backdrop-blur with transparency
10. **Performance**: Canvas animations throttled for mobile devices

---

**Created for Reality Radio Network**  
**Style Guide Version 1.0 - November 2025**
