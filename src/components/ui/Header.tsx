"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

// --- 临时的占位组件，请参考此逻辑修改您项目中的实际组件 ---

// 为 NavLink 定义 Props 类型
interface NavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    children: React.ReactNode;
    hasDropdown?: boolean;
}

// NavLink 组件现在会接收 hasDropdown 属性，但不会将其传递给 <a> 标签
const NavLink = ({ children, hasDropdown, ...props }: NavLinkProps) => (
    <a {...props} className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center">
        {children}
        {hasDropdown && (
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        )}
    </a>
);

// 为 DropdownMenu 定义 Props 类型
const DropdownMenu = ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) => isOpen ? <div className="absolute top-full left-0 mt-2 bg-[#1a1a1a] rounded-md shadow-lg p-2">{children}</div> : null;

// 为 DropdownItem 定义 Props 类型
interface DropdownItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    children: React.ReactNode;
    icon?: React.ReactNode;
}
const DropdownItem = ({ children, icon, ...props }: DropdownItemProps) => <a {...props} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md flex items-center">{children}{icon}</a>;

const MenuIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>;
const CloseIcon = () => <svg className="w-6 h-6" fill="none"stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const ExternalLinkIcon = () => <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>;
// --- 占位组件结束 ---


/**
 * Header 组件：
 * 负责渲染页面顶部导航栏。
 * @param {boolean} isScrolled - 指示页面是否已滚动的布尔值，用于应用不同的样式。
 */
const Header: React.FC<{ isScrolled: boolean }> = ({ isScrolled }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMobileMenuOpen]);

    const headerVariants: Variants = {
        top: {
            backgroundColor: "rgba(17, 17, 17, 0.8)",
            borderBottomColor: "rgba(55, 65, 81, 0.5)",
        },
        scrolled: {
            backgroundColor: "rgba(17, 17, 17, 0.95)",
            borderBottomColor: "rgba(75, 85, 99, 0.7)",
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }
    };

    const mobileMenuVariants: Variants = {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.15, ease: "easeIn" } }
    };

    return (
        <motion.header
            variants={headerVariants}
            initial="top"
            animate={isScrolled ? "scrolled" : "top"}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="px-6 w-full md:px-10 lg:px-16 fixed top-0 z-30 backdrop-blur-md border-b"
        >
            <nav className="flex justify-between items-center max-w-screen-xl mx-auto h-[70px]">
                <div className="flex items-center flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="var(--theme-color, #0CF2A0)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="var(--theme-color, #0CF2A0)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="var(--theme-color, #0CF2A0)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-3xl font-bold text-white ml-2">Nexus</span>
                </div>

                <div className="hidden md:flex items-center justify-center flex-grow space-x-6 lg:space-x-8 px-4">
                    <NavLink href="#">Product</NavLink>
                    <NavLink href="#">Customers</NavLink>
                    <div className="relative" onMouseEnter={() => setOpenDropdown('channels')} onMouseLeave={() => setOpenDropdown(null)}>
                        <NavLink href="#" hasDropdown>Channels</NavLink>
                        <DropdownMenu isOpen={openDropdown === 'channels'}>
                            <DropdownItem href="#">Slack</DropdownItem>
                            <DropdownItem href="#">Microsoft Teams</DropdownItem>
                        </DropdownMenu>
                    </div>
                    <div className="relative" onMouseEnter={() => setOpenDropdown('resources')} onMouseLeave={() => setOpenDropdown(null)}>
                        <NavLink href="#" hasDropdown>Resources</NavLink>
                        <DropdownMenu isOpen={openDropdown === 'resources'}>
                            <DropdownItem href="#" icon={<ExternalLinkIcon/>}>Blog</DropdownItem>
                            <DropdownItem href="#">Guides</DropdownItem>
                        </DropdownMenu>
                    </div>
                    <NavLink href="#">Docs</NavLink>
                    <NavLink href="#">Pricing</NavLink>
                </div>

                <div className="flex items-center flex-shrink-0 space-x-4 lg:space-x-6">
                    <NavLink href="#" className="hidden md:inline-block">Sign in</NavLink>
                    <motion.a
                        href="#"
                        className="text-[#111111] px-4 py-[6px] rounded-md text-base sm:text-lg lg:text-xl font-semibold hover:bg-opacity-90 transition-colors duration-200 whitespace-nowrap shadow-sm hover:shadow-md"
                        style={{ backgroundColor: 'var(--theme-color, #0CF2A0)' }}
                        whileHover={{ scale: 1.03, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                        Book a demo
                    </motion.a>
                    <motion.button className="md:hidden text-gray-300 hover:text-white z-50" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle menu" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                    </motion.button>
                </div>
            </nav>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div key="mobile-menu" variants={mobileMenuVariants} initial="hidden" animate="visible" exit="exit" className="md:hidden absolute top-full left-0 right-0 bg-[#111111]/95 backdrop-blur-sm shadow-lg py-4 border-t border-gray-800/50">
                        <div className="flex flex-col items-center space-y-4 px-6">
                            <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>Product</NavLink>
                            <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>Customers</NavLink>
                            <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>Channels</NavLink>
                            <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>Resources</NavLink>
                            <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>Docs</NavLink>
                            <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>Pricing</NavLink>
                            <hr className="w-full border-t border-gray-700/50 my-2"/>
                            <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>Sign in</NavLink>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
};

export default Header;
