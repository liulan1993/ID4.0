"use client";

import React, { useRef, useCallback, useEffect } from 'react';

// --- 类型定义 ---
interface Dot {
    x: number;
    y: number;
    targetOpacity: number;
    currentOpacity: number;
    opacitySpeed: number;
    baseRadius: number;
    currentRadius: number;
}

// --- 帮助函数：将 HEX 颜色转换为 RGB 对象 ---
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
};

/**
 * InteractiveBackground 组件：
 * 渲染并管理 Canvas 上的交互式点状背景动画。
 * @param {{ color: string }} props - 包含应用于所有点的基础颜色的对象。
 */
const InteractiveBackground: React.FC<{ color: string }> = ({ color }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number | null>(null);
    const dotsRef = useRef<Dot[]>([]);
    const gridRef = useRef<Record<string, number[]>>({});
    const canvasSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
    const mousePositionRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });
    const themeRgbRef = useRef<{ r: number; g: number; b: number }>({ r: 87, g: 220, b: 205 });

    // 当颜色属性变化时，更新 RGB 颜色引用
    useEffect(() => {
        const rgb = hexToRgb(color);
        if (rgb) {
            themeRgbRef.current = rgb;
        }
    }, [color]);

    const DOT_SPACING = 25;
    const BASE_OPACITY_MIN = 0.40;
    const BASE_OPACITY_MAX = 0.50;
    const BASE_RADIUS = 1;
    const INTERACTION_RADIUS = 150;
    const INTERACTION_RADIUS_SQ = INTERACTION_RADIUS * INTERACTION_RADIUS;
    const OPACITY_BOOST = 0.6;
    const RADIUS_BOOST = 2.5;
    const GRID_CELL_SIZE = Math.max(50, Math.floor(INTERACTION_RADIUS / 1.5));

    const handleMouseMove = useCallback((event: globalThis.MouseEvent) => {
        mousePositionRef.current = { x: event.clientX, y: event.clientY };
    }, []);

    const createDots = useCallback(() => {
        const { width, height } = canvasSizeRef.current;
        if (width === 0 || height === 0) return;

        const newDots: Dot[] = [];
        const newGrid: Record<string, number[]> = {};
        const cols = Math.ceil(width / DOT_SPACING);
        const rows = Math.ceil(height / DOT_SPACING);

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const x = i * DOT_SPACING + DOT_SPACING / 2;
                const y = j * DOT_SPACING + DOT_SPACING / 2;
                const cellX = Math.floor(x / GRID_CELL_SIZE);
                const cellY = Math.floor(y / GRID_CELL_SIZE);
                const cellKey = `${cellX}_${cellY}`;

                if (!newGrid[cellKey]) newGrid[cellKey] = [];
                
                const dotIndex = newDots.length;
                newGrid[cellKey].push(dotIndex);

                const baseOpacity = Math.random() * (BASE_OPACITY_MAX - BASE_OPACITY_MIN) + BASE_OPACITY_MIN;
                newDots.push({
                    x, y,
                    targetOpacity: baseOpacity, currentOpacity: baseOpacity,
                    opacitySpeed: (Math.random() * 0.005) + 0.002,
                    baseRadius: BASE_RADIUS, currentRadius: BASE_RADIUS,
                });
            }
        }
        dotsRef.current = newDots;
        gridRef.current = newGrid;
    }, [DOT_SPACING, GRID_CELL_SIZE, BASE_OPACITY_MIN, BASE_OPACITY_MAX, BASE_RADIUS]);

    const handleResize = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const width = window.innerWidth;
        const height = document.documentElement.scrollHeight;

        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            canvasSizeRef.current = { width, height };
            createDots();
        }
    }, [createDots]);

    const animateDots = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const dots = dotsRef.current;
        const grid = gridRef.current;
        const { width, height } = canvasSizeRef.current;
        const { x: mouseX, y: mouseY } = mousePositionRef.current;
        const { r, g, b } = themeRgbRef.current; // 使用主题颜色的 RGB 值

        if (!ctx || !dots || !grid || width === 0 || height === 0) {
            animationFrameId.current = requestAnimationFrame(animateDots);
            return;
        }

        ctx.clearRect(0, 0, width, height);

        const scrollY = window.scrollY;
        const activeDotIndices = new Set<number>();
        if (mouseX !== null && mouseY !== null) {
            const mouseCanvasY = mouseY + scrollY;
            const mouseCellX = Math.floor(mouseX / GRID_CELL_SIZE);
            const mouseCellY = Math.floor(mouseCanvasY / GRID_CELL_SIZE);
            const searchRadius = Math.ceil(INTERACTION_RADIUS / GRID_CELL_SIZE);
            for (let i = -searchRadius; i <= searchRadius; i++) {
                for (let j = -searchRadius; j <= searchRadius; j++) {
                    const cellKey = `${mouseCellX + i}_${mouseCellY + j}`;
                    if (grid[cellKey]) {
                        grid[cellKey].forEach(dotIndex => activeDotIndices.add(dotIndex));
                    }
                }
            }
        }

        dots.forEach((dot, index) => {
            dot.currentOpacity += dot.opacitySpeed;
            if (dot.currentOpacity >= dot.targetOpacity || dot.currentOpacity <= BASE_OPACITY_MIN) {
                dot.opacitySpeed = -dot.opacitySpeed;
                dot.currentOpacity = Math.max(BASE_OPACITY_MIN, Math.min(dot.currentOpacity, BASE_OPACITY_MAX));
                dot.targetOpacity = Math.random() * (BASE_OPACITY_MAX - BASE_OPACITY_MIN) + BASE_OPACITY_MIN;
            }

            let interactionFactor = 0;
            if (mouseX !== null && mouseY !== null && activeDotIndices.has(index)) {
                const mouseCanvasY = mouseY + scrollY;
                const dx = dot.x - mouseX;
                const dy = dot.y - mouseCanvasY;
                const distSq = dx * dx + dy * dy;
                if (distSq < INTERACTION_RADIUS_SQ) {
                    interactionFactor = Math.max(0, 1 - Math.sqrt(distSq) / INTERACTION_RADIUS);
                    interactionFactor = interactionFactor * interactionFactor;
                }
            }

            const finalOpacity = Math.min(1, dot.currentOpacity + interactionFactor * OPACITY_BOOST);
            dot.currentRadius = dot.baseRadius + interactionFactor * RADIUS_BOOST;

            ctx.beginPath();
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${finalOpacity.toFixed(3)})`; // 应用主题颜色
            ctx.arc(dot.x, dot.y, dot.currentRadius, 0, Math.PI * 2);
            ctx.fill();
        });

        animationFrameId.current = requestAnimationFrame(animateDots);
    }, [GRID_CELL_SIZE, INTERACTION_RADIUS, INTERACTION_RADIUS_SQ, OPACITY_BOOST, RADIUS_BOOST, BASE_OPACITY_MIN, BASE_OPACITY_MAX, BASE_RADIUS]);

    useEffect(() => {
        const pageElement = document.documentElement;
        const resizeObserver = new ResizeObserver(() => handleResize());
        resizeObserver.observe(pageElement);
        
        handleResize();
        
        const handleMouseLeave = () => { mousePositionRef.current = { x: null, y: null }; };
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        document.documentElement.addEventListener('mouseleave', handleMouseLeave);
        animationFrameId.current = requestAnimationFrame(animateDots);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('mousemove', handleMouseMove);
            document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    }, [handleResize, handleMouseMove, animateDots]);

    return <canvas ref={canvasRef} className="absolute inset-0 -z-10 pointer-events-none opacity-80" />;
};

export default InteractiveBackground;
