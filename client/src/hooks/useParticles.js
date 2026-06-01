import { useEffect, useRef } from 'react';

export default function useParticles({ canvasRef, enabled }) {
  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef?.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W = 0;
    let H = 0;
    let particles = [];
    let bgStars = [];
    let mouse = { x: -9999, y: -9999 };
    let raf = null;
    let started = false;
    let heroVis = true;

    /* ── SHARP STAR SPRITES (48px, tight core) ── */
    const SP_N = 28;
    const SP_PX = 48;
    const SP_H = SP_PX / 2;
    const sprites = [];
    for (let i = 0; i < SP_N; i++) {
      const t = i / (SP_N - 1);
      let r, g, b;
      if (t < 0.5) {
        const u = t * 2;
        r = Math.round(u * 74);
        g = Math.round(229 - u * 7);
        b = 255;
      } else {
        const u = (t - 0.5) * 2;
        r = Math.round(74 + u * 93);
        g = Math.round(222 - u * 83);
        b = Math.round(219 + u * 31);
      }

      const sc = document.createElement('canvas');
      sc.width = sc.height = SP_PX;
      const sctx = sc.getContext('2d');
      const grd = sctx.createRadialGradient(SP_H, SP_H, 0, SP_H, SP_H, SP_H);
      grd.addColorStop(0, `rgba(${r},${g},${b},1)`);
      grd.addColorStop(0.06, `rgba(${r},${g},${b},0.95)`);
      grd.addColorStop(0.18, `rgba(${r},${g},${b},0.4)`);
      grd.addColorStop(0.42, `rgba(${r},${g},${b},0.06)`);
      grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
      sctx.fillStyle = grd;
      sctx.fillRect(0, 0, SP_PX, SP_PX);
      sprites.push({ c: sc, css: `rgb(${r},${g},${b})`, r, g, b });
    }

    function buildBgStars() {
      bgStars = [];
      for (let i = 0; i < 240; i++) {
        const rnd = Math.random();
        let r, g, b;
        if (rnd < 0.14) {
          r = 0;
          g = 200;
          b = 255;
        } else if (rnd < 0.24) {
          r = 160;
          g = 130;
          b = 255;
        } else {
          r = 200;
          g = 215;
          b = 255;
        }
        bgStars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          sz: Math.random() * 0.85 + 0.2,
          baseA: Math.random() * 0.28 + 0.08,
          tw: Math.random() * 6.28,
          twSpd: 0.006 + Math.random() * 0.02,
          r,
          g,
          b,
          css: `rgb(${r},${g},${b})`,
        });
      }
    }

    function sampleText() {
      const off = document.createElement('canvas');
      off.width = W;
      off.height = H;
      const oc = off.getContext('2d');

      const sz = Math.min(W * 0.145, 142);
      oc.font = '900 ' + sz + 'px Syne';
      oc.textAlign = 'center';
      oc.textBaseline = 'middle';
      oc.fillStyle = '#fff';
      oc.fillText('ContentIQ', W / 2, H / 2);
      const data = oc.getImageData(0, 0, W, H).data;
      const gap = Math.max(2, Math.ceil(W / 360));
      let pts = [];
      for (let y = 0; y < H; y += gap) {
        for (let x = 0; x < W; x += gap) {
          if (data[(y * W + x) * 4 + 3] > 110) pts.push([x, y]);
        }
      }
      if (pts.length > 3400) {
        const s = pts.length / 3400;
        pts = pts.filter((_, i) => i % Math.ceil(s) === 0);
      }
      return pts;
    }

    function buildParticles() {
      const pts = sampleText();
      if (!pts.length) return;

      let xMin = Infinity,
        xMax = -Infinity;
      for (let i = 0; i < pts.length; i++) {
        const x = pts[i][0];
        if (x < xMin) xMin = x;
        if (x > xMax) xMax = x;
      }
      const xRng = xMax - xMin || 1;
      const cx = W / 2;
      const cy = H / 2;
      const minDim = Math.min(W, H);

      particles = new Array(pts.length);
      for (let i = 0; i < pts.length; i++) {
        const tx = pts[i][0],
          ty = pts[i][1];
        const t = (tx - xMin) / xRng;
        const sp = sprites[Math.min(Math.floor(t * SP_N), SP_N - 1)];

        /* UNIVERSE SPAWN — radial from viewport center, 2.5–5x viewport away */
        const angle = Math.random() * Math.PI * 2;
        const dist = minDim * (2.5 + Math.random() * 2.5);
        const sx = cx + Math.cos(angle) * dist;
        const sy = cy + Math.sin(angle) * dist;

        const spd = 0.4 + Math.random() * 1.2;
        const ivx = ((cx - sx) / dist) * spd;
        const ivy = ((cy - sy) / dist) * spd;

        particles[i] = {
          x: sx,
          y: sy,
          tx,
          ty,
          vx: ivx,
          vy: ivy,
          a: 0,
          sz: 0.5 + Math.random() * 1.0,
          sp,
          dl: Math.random() * 2.4,
          ox: Math.random() * 6.28,
          oa: 0.2 + Math.random() * 0.35,
        };
      }
    }

    const MR = 200,
      MR2 = MR * MR;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      if (started) {
        particles = [];
        buildParticles();
        buildBgStars();
      }
    }

    function loop(ts) {
      if (!heroVis) {
        raf = requestAnimationFrame(loop);
        return;
      }
      ctx.clearRect(0, 0, W, H);
      const t = ts * 0.001;
      const len = particles.length;

      /* ─ PASS 1 ─ */
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < bgStars.length; i++) {
        const s = bgStars[i];
        s.tw += s.twSpd;
        ctx.globalAlpha = s.baseA * (0.5 + 0.5 * Math.sin(s.tw));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.sz, 0, 6.28);
        ctx.fillStyle = s.css;
        ctx.fill();
      }

      /* ─ PASS 2 ─ */
      for (let i = 0; i < len; i++) {
        const p = particles[i];
        if (t < p.dl) continue;

        p.vx += (p.tx + Math.sin(t * 0.65 + p.ox) * p.oa * 0.28 - p.x) * 0.042;
        p.vy += (p.ty + Math.cos(t * 0.5 + p.ox) * p.oa * 0.22 - p.y) * 0.042;

        /* mouse repulsion: radius 200px, force 14 */
        const mx = p.x - mouse.x;
        const my = p.y - mouse.y;
        const d2 = mx * mx + my * my;
        if (d2 < MR2 && d2 > 1) {
          const d = Math.sqrt(d2);
          const f = ((MR - d) / MR) * 14;
          p.vx += (mx / d) * f;
          p.vy += (my / d) * f;
        }

        p.vx *= 0.92;
        p.vy *= 0.92;
        p.x += p.vx;
        p.y += p.vy;
        if (p.a < 0.88) p.a += 0.016;

        const dg = p.sz * 13;
        ctx.globalAlpha = p.a * 0.45;
        ctx.drawImage(p.sp.c, p.x - dg * 0.5, p.y - dg * 0.5, dg, dg);
      }

      /* ─ PASS 3 ─ */
      ctx.globalCompositeOperation = 'source-over';
      for (let i = 0; i < len; i++) {
        const p = particles[i];
        if (t < p.dl || p.a <= 0) continue;
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.55, p.sz * 0.72), 0, 6.28);
        ctx.fillStyle = p.sp.css;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    }

    const onMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    const onTouchMove = (e) => {
      const c = e.touches[0];
      mouse.x = c.clientX;
      mouse.y = c.clientY;
    };
    const onTouchEnd = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd);
    window.addEventListener('resize', resize);

    const io = new IntersectionObserver(
      (e) => {
        heroVis = e[0].isIntersecting;
      },
      { threshold: 0.05 },
    );
    io.observe(canvas);

    document.fonts.ready.then(() => {
      resize();
      buildParticles();
      buildBgStars();
      started = true;
      raf = requestAnimationFrame(loop);
    });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [canvasRef, enabled]);
}

