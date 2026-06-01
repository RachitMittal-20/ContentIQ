import { useEffect } from 'react';

export default function useConstellation({ enabled, canvasRef }) {
  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef?.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    let W = 0;
    let H = 0;
    let dashOff = 0;
    let centers = [];
    let visible = false;
    let raf = null;

    function resize() {
      const wrap = canvas.parentElement;
      W = canvas.width = wrap.offsetWidth;
      H = canvas.height = wrap.offsetHeight;

      centers = Array.from(document.querySelectorAll('.cn')).map((n) => ({
        x: (parseFloat(n.style.left) / 100) * W,
        y: (parseFloat(n.style.top) / 100) * H,
      }));
    }

    function loop() {
      if (!visible) {
        raf = requestAnimationFrame(loop);
        return;
      }
      ctx.clearRect(0, 0, W, H);
      dashOff += 0.35;
      const HUB = 5;
      const len = centers.length;

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,.32)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 10]);
      ctx.lineDashOffset = -dashOff;

      for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          if (i === HUB || j === HUB) continue;
          ctx.moveTo(centers[i].x, centers[i].y);
          ctx.lineTo(centers[j].x, centers[j].y);
        }
      }
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0,229,255,.45)';
      ctx.lineWidth = 1.6;
      for (let j = 0; j < len; j++) {
        if (j === HUB) continue;
        ctx.moveTo(centers[HUB].x, centers[HUB].y);
        ctx.lineTo(centers[j].x, centers[j].y);
      }
      ctx.stroke();

      ctx.setLineDash([]);
      raf = requestAnimationFrame(loop);
    }

    const io = new IntersectionObserver(
      (e) => {
        visible = e[0].isIntersecting;
      },
      { threshold: 0.05 },
    );
    io.observe(canvas);
    window.addEventListener('resize', resize);

    resize();
    loop();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [enabled, canvasRef]);
}

