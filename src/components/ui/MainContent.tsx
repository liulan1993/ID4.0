"use client";

import React from 'react';
import { motion, type Variants } from 'framer-motion';
// 假设 RotatingText 组件位于同一目录
import RotatingText from './RotatingText';

/**
 * MainContent 组件：
 * 负责渲染页面的核心内容，包括标题、标语和产品图片。
 */
const MainContent: React.FC = () => {
    const contentDelay = 0.3;
    const itemDelayIncrement = 0.1;

    const headlineVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement } }
    };
    const subHeadlineVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement * 2 } }
    };
    const imageVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, delay: contentDelay + itemDelayIncrement * 3, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <main className="flex-grow flex flex-col items-center justify-center text-center px-4 pt-8 pb-16 relative z-10">
            <motion.h1 variants={headlineVariants} initial="hidden" animate="visible" className="text-4xl sm:text-5xl lg:text-[64px] font-semibold text-white leading-tight max-w-4xl mb-4">
                网站开发占位标题<br />{' '}
                {/* * 修正: 在包裹 RotatingText 的 span 元素上应用内联样式，
                  * 将其颜色设置为 CSS 变量 --theme-color。
                  * 这样，当调色器改变颜色时，这里的文字颜色也会随之改变。
                  */}
                <span 
                    className="inline-block h-[1.2em] sm:h-[1.2em] lg:h-[1.2em] overflow-hidden align-bottom"
                    style={{ color: 'var(--theme-color, #0CF2A0)' }}
                >
                    <RotatingText
                        texts={['UI设计', '用户体验', '客户关系', '帮助', '服务']}
                        // 从 mainClassName 中移除了硬编码的颜色类 'text-[#0CF2A0]'
                        mainClassName="mx-1"
                    />
                </span>
            </motion.h1>

            <motion.p variants={subHeadlineVariants} initial="hidden" animate="visible" className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                正在开发网页，文字占位测试正在开发网页，文字占位测试正在开发网页，文字占位测试正在开发网页，文字占位测试正在开发网页，文字占位测试正在开发网页，文字占位测试正在开发网页，文字占位测试
            </motion.p>

            <motion.div variants={imageVariants} initial="hidden" animate="visible" className="w-full max-w-4xl mx-auto px-4 sm:px-0 mt-10">
                <img
                    src="https://help.apple.com/assets/679AD2D1E874AD22770DE1E0/679AD2D56EA7B10C9E01288F/en_US/3d2b57c8027ae355aa44421899389008.png"
                    alt="Product screen preview showing collaborative features"
                    width={1024}
                    height={640}
                    className="w-full h-auto object-contain rounded-lg shadow-xl border border-gray-700/50"
                    loading="lazy"
                />
            </motion.div>
        </main>
    );
};

export default MainContent;
