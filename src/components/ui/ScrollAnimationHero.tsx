'use client';

import React, { useRef, useState, useId, useEffect } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
// 修复：移除了未使用的 'twMerge' 和 'ClassNameValue'
// import { twMerge, ClassNameValue } from 'tailwind-merge';

// --- 类型定义 ---
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

// 扩展全局 Window 接口以包含 GSAP
declare global {
    interface Window {
        gsap: typeof gsap;
        ScrollTrigger: typeof ScrollTrigger;
    }
}

// 修复：移除了未使用的 'cn' 函数
// function cn(...inputs: ClassNameValue[]) {
//   return twMerge(inputs);
// }

// --- 场景一：星空穿梭组件 ---
const LandingPage = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 确保 GSAP 插件只在客户端注册
        if (typeof window !== "undefined") {
            gsap.registerPlugin(ScrollTrigger);
        }
        
        const canvas = canvasRef.current;
        const container = containerRef.current;
        const text = textRef.current;

        if (canvas && container && text) {
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;

            // 修复：将 'let' 改为 'const'，因为这些变量未被重新赋值
            const focalLength = canvas.width * 2;
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            const numStars = 1900;
            let stars: Star[] = [];
            let warpSpeed = 0;
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
                    }
                });
            };

            const drawStars = () => {
                if(!ctx) return;
                ctx.fillStyle = `rgba(17, 17, 17, 0.2)`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                stars.forEach(star => {
                    const px = (star.x - centerX) * (focalLength / star.z) + centerX;
                    const py = (star.y - centerY) * (focalLength / star.z) + centerY;
                    ctx.fillStyle = `rgba(209, 255, 255, ${star.o})`;
                    ctx.fillRect(px, py, 1, 1);
                });
            };

            const animate = () => {
                animationFrameId = requestAnimationFrame(animate);
                moveStars();
                drawStars();
            };
            
            initializeStars();
            animate();

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: "#scroll-animation-hero-container",
                    start: "top top",
                    end: "33% top",
                    scrub: true,
                }
            });

            tl.to(text, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.4, ease: "power3.out" }, 0);
            tl.to(container, {
                onUpdate: () => {
                    const progress = tl.progress();
                    if (progress <= 0.6) warpSpeed = progress / 0.6;
                    else if (progress <= 0.8) warpSpeed = 1;
                    else warpSpeed = 1 - (progress - 0.8) / 0.2;
                }
            }, 0);
            
            return () => {
                if (animationFrameId) {
                    window.cancelAnimationFrame(animationFrameId);
                }
                // 清理 GSAP 实例
                tl.kill();
                ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            };
        }
    }, []);

    return (
        <div ref={containerRef} className="h-full w-full relative bg-black flex justify-center items-center">
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full"></canvas>
            <div ref={textRef} className="absolute text-white text-3xl md:text-5xl text-center uppercase tracking-tighter opacity-0 filter blur-lg" style={{fontFamily: '"PP Neue Montreal", sans-serif'}}>
                CLARITY<br />THROUGH<br />SIMPLICITY
            </div>
        </div>
    );
};

// --- 场景二：图片拆分组件 ---
const PUZZLE_IMAGE = "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&id=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

function getRoundedPolygonPath(points: {x: number, y: number}[], radius: number): string {
    if (points.length < 3) return '';
    let pathData = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length; i++) {
        const p0 = points[i === 0 ? points.length - 1 : i - 1];
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];
        const v1 = { x: p0.x - p1.x, y: p0.y - p1.y };
        const v2 = { x: p2.x - p1.x, y: p2.y - p1.y };
        const len1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
        const len2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
        const angle = Math.acos((v1.x * v2.x + v1.y * v2.y) / (len1 * len2));
        const tan = Math.tan(angle / 2);
        // 修复：将 'let' 改为 'const'
        const cornerRadius = Math.min(radius, (len1 / 2) * tan, (len2 / 2) * tan);
        const t1 = { x: p1.x + (v1.x / len1) * cornerRadius, y: p1.y + (v1.y / len1) * cornerRadius };
        const t2 = { x: p1.x + (v2.x / len2) * cornerRadius, y: p1.y + (v2.y / len2) * cornerRadius };
        pathData += ` L ${t1.x} ${t1.y} Q ${p1.x} ${p1.y}, ${t2.x} ${t2.y}`;
    }
    pathData += ' Z';
    return pathData;
}

const generatePuzzleConfig = () => {
    let cx, cy, areas, minArea, maxArea;
    do {
        cx = (Math.random() * 0.4 + 0.3) * 100;
        cy = (Math.random() * 0.4 + 0.3) * 100;
        areas = [ cx * cy, (100 - cx) * cy, cx * (100 - cy), (100 - cx) * (100 - cy) ];
        minArea = Math.min(...areas);
        maxArea = Math.max(...areas);
    } while (maxArea / minArea > 2);
    const tx = (Math.random() * 0.5 + 0.25) * 100;
    const ry = (Math.random() * 0.5 + 0.25) * 100;
    const bx = (Math.random() * 0.5 + 0.25) * 100;
    const ly = (Math.random() * 0.5 + 0.25) * 100;
    const cornerRadius = 30;
    return [
        { path: getRoundedPolygonPath([{x:0,y:0}, {x:tx,y:0}, {x:cx,y:cy}, {x:0,y:ly}], cornerRadius), x: -10, y: -10, rotate: -8 },
        { path: getRoundedPolygonPath([{x:tx,y:0}, {x:100,y:0}, {x:100,y:ry}, {x:cx,y:cy}], cornerRadius), x: 10, y: -10, rotate: 8 },
        { path: getRoundedPolygonPath([{x:0,y:ly}, {x:cx,y:cy}, {x:bx,y:100}, {x:0,y:100}], cornerRadius), x: -10, y: 10, rotate: 8 },
        { path: getRoundedPolygonPath([{x:cx,y:cy}, {x:100,y:ry}, {x:100,y:100}, {x:bx,y:100}], cornerRadius), x: 10, y: 10, rotate: -8 },
    ];
};

// 修复：创建一个新的子组件来合法地使用 React Hooks
const PuzzlePiece = ({ config, localScroll, id, index }: { config: any, localScroll: MotionValue<number>, id: string, index: number }) => {
    // 现在 Hooks 在组件的顶层被调用，符合规则
    const x = useTransform(localScroll, [0, 1], [0, config.x * 20]);
    const y = useTransform(localScroll, [0, 1], [0, config.y * 20]);
    const rotate = useTransform(localScroll, [0, 1], [0, config.rotate]);

    return (
        <motion.div
            className="absolute h-full w-full"
            style={{
                backgroundImage: `url(${PUZZLE_IMAGE})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                clipPath: `url(#${id}-${index})`,
                x, y, rotate,
            }}
        />
    );
};

const SplittingImage = ({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) => {
    const [puzzleConfigs] = useState(generatePuzzleConfig);
    const id = useId();
    
    const localScroll = useTransform(scrollYProgress, [0.40, 0.66], [0, 1]);
    const scale = useTransform(localScroll, [0, 1], [1, 0.5]);

    return (
        <div className="relative h-screen w-screen">
            <svg className="absolute size-0">
                <defs>
                    {puzzleConfigs.map((config, index) => (
                        <clipPath key={index} id={`${id}-${index}`} clipPathUnits="objectBoundingBox">
                            <path d={config.path.replace(/(\d+(\.\d+)?)/g, (n) => (parseFloat(n) / 100).toFixed(4))} />
                        </clipPath>
                    ))}
                </defs>
            </svg>
            <motion.div className="h-full w-full" style={{ scale }}>
                {puzzleConfigs.map((config, index) => (
                    // 修复：渲染新的子组件，并将所需 props 传入
                    <PuzzlePiece
                        key={index}
                        config={config}
                        localScroll={localScroll}
                        id={id}
                        index={index}
                    />
                ))}
            </motion.div>
        </div>
    );
};

// --- 场景三：最终文本组件 ---
const FinalAnimatedText = ({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) => {
    const localScroll = useTransform(scrollYProgress, [0.66, 1], [0, 1]);
    const opacity = useTransform(localScroll, [0, 0.5], [0, 1]);
    const scale = useTransform(localScroll, [0, 0.5], [0.9, 1]);
    return (
        <motion.div style={{ opacity, scale }} className="relative z-20 flex h-full w-full items-center justify-center">
            <div className="max-w-xl text-center">
                <h1 className="text-5xl font-bold tracking-tighter text-slate-800">您的动画英雄区域</h1>
                <p className="my-6 text-sm text-slate-700 md:text-base">这又是一个英雄区域，这次带有滚动触发动画，用动效来激活英雄区域的内容。</p>
            </div>
        </motion.div>
    );
}

// --- 主应用组件 ---
export default function ScrollAnimationHero() {
    const mainRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: mainRef,
        offset: ['start start', 'end end']
    });

    const landingOpacity = useTransform(scrollYProgress, [0.30, 0.40], [1, 0]);
    const splitImageOpacity = useTransform(scrollYProgress, [0.30, 0.40, 0.63, 0.66], [0, 1, 1, 0]);
    const finalTextOpacity = useTransform(scrollYProgress, [0.65, 0.68], [0, 1]);

    return (
        <main ref={mainRef} id="scroll-animation-hero-container" className="relative h-[500vh]">
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                <motion.div style={{ opacity: landingOpacity }} className="absolute inset-0">
                    <LandingPage />
                </motion.div>
                <motion.div style={{ opacity: splitImageOpacity }} className="absolute inset-0">
                    <SplittingImage scrollYProgress={scrollYProgress} />
                </motion.div>
                <motion.div style={{ opacity: finalTextOpacity }} className="absolute inset-0">
                    <FinalAnimatedText scrollYProgress={scrollYProgress} />
                </motion.div>
            </div>
        </main>
    );
}
