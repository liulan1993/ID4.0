"use client";

import React, { type ReactNode, type SVGProps, type MouseEvent as ReactMouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './utils';
import { ChevronDownIcon } from './Icons';

// --- 类型定义 ---
interface NavLinkProps {
    href?: string;
    children: ReactNode;
    hasDropdown?: boolean;
    className?: string;
    onClick?: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
}

interface DropdownMenuProps {
    children: ReactNode;
    isOpen: boolean;
}

interface DropdownItemProps {
    href?: string;
    children: ReactNode;
    icon?: React.ReactElement<SVGProps<SVGSVGElement>>;
}

/**
 * NavLink 组件：带有悬停动画效果的导航链接。
 */
export const NavLink: React.FC<NavLinkProps> = ({ href = "#", children, hasDropdown = false, className = "", onClick }) => (
   <motion.a
     href={href}
     onClick={onClick}
     className={cn("relative group text-base sm:text-lg lg:text-xl font-medium text-gray-300 hover:text-white transition-colors duration-200 flex items-center py-1", className)}
     whileHover="hover"
   >
     {children}
     {hasDropdown && <ChevronDownIcon />}
     {!hasDropdown && (
         <motion.div
           className="absolute bottom-[-2px] left-0 right-0 h-[1px] bg-[#0CF2A0]"
           variants={{ initial: { scaleX: 0, transformOrigin: 'center' }, hover: { scaleX: 1, transformOrigin: 'center' } }}
           initial="initial"
           transition={{ duration: 0.3, ease: "easeOut" }}
         />
     )}
   </motion.a>
 );

/**
 * DropdownMenu 组件：导航栏中的下拉菜单容器。
 */
export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children, isOpen }) => (
   <AnimatePresence>
     {isOpen && (
       <motion.div
         initial={{ opacity: 0, y: 10, scale: 0.95 }}
         animate={{ opacity: 1, y: 0, scale: 1 }}
         exit={{ opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.15 } }}
         transition={{ duration: 0.2, ease: "easeOut" }}
         className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-56 origin-top z-40"
       >
           <div className="bg-[#111111] border border-gray-700/50 rounded-md shadow-xl p-2">
               {children}
           </div>
       </motion.div>
     )}
   </AnimatePresence>
);

/**
 * DropdownItem 组件：下拉菜单中的单个链接项。
 */
export const DropdownItem: React.FC<DropdownItemProps> = ({ href = "#", children, icon }) => (
 <a
   href={href}
   className="group flex items-center justify-between w-full px-3 py-2 text-base sm:text-lg lg:text-xl text-gray-300 hover:bg-gray-700/30 hover:text-white rounded-md transition-colors duration-150"
 >
   <span>{children}</span>
   {icon && React.cloneElement(icon, { className: "w-4 h-4 ml-1 opacity-70 group-hover:opacity-100 transition-opacity" })}
 </a>
);
