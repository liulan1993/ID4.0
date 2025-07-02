"use client";

import React, { useState, useEffect, useRef } from 'react';
import GlobalStyles from '@/components/ui/GlobalStyles';
import InteractiveBackground from '@/components/ui/InteractiveBackground';
import RainEffect from '@/components/ui/RainEffect';
import InteractiveHero from '@/components/ui/InteractiveHero';
import PlaceholderSection from '@/components/ui/PlaceholderSection';
import { ThemeColorPicker, type ColorPickerValue } from '@/components/ui/ThemeColorPicker';
import { Paintbrush } from 'lucide-react';
import MusicPlayer from '@/components/ui/MusicPlayer'; // 1. 导入音乐播放器组件

/**
 * Page 组件：
 * 这是应用的最终入口页面。
 * 它负责组合所有顶级组件，并管理整个页面的状态，
 * 例如页面高度和全局主题颜色。
 */
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
            
            <div className="relative z-10">
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
            </div>

            {/* 2. 在此处使用音乐播放器组件 */}
            <MusicPlayer />
        </div>
    );
};

export default Page;
