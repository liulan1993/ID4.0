"use client";

import React from 'react';

/**
 * GlobalStyles 组件：
 * 将全局 CSS 规则（如 body 背景和 keyframe 动画）注入到应用中。
 * 使用 <style jsx global> 实现，这是 Next.js 内置的 CSS-in-JS 功能。
 */
const GlobalStyles = () => (
    <style jsx global>{`
        body {
            background-color: #111111;
        }
        @keyframes shine {
            0% {
                background-position: 200%;
            }
            100% {
                background-position: -200%;
            }
        }
        .animate-shine {
            /* * 修正: 恢复为静态颜色，不再随调色器改变。
             * 闪光效果将始终保持为原始的绿色。
             */
            background-image: linear-gradient(
                110deg,
                transparent 20%,
                #0CF2A0 50%,
                transparent 80%
            );
            background-size: 200% 100%;
            animation: shine 5s linear infinite;
        }
    `}</style>
);

export default GlobalStyles;
