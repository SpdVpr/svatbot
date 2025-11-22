import React from 'react';
import { Play } from 'lucide-react';

interface VideoSectionProps {
  videoUrl?: string;
  coverImage: string;
}

export const VideoSection: React.FC<VideoSectionProps> = ({ videoUrl, coverImage }) => {
  if (!videoUrl) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-serif font-bold mb-6 text-stone-900 px-2">Video ukázka</h2>
      
      <div className="relative w-full rounded-3xl overflow-hidden shadow-sm border border-stone-100 bg-stone-900 aspect-video group">
        {/* Since we don't have a real video file, we use an iframe for YouTube/Vimeo or a placeholder */}
        <iframe 
          src="https://www.youtube.com/embed/EngW7tLk6R8?si=98oX2x6Jz8yqgZ0_" 
          title="Wedding Video" 
          className="absolute inset-0 w-full h-full object-cover"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
        ></iframe>
        
        {/* Overlay (Optional, if we were using a custom player or needed to hide standard controls initially) */}
        {/* 
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors pointer-events-none" />
        */}
      </div>
      <p className="mt-3 text-sm text-stone-500 px-2 flex items-center gap-2">
        <Play size={14} className="fill-stone-500" />
        Sestřih svatební sezóny 2023
      </p>
    </div>
  );
};