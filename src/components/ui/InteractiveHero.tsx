"use client";

import React, { useState } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import Header from './Header';
import ScrollAnimationHero from './ScrollAnimationHero';

/**
 * InteractiveHero 组件：
 * 作为一个容器，编排背景、页眉和主要内容组件。
 * 它还管理页面滚动状态，以实现页眉的动态样式。
 */
const InteractiveHero: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState<boolean>(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 10);
    });

    return (
        <div className="relative text-gray-300">
            <Header isScrolled={isScrolled} />
            {/* 修复：从此 div 中移除了 'overflow-x-hidden' 类。
              这个 CSS 属性会破坏子组件 `ScrollAnimationHero` 内部 `position: sticky` 的正常工作，
              导致动画无法在视口中停留。移除后，滚动动画可以正常触发和播放。
            */}
            <div className="relative pt-[70px] min-h-screen">
                <ScrollAnimationHero />
            </div>
        </div>
    );
};

export default InteractiveHero;
