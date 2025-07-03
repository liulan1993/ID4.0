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

// --- 帮助函数：防抖 ---
const debounce = <F extends (...args: unknown[]) => unknown>(func: F, waitFor: number) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<F>): void => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => func(...args), waitFor);
    };
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

    // --- 常量配置 ---
    const BASE_OPACITY_MIN = 0.40;
    const BASE_OPACITY_MAX = 0.50;
    const BASE_RADIUS = 1;
    const INTERACTION_RADIUS = 150;
    const INTERACTION_RADIUS_SQ = INTERACTION_RADIUS * INTERACTION_RADIUS;
    const OPACITY_BOOST = 0.6;
    const RADIUS_BOOST = 2.5;
    // 优化：网格单元尺寸现在依赖于交互半径
    const GRID_CELL_SIZE = Math.max(50, Math.floor(INTERACTION_RADIUS / 1.5));

    // --- 交互位置更新 ---
    const updateInteractionPosition = useCallback((clientX: number, clientY: number) => {
        mousePositionRef.current = { x: clientX, y: clientY };
    }, []);

    const clearInteractionPosition = useCallback(() => {
        mousePositionRef.current = { x: null, y: null };
    }, []);

    const handleMouseMove = useCallback((event: globalThis.MouseEvent) => {
        updateInteractionPosition(event.clientX, event.clientY);
    }, [updateInteractionPosition]);

    // 优化：添加触摸事件处理
    const handleTouchMove = useCallback((event: globalThis.TouchEvent) => {
        if (event.touches.length > 0) {
            updateInteractionPosition(event.touches[0].clientX, event.touches[0].clientY);
        }
    }, [updateInteractionPosition]);


    // --- 点和网格的创建 ---
    const createDots = useCallback(() => {
        const { width, height } = canvasSizeRef.current;
        if (width === 0 || height === 0) return;

        // 优化：根据屏幕宽度调整点的间距，提升小屏幕性能
        const screenWidth = window.innerWidth;
        const DOT_SPACING = screenWidth < 768 ? 35 : 25; // 手机端增大间距

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
    }, [GRID_CELL_SIZE, BASE_OPACITY_MIN, BASE_OPACITY_MAX, BASE_RADIUS]);

    // --- 窗口大小调整处理 ---
    const handleResize = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // 优化：适配高DPI（Retina）屏幕，使图像更清晰
        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = document.documentElement.scrollHeight;

        // 仅在尺寸确实发生变化时才进行重绘，避免不必要的计算
        if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            const ctx = canvas.getContext('2d');
            ctx?.scale(dpr, dpr);
            
            canvasSizeRef.current = { width, height };
            createDots();
        }
    }, [createDots]);

    // --- 动画循环 ---
    const animateDots = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const dots = dotsRef.current;
        const grid = gridRef.current;
        const { width, height } = canvasSizeRef.current;
        const { x: mouseX, y: mouseY } = mousePositionRef.current;
        const { r, g, b } = themeRgbRef.current;

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
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${finalOpacity.toFixed(3)})`;
            ctx.arc(dot.x, dot.y, dot.currentRadius, 0, Math.PI * 2);
            ctx.fill();
        });

        animationFrameId.current = requestAnimationFrame(animateDots);
    }, [GRID_CELL_SIZE, INTERACTION_RADIUS_SQ, OPACITY_BOOST, RADIUS_BOOST, BASE_OPACITY_MIN, BASE_OPACITY_MAX]);

    // --- Effect Hook ---
    useEffect(() => {
        // 优化：使用防抖处理 resize 事件，防止性能问题
        const debouncedResize = debounce(handleResize, 250);

        const pageElement = document.documentElement;
        const resizeObserver = new ResizeObserver(debouncedResize);
        resizeObserver.observe(pageElement);
        
        handleResize();
        
        // 优化：添加触摸事件监听器
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        document.documentElement.addEventListener('mouseleave', clearInteractionPosition);
        window.addEventListener('touchend', clearInteractionPosition, { passive: true });

        animationFrameId.current = requestAnimationFrame(animateDots);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            document.documentElement.removeEventListener('mouseleave', clearInteractionPosition);
            window.removeEventListener('touchend', clearInteractionPosition);

            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [handleResize, handleMouseMove, handleTouchMove, clearInteractionPosition, animateDots]);

    return <canvas ref={canvasRef} className="absolute inset-0 -z-10 pointer-events-none opacity-80" />;
};

export default InteractiveBackground;
