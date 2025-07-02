"use client";

import React, { useState } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import Header from './Header';
import MainContent from './MainContent';

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
            <div className="relative pt-[70px] min-h-screen flex flex-col overflow-x-hidden">
                <MainContent />
            </div>
        </div>
    );
};

export default InteractiveHero;
