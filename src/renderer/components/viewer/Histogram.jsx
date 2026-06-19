import React, { useEffect, useRef, useState } from 'react';

const CANVAS_W = 256;
const CANVAS_H = 80;

export default function Histogram({ imagePath }) {
  const canvasRef = useRef(null);
  const [histData, setHistData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!imagePath) { setHistData(null); return; }
    let cancelled = false;
    setLoading(true);
    setError(false);

    (async () => {
      try {
        const r = await window.api.invoke('image:getHistogram', imagePath);
        if (cancelled) return;
        if (r.data) {
          setHistData(r.data);
        } else {
          setError(true);
        }
      } catch (e) {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [imagePath]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !histData) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    canvas.style.width = CANVAS_W + 'px';
    canvas.style.height = CANVAS_H + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Grid lines
    ctx.strokeStyle = '#E5E5EA';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < CANVAS_W; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i + 0.5, 0);
      ctx.lineTo(i + 0.5, CANVAS_H);
      ctx.stroke();
    }
    for (let pct = 25; pct < 100; pct += 25) {
      const y = CANVAS_H * (1 - pct / 100);
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(CANVAS_W, y + 0.5);
      ctx.stroke();
    }

    const { red, green, blue, max } = histData;
    if (max === 0) return;

    const scale = CANVAS_H / max;

    const drawChannel = (values, color, alpha) => {
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_H);
      for (let x = 0; x < CANVAS_W; x++) {
        const y = CANVAS_H - values[x] * scale;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(CANVAS_W - 1, CANVAS_H);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    ctx.globalCompositeOperation = 'multiply';
    drawChannel(red, '#FF3B30', 0.7);
    drawChannel(green, '#34C759', 0.6);
    drawChannel(blue, '#007AFF', 0.6);
    ctx.globalCompositeOperation = 'source-over';
  }, [histData]);

  if (!imagePath) return null;

  const panelW = CANVAS_W + 16;

  return (
    <div
      className="glass rounded-xl border border-surface-300 shadow-ios overflow-hidden"
      style={{ width: panelW }}
    >
      <div className="px-2 py-1 text-2xs text-surface-800 border-b border-surface-200 flex items-center justify-between">
        <span>直方图</span>
        <span className="text-surface-700">RGB</span>
      </div>
      <div className="p-1.5 flex items-center justify-center">
        {loading ? (
          <div style={{ width: CANVAS_W, height: CANVAS_H }} className="flex items-center justify-center bg-surface-100 rounded-lg">
            <div className="w-4 h-4 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div style={{ width: CANVAS_W, height: CANVAS_H }} className="flex items-center justify-center bg-surface-100 rounded-lg text-2xs text-surface-700">
            无法生成直方图
          </div>
        ) : (
          <canvas ref={canvasRef} className="rounded-lg" />
        )}
      </div>
    </div>
  );
}
