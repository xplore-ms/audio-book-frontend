import React, { useState, useEffect, useRef } from "react";
import AudioControls from "./AudioControl";
import Image from "../assets/narrioai.png";
import Backdrop from "./Backdrop";
import "./styles.css";

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

  const audioRef = useRef<HTMLAudioElement>(new Audio(tracks[initialTrackIndex]?.audioSrc));
  const intervalRef = useRef<number | null>(null);
  const isReady = useRef<boolean>(false);
  const hasPreloadedNext = useRef<boolean>(false);

  const { title, artist, color, audioSrc } = tracks[trackIndex];
  const { duration } = audioRef.current;

  /* ------------------ helpers ------------------ */

  const preloadAudio = (src: string) => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.src = src;
  };

  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      if (audioRef.current.ended) {
        toNextTrack();
      } else {
        setTrackProgress(audioRef.current.currentTime);
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
    if (isPlaying) {
      audioRef.current.play();
      startTimer();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    audioRef.current.pause();
    audioRef.current = new Audio(audioSrc);
    audioRef.current.addEventListener("error", () => onError?.());

    setTrackProgress(0);
    hasPreloadedNext.current = false;

    if (isReady.current) {
      audioRef.current.play();
      setIsPlaying(true);
      startTimer();
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
    audioRef.current.currentTime = value;
    setTrackProgress(value);
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

  useEffect(() => {
    return () => {
      audioRef.current.pause();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

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
