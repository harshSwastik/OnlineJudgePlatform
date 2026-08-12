import { useState, useRef, useEffect } from 'react';
import { Pause, Play, Volume2, VolumeX, Maximize } from 'lucide-react';

const Editorial = ({ secureUrl, thumbnailUrl, duration }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation(); // Prevents triggering the video click event
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = (e) => {
    e.stopPropagation();
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  // Update current time during playback
  useEffect(() => {
    const video = videoRef.current;
    
    const handleTimeUpdate = () => {
      if (video) setCurrentTime(video.currentTime);
    };
    
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      return () => video.removeEventListener('timeupdate', handleTimeUpdate);
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-lg bg-black group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={secureUrl}
        poster={thumbnailUrl}
        onClick={togglePlayPause}
        onEnded={() => setIsPlaying(false)} // Resets play button when video finishes
        className="w-full aspect-video cursor-pointer"
      />
      
      {/* Video Controls Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 transition-opacity duration-300 ${
          isHovering || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-3 w-full">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="btn btn-circle btn-primary btn-sm"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-1" />}
          </button>
          
          {/* Progress Bar & Time */}
          <span className="text-white text-xs font-medium w-10 text-right">
            {formatTime(currentTime)}
          </span>
          
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={(e) => {
              if (videoRef.current) {
                videoRef.current.currentTime = Number(e.target.value);
                setCurrentTime(Number(e.target.value));
              }
            }}
            className="range range-primary range-xs flex-1 cursor-pointer"
          />
          
          <span className="text-white text-xs font-medium w-10">
            {formatTime(duration)}
          </span>

          {/* Mute Toggle */}
          <button 
            onClick={toggleMute}
            className="btn btn-circle btn-ghost btn-sm text-white hover:bg-white/20"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Fullscreen Toggle */}
          <button 
            onClick={toggleFullscreen}
            className="btn btn-circle btn-ghost btn-sm text-white hover:bg-white/20"
          >
            <Maximize size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Editorial;