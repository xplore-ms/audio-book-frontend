import React from "react";
import  Play  from "../assets/play.svg";
import  Pause  from "../assets/pause.svg";
import  Next  from "../assets/next.svg";
import  Prev  from "../assets/prev.svg";
import "./styles.css"
interface AudioControlsProps {
  isPlaying: boolean;
  onPlayPauseClick: (play: boolean) => void;
  onPrevClick: () => void;
  onNextClick: () => void;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  onPlayPauseClick,
  onPrevClick,
  onNextClick
}) => {
  return (
    <div className="audio-controls">
      <button
        type="button"
        className="prev text-white"
        aria-label="Previous"
        onClick={onPrevClick}
      >
        <img src={Prev} alt="Previous" className="svg-white w-6 h-6" />
      </button>

      {isPlaying ? (
        <button
          type="button"
          className="pause text-white"
          onClick={() => onPlayPauseClick(false)}
          aria-label="Pause"
        >
          <img src={Pause} alt="Pause" className="svg-white w-6 h-6" />

        </button>
      ) : (
        <button
          type="button"
          className="play text-white"
          onClick={() => onPlayPauseClick(true)}
          aria-label="Play"
        >
          <img src={Play} alt="Play" className="svg-white w-6 h-6" />

        </button>
      )}

      <button
        type="button"
        className="next text-white"
        aria-label="Next"
        onClick={onNextClick}
      >
        <img src={Next} alt="Next" className="svg-white w-6 h-6" />

      </button>
    </div>
  );
};

export default AudioControls;
