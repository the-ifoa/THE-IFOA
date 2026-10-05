import { useEffect, useRef } from 'react';

/**
 * Responsive, high-performance cosmic parallax starfield from TMS.
 * - 3 distinct star layers (small, medium, big) with continuous upward drift
 * - 3D cursor parallax response with smooth 0.08 lerp
 * - Density matched to 2000x2000 area ratio
 */
export const CosmicParallaxBg = ({
  className = '',
  contentClassName = 'justify-center',
  children,
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const isVisibleRef = useRef(true);
  const mouseRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId = null;
    let width = 0;
    let height = 0;
    let smallStars = [];
    let mediumStars = [];
    let bigStars = [];

    // Initialize lightweight starfield (optimized density for 60fps+ scrolling)
    const initStars = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const rect = container.getBoundingClientRect();
      width = rect.width || window.innerWidth;
      height = rect.height || window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const areaRatio = (width * height) / (1920 * 1080);
      const smallCount = Math.max(70, Math.floor(160 * areaRatio));
      const mediumCount = Math.max(20, Math.floor(45 * areaRatio));
      const bigCount = Math.max(10, Math.floor(20 * areaRatio));

      smallStars = Array.from({ length: smallCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
      }));

      mediumStars = Array.from({ length: mediumCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
      }));

      bigStars = Array.from({ length: bigCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
      }));
    };

    initStars();

    let resizeRaf = null;
    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const newWidth = rect.width || window.innerWidth;
      const newHeight = rect.height || window.innerHeight;
      if (Math.abs(newWidth - width) <= 4 && Math.abs(newHeight - height) <= 150) return;

      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        initStars();
        resizeRaf = null;
      });
    };

    const handleMouseMove = (e) => {
      if (!isVisibleRef.current) return;
      const { innerWidth, innerHeight } = window;
      mouseRef.current.targetX = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      mouseRef.current.targetY = (e.clientY - innerHeight / 2) / (innerHeight / 2);
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      if (!isVisibleRef.current) {
        animationFrameId = null;
        return;
      }

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#FFFFFF';

      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;

      // Layer 1: Small stars
      const smallOffsetX = mouseX * 14;
      const smallOffsetY = mouseY * 14;
      for (let i = 0; i < smallStars.length; i++) {
        const star = smallStars[i];
        star.y -= 0.5;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }
        let drawX = (star.x + smallOffsetX) % width;
        let drawY = (star.y + smallOffsetY) % height;
        if (drawX < 0) drawX += width;
        if (drawY < 0) drawY += height;
        ctx.fillRect(drawX | 0, drawY | 0, 1, 1);
      }

      // Layer 2: Medium stars
      const medOffsetX = mouseX * 26;
      const medOffsetY = mouseY * 26;
      for (let i = 0; i < mediumStars.length; i++) {
        const star = mediumStars[i];
        star.y -= 0.25;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }
        let drawX = (star.x + medOffsetX) % width;
        let drawY = (star.y + medOffsetY) % height;
        if (drawX < 0) drawX += width;
        if (drawY < 0) drawY += height;
        ctx.fillRect(drawX | 0, drawY | 0, 2, 2);
      }

      // Layer 3: Big stars
      const bigOffsetX = mouseX * 45;
      const bigOffsetY = mouseY * 45;
      for (let i = 0; i < bigStars.length; i++) {
        const star = bigStars[i];
        star.y -= 0.15;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }
        let drawX = (star.x + bigOffsetX) % width;
        let drawY = (star.y + bigOffsetY) % height;
        if (drawX < 0) drawX += width;
        if (drawY < 0) drawY += height;
        ctx.fillRect(drawX | 0, drawY | 0, 2.5, 2.5);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // Pause canvas animation completely when scrolled out of viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        isVisibleRef.current = isVisible;
        if (isVisible && !animationFrameId) {
          animationFrameId = requestAnimationFrame(render);
        } else if (!isVisible && animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      },
      { threshold: 0.01 }
    );

    observer.observe(container);
    animationFrameId = requestAnimationFrame(render);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ contain: 'paint layout', willChange: 'transform' }}
      className={
        children
          ? `relative w-full h-full overflow-hidden bg-[radial-gradient(ellipse_at_bottom,_#0f172a_0%,_#020617_100%)] transform-gpu ${className}`
          : `absolute inset-0 w-full h-full pointer-events-none overflow-hidden bg-[radial-gradient(ellipse_at_bottom,_#0f172a_0%,_#020617_100%)] transform-gpu ${className}`
      }
    >
      {/* 60fps+ Space Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {children && (
        <div className={`relative z-10 w-full h-full flex-1 flex flex-col ${contentClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
};

export default CosmicParallaxBg;
