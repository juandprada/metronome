import { useState, useEffect, useRef, useCallback } from 'react';
import { voiceAnnouncer } from './voice';

const createAudioSystem = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playSound = (isAccent: boolean) => {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        const now = audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.5, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
        
        oscillator.frequency.value = isAccent ? 880 : 440;
        oscillator.type = 'sine';
        
        oscillator.start(now);
        oscillator.stop(now + 0.1);
    };
    return { playSound, audioContext };
};

export const useMetronome = () => {
    const [initialBpm, setInitialBpm] = useState<number>(50);
    const [currentBpm, setCurrentBpm] = useState<number>(50);
    const [step, setStep] = useState<number>(20);
    const [beatsUntilStep, setBeatsUntilStep] = useState<number>(100);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [currentBeatInCycle, setCurrentBeatInCycle] = useState<number>(0);
    
    const audioSystemRef = useRef<{ playSound: (isAccent: boolean) => void; audioContext: AudioContext } | null>(null);
    const timerRef = useRef<number | null>(null);

    const stopMetronome = useCallback(() => {
        setIsRunning(false);
        setCurrentBeatInCycle(0);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        // Cancel any pending announcements
        voiceAnnouncer.cancel();
    }, []);

    const startMetronome = useCallback(() => {
        if (!audioSystemRef.current) {
            audioSystemRef.current = createAudioSystem();
        }
        audioSystemRef.current.audioContext.resume();
        setCurrentBpm(initialBpm);
        setCurrentBeatInCycle(1);
        setIsRunning(true);
    }, [initialBpm]);

    const toggleMetronome = useCallback(() => {
        if (isRunning) {
            stopMetronome();
        } else {
            startMetronome();
        }
    }, [isRunning, startMetronome, stopMetronome]);

    useEffect(() => {
        if (!isRunning || currentBeatInCycle === 0) {
            return;
        }

        const run = () => {
            const isAccent = beatsUntilStep > 0 && currentBeatInCycle === 1;
            audioSystemRef.current?.playSound(isAccent);
            
            if (beatsUntilStep > 0 && currentBeatInCycle % beatsUntilStep === 0) {
                setCurrentBpm(prevBpm => {
                    const newBpm = prevBpm + step;
                    voiceAnnouncer.announce(newBpm);
                    return newBpm;
                });
                setCurrentBeatInCycle(1);
            } else {
                setCurrentBeatInCycle(prevBeat => prevBeat + 1);
            }
        };

        const interval = (60 / currentBpm) * 1000;
        timerRef.current = window.setTimeout(run, interval);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isRunning, currentBeatInCycle, currentBpm, step, beatsUntilStep]);
    
    const handleInitialBpmChange = (newBpm: number) => {
        const clampedBpm = Math.max(20, Math.min(400, newBpm));
        setInitialBpm(clampedBpm);
        if (!isRunning) {
            setCurrentBpm(clampedBpm);
        }
    };

    return {
        currentBpm,
        step,
        setStep,
        beatsUntilStep,
        setBeatsUntilStep,
        isRunning,
        currentBeatInCycle,
        toggleMetronome,
        handleInitialBpmChange,
        initialBpm,
    };
};
