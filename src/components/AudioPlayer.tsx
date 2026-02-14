import React, { useState, useEffect, useRef } from "react";
import AudioControls from "./AudioControl";
import Image from "../assets/narrioai.png";
import Backdrop from "./Backdrop";
import "./styles.css";
import Hls from "hls.js";

interface Track {
  title: string;
  artist: string;
  color: string;
  audioSrc: string;
}

interface AudioPlayerProps {
  tracks: Track[];
  initialTrackIndex?: number;
  onTrackIndexChange?: (index: number) => void;
  initialIsPlaying?: boolean;
  onIsPlayingChange?: (isPlaying: boolean) => void;
  onError?: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  tracks,
  initialTrackIndex = 0,
  onTrackIndexChange,
  initialIsPlaying = false,
  onIsPlayingChange,
  onError
}) => {
  const [trackIndex, setTrackIndex] = useState<number>(initialTrackIndex);
  const [trackProgress, setTrackProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(initialIsPlaying);
  const [duration, setDuration] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const intervalRef = useRef<number | null>(null);
  const isReady = useRef<boolean>(false);
  const hasPreloadedNext = useRef<boolean>(false);

  const { title, artist, color, audioSrc } = tracks[trackIndex];

  /* ------------------ helpers ------------------ */

  const preloadAudio = (src: string) => {
    // Preloading next track - complex with HLS, simple with Audio
    // For now, only preload if it's not HLS or if we want to implement HLS preloading
    if (src.includes('.m3u8')) return; // Skip preloading for HLS for now to avoid complexity
    const audio = new Audio();
    audio.preload = "auto";
    audio.src = src;
  };

  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      if (audioRef.current?.ended) {
        toNextTrack();
      } else if (audioRef.current) {
        setTrackProgress(audioRef.current.currentTime);
        // Sync duration if needed
        if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
          setDuration(audioRef.current.duration);
        }
      }
    }, 1000);
  };

  /* ------------------ playback ------------------ */

  useEffect(() => {
    setTrackIndex(initialTrackIndex);
  }, [initialTrackIndex]);

  useEffect(() => {
    setIsPlaying(initialIsPlaying);
  }, [initialIsPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Playback failed", error);
          });
        }
        startTimer();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Cleanup previous hls/audio
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      // Remove old listeners to avoid memory leaks if we were reusing
      // But here we are creating a new Audio instance usually.
      // Actually, let's create a new one to be clean.
    }

    const newAudio = new Audio();
    audioRef.current = newAudio;

    // Add error listener
    newAudio.addEventListener("error", (e) => {
      console.error("Audio error", e);
      onError?.();
    });

    // Handle Metadata loaded to set duration
    newAudio.addEventListener("loadedmetadata", () => {
      setDuration(newAudio.duration);
    });

    setTrackProgress(0);
    hasPreloadedNext.current = false;

    const isHls = audioSrc.includes('.m3u8');

    if (isHls && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(audioSrc);
      hls.attachMedia(newAudio);
      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setDuration(newAudio.duration);
        if (isReady.current) {
          newAudio.play().catch(e => console.error("Play error", e));
          setIsPlaying(true);
          startTimer();
        }
      });
    } else if (newAudio.canPlayType('application/vnd.apple.mpegurl') && isHls) {
      // Native HLS support (Safari)
      newAudio.src = audioSrc;
      newAudio.addEventListener('loadedmetadata', () => {
        setDuration(newAudio.duration);
      });
    } else {
      // Normal playback
      newAudio.src = audioSrc;
    }

    // Attempt to play if ready
    if (isReady.current) {
      // For non-HLS or native HLS, we need to play explicitly if not handled by manifest parsed
      // Or if Hls.isSupported() is false (native fallback)
      if (!hlsRef.current || !Hls.isSupported()) {
        newAudio.play().catch(e => console.error("Play error", e));
        setIsPlaying(true);
        startTimer();
      }
    } else {
      isReady.current = true;
    }

  }, [trackIndex, audioSrc]);

  /* ------------------ 🔥 PRELOAD NEXT TRACK ------------------ */

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (!audio.duration) return;

      const progress = audio.currentTime / audio.duration;

      // Preload next track at ~85%
      if (progress > 0.85 && !hasPreloadedNext.current) {
        const nextTrack = tracks[trackIndex + 1];
        if (nextTrack) {
          preloadAudio(nextTrack.audioSrc);
          hasPreloadedNext.current = true;
        }
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => audio.removeEventListener("timeupdate", handleTimeUpdate);
  }, [trackIndex, tracks]);

  /* ------------------ controls ------------------ */

  const onScrub = (value: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setTrackProgress(value);
    }
  };

  const onScrubEnd = () => {
    if (!isPlaying) setIsPlaying(true);
    startTimer();
  };

  const toPrevTrack = () => {
    const newIndex = trackIndex - 1 < 0 ? tracks.length - 1 : trackIndex - 1;
    setTrackIndex(newIndex);
    onTrackIndexChange?.(newIndex);
  };

  const toNextTrack = () => {
    const newIndex = trackIndex < tracks.length - 1 ? trackIndex + 1 : 0;
    setTrackIndex(newIndex);
    onTrackIndexChange?.(newIndex);
  };

  const currentPercentage = duration
    ? `${(trackProgress / duration) * 100}%`
    : "0%";

  const trackStyling = `
    -webkit-gradient(
      linear,
      0% 0%,
      100% 0%,
      color-stop(${currentPercentage}, #fff),
      color-stop(${currentPercentage}, #777)
    )
  `;

  return (
    <div className="audio-player">
      <div className="track-info">
        <img className="artwork" src={Image} alt={`${title} artwork`} />

        <h2 className="title text-white">{title}</h2>
        <h3 className="artist text-white">{artist}</h3>

        <AudioControls
          isPlaying={isPlaying}
          onPrevClick={toPrevTrack}
          onNextClick={toNextTrack}
          onPlayPauseClick={(play) => {
            setIsPlaying(play);
            onIsPlayingChange?.(play);
          }}
        />

        <input
          type="range"
          value={trackProgress}
          step={1}
          min={0}
          max={duration || 0}
          className="progress"
          onChange={(e) => onScrub(Number(e.target.value))}
          onMouseUp={onScrubEnd}
          onKeyUp={onScrubEnd}
          style={{ background: trackStyling }}
        />
      </div>

      <Backdrop
        trackIndex={trackIndex}
        activeColor={color}
        isPlaying={isPlaying}
      />
    </div>
  );
};

export default AudioPlayer;
