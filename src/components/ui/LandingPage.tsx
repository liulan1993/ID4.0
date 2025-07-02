'use client'; // 标记为客户端组件

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// 为动画对象定义 TypeScript 类型
interface TrailPoint {
  x: number;
  y: number;
}

interface Star {
  x: number;
  y: number;
  z: number;
  o: number; // opacity
  trail: TrailPoint[];
}

const LandingPage = () => {
    // 移除 dotGridRef
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const stickyContainerRef = useRef<HTMLDivElement>(null);
    const webglSectionRef = useRef<HTMLDivElement>(null);
    const animatedTextRef = useRef<HTMLDivElement>(null);
    const additionalSectionRef = useRef<HTMLDivElement>(null);
    const additionalContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        
        const canvas = canvasRef.current;
        const stickyContainer = stickyContainerRef.current;
        const webglSection = webglSectionRef.current;
        const animatedText = animatedTextRef.current;
        const additionalSection = additionalSectionRef.current;
        const additionalContent = additionalContentRef.current;

        // 更新安全检查，移除 dotGrid
        if (canvas && stickyContainer && webglSection && animatedText && additionalSection && additionalContent) {
            
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;

            let focalLength = canvas.width * 2;
            let centerX = canvas.width / 2;
            let centerY = canvas.height / 2;
            
            const numStars = 1900;
            const baseTrailLength = 2;
            const maxTrailLength = 30;
            let stars: Star[] = [];
            let warpSpeed = 0;
            let animationActive = true;
            let animationFrameId: number;

            const initializeStars = () => {
                stars = [];
                for (let i = 0; i < numStars; i++) {
                    stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, z: Math.random() * canvas.width, o: 0.5 + Math.random() * 0.5, trail: [] });
                }
            };

            const moveStars = () => {
                stars.forEach(star => {
                    const speed = 1 + warpSpeed * 50;
                    star.z -= speed;
                    if (star.z < 1) {
                        star.z = canvas.width;
                        star.x = Math.random() * canvas.width;
                        star.y = Math.random() * canvas.height;
                        star.trail = [];
                    }
                });
            };

            const drawStars = () => {
                if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
                    canvas.width = canvas.offsetWidth;
                    canvas.height = canvas.offsetHeight;
                    centerX = canvas.width / 2;
                    centerY = canvas.height / 2;
                    focalLength = canvas.width * 2;
                }
                const trailLength = Math.floor(baseTrailLength + warpSpeed * (maxTrailLength - baseTrailLength));
                const clearAlpha = 0.2; 
                ctx.fillStyle = `rgba(17, 17, 17, ${clearAlpha})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                stars.forEach(star => {
                    const px = (star.x - centerX) * (focalLength / star.z) + centerX;
                    const py = (star.y - centerY) * (focalLength / star.z) + centerY;
                    star.trail.push({ x: px, y: py });
                    if (star.trail.length > trailLength) star.trail.shift();
                    if (star.trail.length > 1) {
                        ctx.beginPath();
                        ctx.moveTo(star.trail[0].x, star.trail[0].y);
                        for (let j = 1; j < star.trail.length; j++) ctx.lineTo(star.trail[j].x, star.trail[j].y);
                        ctx.strokeStyle = `rgba(209, 255, 255, ${star.o})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                    ctx.fillStyle = `rgba(209, 255, 255, ${star.o})`;
                    ctx.fillRect(px, py, 1, 1);
                });
            };

            const animate = () => {
                if (animationActive) {
                    animationFrameId = requestAnimationFrame(animate);
                    moveStars();
                    drawStars();
                }
            };
            
            const handleResize = () => {
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
                centerX = canvas.width / 2;
                centerY = canvas.height / 2;
                focalLength = canvas.width * 2;
                // 移除 createDotGrid 调用
            };

            initializeStars();
            animate();

            gsap.timeline({ scrollTrigger: { trigger: stickyContainer, start: "top top", end: "bottom top", scrub: true, onUpdate: (self) => { const p = self.progress; if (p <= 0.6) warpSpeed = p / 0.6; else if (p <= 0.8) warpSpeed = 1; else warpSpeed = 1 - (p - 0.8) / 0.2; } } });
            gsap.to(animatedText, { scrollTrigger: { trigger: stickyContainer, start: "12% top", end: "20% top", scrub: 0.8 }, opacity: 1, y: 0, filter: "blur(0px)", duration: 0.4, ease: "power3.out" });
            const exitTimeline = gsap.timeline({ scrollTrigger: { trigger: stickyContainer, start: "bottom 20%", end: "bottom -10%", scrub: true } });
            exitTimeline.to(animatedText, { opacity: 0, y: -20, filter: "blur(8px)", ease: "power2.in" }, 0).to(webglSection, { opacity: 0, scale: 0.95, ease: "power2.inOut" }, 0.1);
            gsap.to(additionalContent, { scrollTrigger: { trigger: additionalSection, start: "top 80%", toggleActions: "play none none none" }, opacity: 1, y: 0, duration: 1, ease: "power2.out" });
            
            const animationObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { animationActive = entry.isIntersecting; if (animationActive) animate(); }); }, { threshold: 0 });
            animationObserver.observe(stickyContainer);

            window.addEventListener("resize", handleResize);

            return () => {
                window.cancelAnimationFrame(animationFrameId);
                if (animationObserver && stickyContainer) animationObserver.unobserve(stickyContainer);
                window.removeEventListener("resize", handleResize);
                ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            };
        }
    }, []);

    return (
        <div className="animation-container w-full relative bg-transparent">
            {/* 注入动画所需的特定样式 */}
            <style jsx global>{`
                .animation-container {
                  --font-body: "TheGoodMonolith", sans-serif;
                  --font-title: "PP Neue Montreal", sans-serif;
                  --font-size-h1: 3rem;
                  --font-size-h2: 2rem;
                  --letter-spacing-title: -0.03em;
                  --spacing-base: 1rem;
                  --spacing-lg: 2rem;
                  --spacing-md: 1.5rem;
                  --transition-slow: 0.8s ease;
                }
                .sticky-container { position: relative; height: 500vh; width: 100%; margin: 0; }
                .webgl-section { position: sticky; top: 0; left: 0; width: 100%; height: 100vh; display: flex; justify-content: center; align-items: center; z-index: 10; overflow: hidden; }
                .canvas-container { width: 100%; height: 100%; position: relative; display: flex; justify-content: center; align-items: center; }
                canvas#space { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: block; }
                .animated-text { position: absolute; top: auto; left: 50%; transform: translate(-50%, calc(-50% + 40px)); color: #fff; font-family: var(--font-title); font-size: var(--font-size-h1); text-align: center; opacity: 0; z-index: 20; text-transform: uppercase; letter-spacing: var(--letter-spacing-title); pointer-events: none; width: 80%; max-width: 800px; filter: blur(8px); }
                .additional-section { width: 100%; height: 100vh; display: flex; justify-content: center; align-items: center; padding: var(--spacing-lg); position: relative; z-index: 20; overflow: hidden; }
                .additional-content { max-width: 800px; text-align: center; opacity: 0; transform: translateY(30px); }
                .additional-content h2 { font-family: var(--font-title); font-size: var(--font-size-h2); letter-spacing: var(--letter-spacing-title); text-transform: uppercase; margin-bottom: var(--spacing-md); color: #fff; font-weight: normal; }
                .additional-content p { font-size: 1rem; line-height: 1.6; opacity: 0.8; margin-bottom: var(--spacing-base); max-width: 560px; margin-left: auto; margin-right: auto; color: #fff; }
            `}</style>

            {/* 清理后的 JSX 结构 */}
            <div className="sticky-container" ref={stickyContainerRef}>
                <div className="webgl-section" ref={webglSectionRef}>
                    <div className="canvas-container">
                        <canvas id="space" ref={canvasRef}></canvas>
                        <div className="animated-text" ref={animatedTextRef}>
                            CLARITY<br />THROUGH<br />SIMPLICITY
                        </div>
                    </div>
                </div>
            </div>
            <div className="additional-section" ref={additionalSectionRef}>
                <div className="additional-content" ref={additionalContentRef}>
                    <h2>THE ART OF REDUCTION</h2>
                    <p>In a world of constant noise and distraction, true creativity emerges from the space between thoughts. The power of simplicity lies not in what is added, but in what is carefully removed.</p>
                </div>
            </div>
            {/* 移除 dot-grid 元素 */}
        </div>
    );
};

export default LandingPage;
