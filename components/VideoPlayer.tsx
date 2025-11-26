'use client';

import { useState, useRef, useEffect } from 'react';
import { Play } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  alt?: string;
  className?: string;
  fill?: boolean;
  objectFit?: 'contain' | 'cover';
}

export default function VideoPlayer({ 
  src, 
  alt = 'Video', 
  className = '', 
  fill = false,
  objectFit = 'contain'
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  // Reset when src changes
  useEffect(() => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
    }
  }, [src]);

  const containerClasses = fill 
    ? `absolute inset-0 ${className}`
    : className;

  const handleVideoClick = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  return (
    <div className={`relative ${containerClasses} bg-black`}>
      <video
        ref={videoRef}
        src={src}
        className={`h-full w-full ${objectFit === 'cover' ? 'object-cover' : 'object-contain'}`}
        onEnded={handleVideoEnd}
        onClick={handleVideoClick}
        playsInline
        preload="metadata"
      />
      
      {!isPlaying && (
        <button
          onClick={handlePlay}
          className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90 p-4 shadow-lg transition hover:bg-white hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Play video"
        >
          <Play className="h-8 w-8 text-gray-900 fill-gray-900 ml-1" />
        </button>
      )}
    </div>
  );
}

