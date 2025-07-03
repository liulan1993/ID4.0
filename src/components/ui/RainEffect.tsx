"use client";

import React, { useMemo, useEffect, useState } from 'react';

// --- 类型定义 ---
interface RaindropProps {
  id: number;
  left: string;
  duration: number;
  delay: number;
  color: string;
}

interface RainEffectProps {
  color: string;
}

/**
 * Raindrop 组件: 单个雨滴的动画。
 * 已被重构为使用纯 CSS 动画，以获得最佳性能。
 */
const Raindrop: React.FC<RaindropProps> = React.memo(({ left, duration, delay, color }) => {
  const gradient = `linear-gradient(to bottom, transparent, ${color}90)`;

  return (
    <div
      className="raindrop"
      style={{
        left,
        backgroundImage: gradient,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      }}
    />
  );
});

Raindrop.displayName = 'Raindrop';

/**
 * RainEffect 组件: 渲染整个下雨效果。
 * 使用 CSS 动画进行了性能优化，并修复了动画参数。
 */
const RainEffect: React.FC<RainEffectProps> = ({ color }) => {
  const [pageHeight, setPageHeight] = useState(0);

  // 仅在客户端挂载后获取一次页面高度
  useEffect(() => {
    // 使用 document.documentElement.scrollHeight 来获取整个页面的高度
    setPageHeight(document.documentElement.scrollHeight);
  }, []);

  const raindrops = useMemo(() => {
    if (pageHeight <= 0) return [];

    // --- 优化：响应式雨滴密度 ---
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    let count;

    if (screenWidth < 768) { // 手机
      count = 30;
    } else if (screenWidth < 1024) { // 平板
      count = 50;
    } else { // PC
      count = 80;
    }
    
    // 设置一个最大值，防止在超长页面上创建过多元素
    const maxCount = 100; 
    count = Math.min(count, maxCount);

    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      // --- 修复：修正了动画时长和延迟，使其在合理范围内 ---
      duration: Math.random() * 1.5 + 50, // 持续时间：1s 到 2.5s
      delay: Math.random() * 50, // 延迟：0s 到 10s
    }));
  }, [pageHeight]);

  if (pageHeight <= 0) {
    return null;
  }

  return (
    <>
      {/* 将 CSS @keyframes 直接注入到 head 中。
        这比在每个雨滴上使用 style 属性更高效，因为它只定义了一次动画规则。
      */}
      <style>
        {`
          @keyframes fall {
            0% {
              transform: translateY(-200px) scaleY(1);
              opacity: 1;
            }
            90% {
              transform: translateY(${pageHeight}px) scaleY(1);
              opacity: 1;
            }
            100% {
              transform: translateY(${pageHeight}px) scaleY(0);
              opacity: 0;
            }
          }

          .raindrop {
            position: absolute;
            top: 0;
            width: 1.5px;
            height: 80px;
            pointer-events: none;
            animation-name: fall;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
          }
        `}
      </style>
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-[100]">
        {raindrops.map((drop) => (
          <Raindrop
            key={drop.id}
            id={drop.id}
            left={drop.left}
            duration={drop.duration}
            delay={drop.delay}
            color={color}
          />
        ))}
      </div>
    </>
  );
};

export default RainEffect;
