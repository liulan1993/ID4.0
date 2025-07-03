"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * Splash 组件: 雨滴迸射的水花效果。
 * 这个组件没有改动，和最初的版本一样。
 * @param {{ onComplete: () => void; color: string }} props - 包含完成回调和粒子颜色的对象。
 */
const Splash: React.FC<{ onComplete: () => void; color: string }> = ({ onComplete, color }) => {
    const particleCount = useMemo(() => Math.floor(Math.random() * 5) + 5, []);

    const particleVariants = {
        initial: { x: 0, y: 0, opacity: 1 },
        animate: (i: number) => {
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = Math.random() * 20 + 15;
            return {
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
                opacity: 0,
            };
        },
    };

    return (
        <motion.div
            className="absolute"
            initial="initial"
            animate="animate"
            onAnimationComplete={onComplete}
            transition={{ ease: "easeOut", duration: 0.6, staggerChildren: 0.03 }}
        >
            {Array.from({ length: particleCount }).map((_, i) => (
                <motion.div
                    key={i}
                    custom={i}
                    variants={particleVariants}
                    className="absolute w-1 h-1 rounded-full"
                    style={{ backgroundColor: color }}
                />
            ))}
        </motion.div>
    );
};

/**
 * Raindrop 组件: 单个雨滴的动画，现在包含水花和循环。
 * @param {object} props - 包含雨滴所有属性的对象。
 */
const Raindrop: React.FC<{
  left: string;
  duration: number;
  delay: number;
  pageHeight: number;
  color: string;
}> = ({ left, duration, delay, pageHeight, color }) => {
    const [isSplashing, setIsSplashing] = useState(false);
    // --- 核心修改：使用 key 来强制重新渲染 ---
    // 通过在循环结束后改变 key，我们可以让 React 卸载旧的雨滴并挂载一个新的雨滴实例，
    // 从而以全新的状态（包括动画）重新开始。
    const [key, setKey] = useState(Math.random());

    // 当水花动画完成时，这个函数会被调用
    const handleSplashComplete = () => {
        setIsSplashing(false); // 重置水花状态
        setKey(Math.random()); // 改变 key，触发雨滴的“重生”
    };

    const gradient = `linear-gradient(to bottom, transparent, ${color}90)`;

    // 使用 key 属性包裹整个组件，这是实现循环的关键
    return (
        <div key={key} className="absolute top-0" style={{ left }}>
            {!isSplashing && (
                <motion.div
                    className="h-10 w-0.5"
                    style={{ backgroundImage: gradient }}
                    initial={{ y: -200 }}
                    animate={{ y: pageHeight }}
                    transition={{
                        duration,
                        delay,
                        ease: "linear",
                    }}
                    // 当下落动画完成时，触发水花效果
                    onAnimationComplete={() => setIsSplashing(true)}
                />
            )}
            {/* 当 isSplashing 为 true 时，在页面底部渲染水花效果 */}
            {isSplashing && (
                <div className="absolute" style={{top: `${pageHeight}px`}}>
                    <Splash onComplete={handleSplashComplete} color={color} />
                </div>
            )}
        </div>
    );
};

/**
 * RainEffect 组件: 渲染整个下雨效果。
 * @param {{ pageHeight: number; color: string }} props - 包含页面高度和雨滴颜色的对象。
 */
const RainEffect: React.FC<{ pageHeight: number; color: string }> = ({ pageHeight, color }) => {
  
  const raindrops = useMemo(() => {
    // --- 自定义说明 ---
    // 这里的逻辑和之前一样，你可以通过调整这些值来改变雨的效果。

    // 1. 雨滴密度 (Density)
    // 页面每增高 `densityFactor` 像素，增加一个雨滴。减小此值可增加密度。
    const densityFactor = 100;
    const count = pageHeight > 0 ? Math.floor(pageHeight / densityFactor) : 50;

    return Array.from({ length: count }).map((_, i) => ({
        id: i, // 为每个雨滴配置一个稳定的初始 key
        left: `${Math.random() * 100}%`,
        // 2. 雨滴速度 (Speed)
        // `duration` 越小，速度越快。
        duration: Math.random() * 1 + 50,
        // 3. 初始延迟 (Initial Delay)
        // `delay` 让雨滴错落有致地出现。
        delay: Math.random() * 50,
    }));
  }, [pageHeight]);

  if (pageHeight <= 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-[100]">
      {raindrops.map((drop) => (
        <Raindrop
          key={drop.id} // 使用初始 key
          left={drop.left}
          duration={drop.duration}
          delay={drop.delay}
          pageHeight={pageHeight}
          color={color}
        />
      ))}
    </div>
  );
};

export default RainEffect;
