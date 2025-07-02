"use client";

import React, { useState, useEffect, useRef } from 'react';

// --- SVG 图标 ---
const VolumeHighIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
);
const VolumeMediumIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
);
const VolumeMuteIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
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
        width: 60px;
        height: 4px;
        background: rgba(255,255,255,0.2);
        border-radius: 5px;
        outline: none;
        transition: opacity 0.2s;
        cursor: pointer;
      }
      .volume-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 12px;
        height: 12px;
        background: white;
        border-radius: 50%;
        cursor: pointer;
      }
      .volume-slider::-moz-range-thumb {
        width: 12px;
        height: 12px;
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
  songTitle: string; // 新增：歌曲标题
  coverImageUrl?: string; // 可选的封面图片URL
}

function MusicArtwork({
  songUrl,
  isSong,
  songTitle,
  coverImageUrl,
}: MusicArtworkProps) {
  // --- 状态钩子 ---
  const [albumArt, setAlbumArt] = useState(coverImageUrl || 'https://placehold.co/256x256/171717/ffffff?text=No+Art');
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

  // Effect 1: 控制音频播放
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(e => console.error("播放失败:", e));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Effect 2: 同步UI和音频原生事件
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

  // Effect 3: 鼠标悬停Tooltip
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

  // Effect 4: 音量控制
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Effect 5: 点击外部关闭音量条
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

  // Effect 6: 更新封面
  useEffect(() => {
    setAlbumArt(coverImageUrl || 'https://placehold.co/256x256/171717/ffffff?text=No+Art');
    setImageLoaded(false); // 每次URL变化时重置加载状态
  }, [coverImageUrl]);


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
          style={{ left: mousePosition.x - 150, top: mousePosition.y - 50 }}
        >
          <div className="bg-neutral-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shadow-lg border border-neutral-700/50 animate-in">
            {songTitle}
          </div>
        </div>
      )}

      <div className="relative group/player">
        <div
          className={`absolute -left-8 sm:-left-12 top-1/2 -translate-y-1/2 transition-all duration-500 ease-out ${
            isHovered || isPlaying
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 -translate-x-10 sm:-translate-x-16'
          }`}
        >
          <div className="relative w-[95px] h-[95px] sm:w-[130px] sm:h-[130px]">
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
          className="relative overflow-hidden rounded-lg shadow-2xl transition-all duration-300 ease-out hover:scale-105 hover:shadow-3xl cursor-pointer w-24 h-24 sm:w-32 sm:h-32"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <img
            src={albumArt}
            alt={`${songTitle} 封面`}
            className={`w-full h-full object-cover transition-all duration-300 ease-out group-hover/player:scale-110 ${
              !imageLoaded ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
                if (albumArt !== 'https://placehold.co/256x256/171717/ffffff?text=Cover+Error') {
                    setAlbumArt('https://placehold.co/256x256/171717/ffffff?text=Cover+Error');
                }
                setImageLoaded(true);
            }}
            onClick={handlePlayPause}
          />
          
          {!imageLoaded && (
            <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
          )}
          
          <div className={`absolute bottom-1.5 left-1.5 right-1.5 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button className="w-7 h-7 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg text-white hover:bg-black/50" onClick={handlePlayPause}>
                  {isPlaying ? (
                    <div className="flex gap-px"><div className="w-px h-2.5 bg-white rounded-sm"></div><div className="w-px h-2.5 bg-white rounded-sm"></div></div>
                  ) : (
                    <div className="w-0 h-0 border-l-[5px] border-l-white border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent ml-0.5"></div>
                  )}
                </button>
                <div className="sm:hidden">
                  <div className="text-white text-[9px] font-medium whitespace-nowrap bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded">
                    {songTitle}
                  </div>
                </div>
              </div>

              <div ref={volumeControlRef} className="relative flex items-center">
                <button className="w-7 h-7 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg text-white hover:bg-black/50" onClick={() => setShowVolumeControl(prev => !prev)}>
                  <VolumeIcon />
                </button>
                <div className={`absolute right-0 bottom-full mb-1 p-1.5 ${showVolumeControl ? 'block' : 'hidden'}`}>
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
  // 您的七牛云链接（在配置好CORS后使用）
  const yourSongUrl = "https://zh.apex-elite-service.com/wenjian/%E9%BB%84%E8%AF%97%E6%89%B6%20-%20%E4%B9%9D%E4%B8%87%E5%AD%97.mp3";
  
  // ===================================================================
  // == 请在这里修改您想显示的歌曲名称 ==
  const songTitle = "九万字";
  // ===================================================================

  // 封面图片URL
  const coverImageUrl = "https://zh.apex-elite-service.com/wenjian/logo.png";

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <KeyframesStyle />
      <MusicArtwork
        songUrl={yourSongUrl} 
        isSong={true}
        songTitle={songTitle}
        coverImageUrl={coverImageUrl}
      />
    </div>
  );
};

export default MusicPlayer;
