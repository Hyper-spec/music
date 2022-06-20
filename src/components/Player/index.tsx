import { useEffect, useRef, useState } from "react";
import { PlayerContext, usePlayer } from "../../contexts/PlayerContext";
import styles from "../Player/styles.module.scss"
import Image from 'next/image'
import Slider from 'rc-slider'
import Link from 'next/link'
import 'rc-slider/assets/index.css';
import { convertDurationToTimeString } from "../../utils/convertDurationToTimeString";

export function Player() {
    const {episodeList, 
        currentEpisodeIndex, 
        isPlaying, 
        togglePlay,
        toggleShuffle,
        isShuffling,
        setPlayingState, 
        playNext,
        isLooping,
        toggleLoop,
        playPrevious,
        hasNext,
        hasPrevious,
        clearPlayerState
    } = usePlayer();

    const episode = episodeList[currentEpisodeIndex]
    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress, setProgress] = useState(0);

    useEffect((
    ) => {
        if (!audioRef.current) {
            return;
        }
        if (isPlaying) {
            audioRef.current.play()
        } else (
            audioRef.current.pause()
        )
    }, [isPlaying])


    function setupProgressListenner() {
        audioRef.current.currentTime = 0;

        audioRef.current.addEventListener('timeupdate', () => {
            setProgress(Math.floor(audioRef.current.currentTime));
        })
    }

    function handleSeek(amount: number) {
        audioRef.current.currentTime = amount;
        setProgress(amount);
    }

    function handleEpisodeEnded () {
        if (hasNext) {
            playNext();
        } else {
            clearPlayerState();
        }
    }

    return (
       <div className={styles.playerContainer}>
           <header>
               <img src="/playing.svg" alt="playing now"/>
               <strong>Playing Now</strong>
           </header>

          

           {episode ? (
               <div className={styles.currentEpisode}>
                   <Image width={592} height={592} src={episode.thumbnail} objectFit='cover'/>
                   <strong>{episode.title}</strong>
                   <span>{episode.members}</span>
               </div>
           ) : (
               <div className={styles.emptyPlayer}>
                    <strong>Select a Song to Play</strong>
               </div>
           )}


           <footer className={!episode ? styles.empty : ''}>
               <div className={styles.progress}>
                   <span>{convertDurationToTimeString(progress)}</span>
                   <div className={styles.slider}>
                        {episode ? (
                            <Slider 
                            max={episode.duration}
                            value={progress}
                            onChange={handleSeek}
                            trackStyle={{backgroundColor: '#04d351'}}
                            railStyle={{backgroundColor: '#808080'}}
                            handleStyle={{borderStyle:'#F7F8FA', borderWidth: 4, borderColor: '#FFF'}} />
                        ) : (
                            <div className={styles.emptySlider}/>
                        )}
                   </div>
                   <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
               </div>


               {episode && (
                   <audio src={episode.url}
                   autoPlay
                   loop={isLooping}
                   ref={audioRef}
                   onEnded={handleEpisodeEnded}
                   onLoadedMetadata={setupProgressListenner}
                   onPlay={() => setPlayingState(true)}
                   onPause={() => setPlayingState(false)}/>
               )}

               <div className={styles.buttons}>
                   <button type="button" disabled={!episode || episodeList.length == 1  } onClick={toggleShuffle} className={isShuffling ? styles.isActive : ''}>
                       <img src="/shuffle.svg" alt="Embaralhar"/>
                   </button>
                   <button type="button" onClick={playPrevious} disabled={!episode || !hasPrevious}>
                       <img src="/play-previous.svg" alt="Tocar anterior"/>
                   </button>
                   <button type="button" className={styles.playButton} disabled={!episode}
                   onClick={togglePlay}>
                       {isPlaying ? <img src="/pause.svg" alt="Tocar"/>
                       : <img src="/play.svg" alt="Tocar"/>}
                   </button>
                   <button type="button" onClick={playNext} disabled={!episode || !hasNext}>
                       <img src="/play-next.svg" alt="Tocar próxima" />
                   </button>
                   <button type="button" onClick={toggleLoop} className={isLooping ? styles.isActive : ''} disabled={!episode}>
                       <img src="/repeat.svg" alt="repetir"/>
                   </button>
               </div>
           </footer>
       </div>
    )
}