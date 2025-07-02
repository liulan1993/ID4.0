"use client";

import React, { useState, useEffect, useRef } from 'react';
import GlobalStyles from '@/components/ui/GlobalStyles';
import InteractiveBackground from '@/components/ui/InteractiveBackground';
import RainEffect from '@/components/ui/RainEffect';
import InteractiveHero from '@/components/ui/InteractiveHero';
import PlaceholderSection from '@/components/ui/PlaceholderSection';
import { ThemeColorPicker, type ColorPickerValue } from '@/components/ui/ThemeColorPicker';
import { Paintbrush } from 'lucide-react';
import MusicPlayer from '@/components/ui/MusicPlayer';
import LandingPage from '@/components/ui/LandingPage'; // 导入更新后的 LandingPage

const Page = () => {
    const pageRef = useRef<HTMLDivElement>(null);
    const [pageHeight, setPageHeight] = useState(0);
    const [themeColor, setThemeColor] = useState<`#${string}`>('#00f5c3');

    useEffect(() => {
        const pageElement = pageRef.current;
        if (!pageElement) return;

        const resizeObserver = new ResizeObserver(() => {
            setPageHeight(pageElement.scrollHeight);
        });

        resizeObserver.observe(pageElement);
        setPageHeight(pageElement.scrollHeight);

        return () => resizeObserver.disconnect();
    }, []);

    const handleColorChange = (color: ColorPickerValue) => {
        setThemeColor(color.hex);
    };

    return (
        <div 
            ref={pageRef} 
            className="relative" 
            style={{ '--theme-color': themeColor } as React.CSSProperties}
        >
            <GlobalStyles />
            
            <InteractiveBackground color={themeColor} />
            <RainEffect pageHeight={pageHeight} color={themeColor} />

            <div className="fixed top-[86px] right-6 z-50">
                <ThemeColorPicker
                    value={themeColor}
                    onValueChange={handleColorChange}
                >
                    <button
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110"
                        style={{ backgroundColor: themeColor }}
                        aria-label="打开颜色选择器"
                    >
                        <Paintbrush size={24} />
                    </button>
                </ThemeColorPicker>
            </div>
            
            <main className="relative z-10">
                <InteractiveHero />
                <PlaceholderSection title="功能介绍" />
                <PlaceholderSection title="客户案例" />
                <PlaceholderSection title="定价方案" />
                <PlaceholderSection title="关于我们" />
                <PlaceholderSection title="功能介绍" />
                <PlaceholderSection title="客户案例" />
                <PlaceholderSection title="定价方案" />
                <PlaceholderSection title="关于我们" />                
                <PlaceholderSection title="客户案例" />
                <PlaceholderSection title="定价方案" />
                <PlaceholderSection title="关于我们" />             
                <PlaceholderSection title="客户案例" />
                <PlaceholderSection title="定价方案" />
                <PlaceholderSection title="关于我们" />                
                <PlaceholderSection title="定价方案" />
                <PlaceholderSection title="关于我们" />                
                <PlaceholderSection title="客户案例" />
                <PlaceholderSection title="定价方案" />
                <PlaceholderSection title="关于我们" />                
                <PlaceholderSection title="客户案例" />
                <PlaceholderSection title="定价方案" />
                <PlaceholderSection title="关于我们" />
            </main>

            {/* 将 LandingPage 作为页脚，它包含了所有动画 */}
            <footer className="relative z-10">
                <LandingPage />
            </footer>
            
            <MusicPlayer />
        </div>
    );
};

export default Page;
