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
