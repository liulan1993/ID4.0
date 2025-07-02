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

// --- SVG 图标 ---
const VolumeHighIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
);
const VolumeMediumIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
);
const VolumeMuteIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
);


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

      /* 自定义音量条样式 */
      .volume-slider {
        -webkit-appearance: none;
        appearance: none;
        width: 80px;
        height: 5px;
        background: rgba(255,255,255,0.2);
        border-radius: 5px;
        outline: none;
        transition: opacity 0.2s;
        cursor: pointer;
      }
      .volume-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 14px;
        height: 14px;
        background: white;
        border-radius: 50%;
        cursor: pointer;
      }
      .volume-slider::-moz-range-thumb {
        width: 14px;
        height: 14px;
        background: white;
        border-radius: 50%;
        cursor: pointer;
      }
    `}
  </style>
);

// --- 音乐封面核心组件 ---
interface MusicArtworkProps {
  songUrl: string;
  isSong: boolean;
  isScriptReady: boolean;
  coverImageUrl?: string; // 新增：可选的封面图片URL
}

function MusicArtwork({
  songUrl,
  isSong,
  isScriptReady,
  coverImageUrl,
}: MusicArtworkProps) {
  // --- 状态钩子 ---
  const [metadata, setMetadata] = useState({
    music: '加载中...',
    artist: '...',
    albumArt: coverImageUrl || '' // 优先使用外部链接
  });
  const [isMetadataLoading, setIsMetadataLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [rotation] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeControl, setShowVolumeControl] = useState(false);


  // --- Ref 钩子 ---
  const vinylRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const volumeControlRef = useRef<HTMLDivElement>(null);

  const spinDuration = isSong ? (1 / 0.75) : (1 / 0.55);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    } else {
      setIsMuted(true);
    }
  };

  // Effect 1: 读取音频元数据
  useEffect(() => {
    if (!isScriptReady || !songUrl) return;

    // 如果没有提供外部封面链接，则显示加载状态
    if (!coverImageUrl) {
        setIsMetadataLoading(true);
    } else {
        setIsMetadataLoading(false);
    }
    setImageLoaded(false);

    window.jsmediatags.read(songUrl, {
      onSuccess: (tag: TagType) => {
        const { title, artist, picture } = tag.tags;
        
        let finalAlbumArt = coverImageUrl;

        if (!finalAlbumArt && picture) {
          const base64String = btoa(String.fromCharCode.apply(null, picture.data));
          finalAlbumArt = `data:${picture.format};base64,${base64String}`;
        }
        
        setMetadata({
          music: title || '未知歌曲',
          artist: artist || '未知艺术家',
          albumArt: finalAlbumArt || 'https://placehold.co/256x256/171717/ffffff?text=No+Art'
        });
        setIsMetadataLoading(false);
      },
      onError: (error: Error) => {
        console.error('读取元数据失败 (可能是封面太大或CORS问题):', error);
        setMetadata(prev => ({
            ...prev,
            music: '',
            artist: '',
            albumArt: prev.albumArt || 'https://placehold.co/256x256/171717/ffffff?text=Error'
        }));
        setIsMetadataLoading(false);
      }
    });
  }, [songUrl, isScriptReady, coverImageUrl]);

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

  // Effect 5: 音量控制
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Effect 6: 点击外部关闭音量条
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (volumeControlRef.current && !volumeControlRef.current.contains(event.target as Node)) {
        setShowVolumeControl(false);
      }
    }
    if (showVolumeControl) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showVolumeControl]);


  if (isMetadataLoading) {
    return (
      <div className="relative group w-48 h-48 sm:w-64 sm:h-64">
        <div className="w-full h-full bg-neutral-800 rounded-lg animate-pulse" />
      </div>
    );
  }

  const VolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeMuteIcon />;
    if (volume < 0.5) return <VolumeMediumIcon />;
    return <VolumeHighIcon />;
  };

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

      <div className="relative group/player">
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
        >
          <img
            src={metadata.albumArt}
            alt={`${metadata.music} 封面`}
            className={`w-full h-full object-cover transition-all duration-300 ease-out group-hover/player:scale-110 ${
              !imageLoaded ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
                // 如果图片加载失败，设置一个备用图片
                if (metadata.albumArt) { // 避免无限循环
                    setMetadata(prev => ({...prev, albumArt: 'https://placehold.co/256x256/171717/ffffff?text=Cover+Error'}));
                }
                setImageLoaded(true);
            }}
            onClick={handlePlayPause}
          />
          
          {!imageLoaded && (
            <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
          )}
          
          <div className={`absolute bottom-2 left-2 right-2 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg text-white hover:bg-black/50" onClick={handlePlayPause}>
                  {isPlaying ? (
                    <div className="flex gap-0.5"><div className="w-0.5 h-3 bg-white rounded"></div><div className="w-0.5 h-3 bg-white rounded"></div></div>
                  ) : (
                    <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5"></div>
                  )}
                </button>
                <div className="sm:hidden">
                  <div className="text-white text-[10px] font-medium whitespace-nowrap bg-black/40 backdrop-blur-sm px-2 py-1 rounded">
                    <span className="font-bold">{metadata.artist}</span> • {metadata.music}
                  </div>
                </div>
              </div>

              <div ref={volumeControlRef} className="relative flex items-center">
                <button className="w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg text-white hover:bg-black/50" onClick={() => setShowVolumeControl(prev => !prev)}>
                  <VolumeIcon />
                </button>
                <div className={`absolute right-0 bottom-full mb-2 p-2 ${showVolumeControl ? 'block' : 'hidden'}`}>
                    <div className="bg-black/40 backdrop-blur-sm p-2 rounded-lg">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="volume-slider"
                        />
                    </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/player:opacity-100 transition-opacity duration-300 pointer-events-none" />
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

  // 您的七牛云链接（在配置好CORS后使用）
  const yourSongUrl = "https://zh.apex-elite-service.com/wenjian/%E9%BB%84%E8%AF%97%E6%89%B6%20-%20%E4%B9%9D%E4%B8%87%E5%AD%97.mp3";
  
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
        songUrl={yourSongUrl} 
        isSong={true}
        isScriptReady={isScriptReady}
        // 使用方法：如果MP3内嵌封面失败，可以在这里提供一个图片的URL
        // coverImageUrl="https://.../your-cover-image.jpg"
        coverImageUrl="https://zh.apex-elite-service.com/wenjian/logo.png"
      />
    </div>
  );
};

export default MusicPlayer;
