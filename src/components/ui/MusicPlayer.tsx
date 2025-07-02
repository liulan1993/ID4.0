"use client";

import React, { useState, useEffect, useRef } from 'react';

// 为 jsmediatags 定义类型
interface TagType {
  tags: {
    title?: string;
    artist?: string;
    picture?: {
      data: number[];
      format: string;
    };
  };
}

interface JsMediaTags {
  read(url: string, options: {
    onSuccess: (tag: TagType) => void;
    onError: (error: Error) => void;
  }): void;
}


// 为 window 对象扩展 jsmediatags 类型定义，避免 TypeScript 报错
declare global {
  interface Window {
    jsmediatags: JsMediaTags;
  }
}

// --- 动画样式定义 ---
const KeyframesStyle = () => (
  <style>
    {`
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .animate-in {
        animation: fadeInUp 0.2s ease-out;
      }
    `}
  </style>
);

// --- 音乐封面核心组件 ---
interface MusicArtworkProps {
  songUrl: string;
  isSong: boolean;
  isScriptReady: boolean;
}

function MusicArtwork({
  songUrl,
  isSong,
  isScriptReady,
}: MusicArtworkProps) {
  // --- 状态钩子 ---
  const [metadata, setMetadata] = useState({
    music: '加载中...',
    artist: '...',
    albumArt: ''
  });
  const [isMetadataLoading, setIsMetadataLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  // 使用下划线前缀表示 _setRotation 是有意未使用的
  const [rotation, _setRotation] = useState(0);

  // --- Ref 钩子 ---
  const vinylRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const spinDuration = isSong ? (1 / 0.75) : (1 / 0.55);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Effect 1: 读取音频元数据
  useEffect(() => {
    if (!isScriptReady || !songUrl) return;

    if (typeof window.jsmediatags === 'undefined') {
        console.error("jsmediatags 库未加载。");
        setIsMetadataLoading(false);
        setMetadata(prev => ({ ...prev, music: '库加载失败', artist: '错误', albumArt: 'https://placehold.co/256x256/171717/ffffff?text=Error' }));
        return;
    }

    setIsMetadataLoading(true);
    setImageLoaded(false);

    window.jsmediatags.read(songUrl, {
      onSuccess: (tag: TagType) => {
        const { title, artist, picture } = tag.tags;
        let albumArtUrl = 'https://placehold.co/256x256/171717/ffffff?text=No+Art';

        if (picture) {
          const base64String = btoa(String.fromCharCode.apply(null, picture.data));
          albumArtUrl = `data:${picture.format};base64,${base64String}`;
        }
        
        setMetadata({
          music: title || '未知歌曲',
          artist: artist || '未知艺术家',
          albumArt: albumArtUrl
        });
        setIsMetadataLoading(false);
      },
      onError: (error: Error) => {
        console.error('读取元数据失败:', error);
        setMetadata({
          music: '读取失败',
          artist: '错误',
          albumArt: 'https://placehold.co/256x256/171717/ffffff?text=Error'
        });
        setIsMetadataLoading(false);
      }
    });
  }, [songUrl, isScriptReady]);

  // Effect 2: 控制音频播放
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(e => console.error("播放失败:", e));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Effect 3: 同步UI和音频原生事件
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleAudioPlay = () => setIsPlaying(true);
    const handleAudioPause = () => setIsPlaying(false);
    audio.addEventListener('play', handleAudioPlay);
    audio.addEventListener('pause', handleAudioPause);
    return () => {
      audio.removeEventListener('play', handleAudioPlay);
      audio.removeEventListener('pause', handleAudioPause);
    };
  }, []);

  // Effect 4: 鼠标悬停Tooltip
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => setMousePosition({ x: e.clientX, y: e.clientY }));
    };
    if (isHovered) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isHovered]);

  if (isMetadataLoading) {
    return (
      <div className="relative group w-48 h-48 sm:w-64 sm:h-64">
        <div className="w-full h-full bg-neutral-800 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative">
      <audio ref={audioRef} src={songUrl} preload="auto" loop />
      
      {isHovered && (
        <div
          className="fixed z-50 pointer-events-none hidden sm:block"
          style={{ left: mousePosition.x - 200, top: mousePosition.y - 60 }}
        >
          <div className="bg-neutral-900/90 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg border border-neutral-700/50 animate-in">
            <span className="font-bold">{metadata.artist}</span> &nbsp;•&nbsp; {metadata.music}
          </div>
        </div>
      )}

      <div className="relative group">
        <div
          className={`absolute -left-16 sm:-left-24 top-1/2 -translate-y-1/2 transition-all duration-500 ease-out ${
            isHovered || isPlaying
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 -translate-x-12 sm:-translate-x-24'
          }`}
        >
          <div className="relative w-[190px] h-[190px] sm:w-[260px] sm:h-[260px]">
           <div
             ref={vinylRef}
             className="w-full h-full"
             style={{
               transform: isPlaying ? undefined : `rotate(${rotation}deg)`,
               animation: isPlaying ? `spin ${spinDuration}s linear infinite` : 'none',
               animationDelay: isPlaying ? `${-rotation / (360 / spinDuration)}s` : undefined
             }}
           >
             <img
               src="https://pngimg.com/d/vinyl_PNG95.png"
               alt="黑胶唱片"
               className="w-full h-full object-contain"
             />
           </div>
         </div>
        </div>

        <div
          className="relative overflow-hidden rounded-lg shadow-2xl transition-all duration-300 ease-out hover:scale-105 hover:shadow-3xl cursor-pointer w-48 h-48 sm:w-64 sm:h-64"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handlePlayPause}
        >
          <img
            src={metadata.albumArt}
            alt={`${metadata.music} 封面`}
            className={`w-full h-full object-cover transition-all duration-300 ease-out group-hover:scale-110 ${
              !imageLoaded ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
          
          {!imageLoaded && (
            <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
          )}
          
          <div className={`absolute bottom-2 left-2 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                {isPlaying ? (
                  <div className="flex gap-0.5"><div className="w-0.5 h-3 bg-white rounded"></div><div className="w-0.5 h-3 bg-white rounded"></div></div>
                ) : (
                  <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5"></div>
                )}
              </div>
              <div className="sm:hidden">
                <div className="text-white text-[10px] font-medium whitespace-nowrap bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
                  <span className="font-bold">{metadata.artist}</span> • {metadata.music}
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
    </div>
  );
}

/**
 * MusicPlayer 组件
 * 这是最终导出的组件，它负责加载外部脚本并渲染音乐播放器。
 * 它将被固定在屏幕的右下角。
 */
const MusicPlayer = () => {
  const [isScriptReady, setIsScriptReady] = useState(false);

  useEffect(() => {
    const scriptId = 'jsmediatags-script';
    if (document.getElementById(scriptId)) {
        setIsScriptReady(true);
        return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jsmediatags/3.9.5/jsmediatags.min.js";
    script.async = true;
    script.onload = () => setIsScriptReady(true);
    script.onerror = () => {
        console.error("jsmediatags 脚本加载失败。");
        setIsScriptReady(false);
    };

    document.body.appendChild(script);

    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <KeyframesStyle />
      <MusicArtwork
        songUrl="https://zh.apex-elite-service.com/wenjian/%E9%BB%84%E8%AF%97%E6%89%B6%20-%20%E4%B9%9D%E4%B8%87%E5%AD%97.mp3"
        isSong={true}
        isScriptReady={isScriptReady}
      />
    </div>
  );
};

export default MusicPlayer;
