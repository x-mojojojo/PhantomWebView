// EntropyFingerprint.tsx — visual "entropy" canvas for Identity Setup.
// Draws a hexagon with 6 lines radiating from the center, sized/rotated
// from a DJB hash of `name:password`, with a pulsing alpha animation.

import { useEffect, useRef } from 'react';
import { djbHash } from '../crypto/SeedGenerator';

interface Props {
  fullName: string;
  masterPassword: string;
  size?: number;
}

export function EntropyFingerprint({ fullName, masterPassword, size = 220 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const seedInput = `${fullName}:${masterPassword}`;
    const hash = djbHash(seedInput || 'empty-seed');
    const hasSeed = fullName.trim().length > 0 || masterPassword.trim().length > 0;

    const cx = size / 2;
    const cy = size / 2;
    const baseRadius = size * 0.34;

    let start: number | null = null;

    function frame(t: number) {
      if (start === null) start = t;
      const elapsed = (t - start) / 1000;
      const pulse = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(elapsed * 1.8));

      ctx!.clearRect(0, 0, size, size);

      // Outer hexagon
      ctx!.save();
      ctx!.translate(cx, cy);
      const rotation = ((hash % 360) * Math.PI) / 180;
      ctx!.rotate(rotation * 0.15);

      ctx!.strokeStyle = hasSeed ? `rgba(52, 211, 153, ${0.25 + pulse * 0.4})` : 'rgba(255,255,255,0.08)';
      ctx!.lineWidth = 1.5;
      ctx!.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const r = baseRadius * (0.85 + 0.15 * (((hash >> (i * 3)) & 0xff) / 255));
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        if (i === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      }
      ctx!.closePath();
      ctx!.stroke();

      // 6 radiating lines
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const byte = (hash >> (i * 4)) & 0xff;
        const r = baseRadius * (0.4 + (byte / 255) * 0.65);
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        ctx!.strokeStyle = hasSeed
          ? `rgba(110, 231, 183, ${0.3 + pulse * 0.5})`
          : 'rgba(255,255,255,0.06)';
        ctx!.lineWidth = 2;
        ctx!.beginPath();
        ctx!.moveTo(0, 0);
        ctx!.lineTo(x, y);
        ctx!.stroke();

        ctx!.fillStyle = hasSeed ? `rgba(52, 211, 153, ${0.5 + pulse * 0.5})` : 'rgba(255,255,255,0.15)';
        ctx!.beginPath();
        ctx!.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx!.fill();
      }

      // Center dot
      ctx!.fillStyle = hasSeed ? `rgba(52, 211, 153, ${0.6 + pulse * 0.4})` : 'rgba(255,255,255,0.2)';
      ctx!.beginPath();
      ctx!.arc(0, 0, 4, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.restore();

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [fullName, masterPassword, size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} className="mx-auto" />;
}
