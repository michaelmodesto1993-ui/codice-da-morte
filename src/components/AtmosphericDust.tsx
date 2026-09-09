import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  baseAlpha: number;
  vx: number;
  vy: number;
  pulseSpeed: number;
  pulseAngle: number;
  isAmberSpark: boolean;
}

export const AtmosphericDust: React.FC<{ density?: number; className?: string }> = ({
  density = 28,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Initialize particles
    const particles: Particle[] = [];
    const count = Math.min(Math.max(16, density), 45);

    for (let i = 0; i < count; i++) {
      const isAmberSpark = Math.random() < 0.35;
      const baseAlpha = isAmberSpark ? 0.25 + Math.random() * 0.35 : 0.12 + Math.random() * 0.2;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: isAmberSpark ? 0.8 + Math.random() * 1.4 : 0.6 + Math.random() * 1.2,
        alpha: baseAlpha,
        baseAlpha,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -0.15 - Math.random() * 0.3, // Gentle upward draft like fireplace/lantern heat
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulseAngle: Math.random() * Math.PI * 2,
        isAmberSpark,
      });
    }

    let lastTime = performance.now();

    const render = (time: number) => {
      // Pause if tab is inactive to save battery
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx * dt * 60;
        p.y += p.vy * dt * 60;
        p.pulseAngle += p.pulseSpeed;
        p.alpha = Math.max(0.05, p.baseAlpha + Math.sin(p.pulseAngle) * 0.12);

        // Wrap around boundaries
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

        if (p.isAmberSpark) {
          ctx.fillStyle = `rgba(245, 158, 11, ${p.alpha})`;
        } else {
          ctx.fillStyle = `rgba(224, 216, 208, ${p.alpha * 0.7})`;
        }

        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none select-none z-0 opacity-60 transition-opacity duration-1000 ${className}`}
      aria-hidden="true"
    />
  );
};
