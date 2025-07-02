import React from 'react';
import { cn } from './utils';

/**
 * PlaceholderSection 组件：
 * 用于填充页面以使其可滚动的占位符内容。
 */
const PlaceholderSection: React.FC<{ title: string, className?: string }> = ({ title, className }) => (
    <section className={cn("py-32 text-white relative z-10", className)}>
        <div className="container mx-auto text-center px-4">
            <h2 className="text-3xl font-bold mb-4">{title}</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
                这里是未来组件的占位符内容。您可以将自己的组件和页面内容添加到此处，以构建完整的应用程序。
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
        </div>
    </section>
);

export default PlaceholderSection;
