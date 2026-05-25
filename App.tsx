
import React from 'react';
import { useMetronome } from './hooks/useMetronome';
import { InputControl } from './components/InputControl';
import { BeatIndicator } from './components/BeatIndicator';
import { PlayIcon, StopIcon } from './components/icons';

const App: React.FC = () => {
    const {
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
    } = useMetronome();

    const displayBpm = Math.round(isRunning ? currentBpm : initialBpm);
    const displayBeat = isRunning ? currentBeatInCycle : 0;

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-100 font-sans p-4">
            <div className="w-full max-w-md mx-auto bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-cyan-500/10 border border-slate-700">
                <div className="p-8">
                    <header className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-white">Metronome Pro</h1>
                        <p className="text-slate-400 mt-1">Practice with progressive tempo</p>
                    </header>
                    
                    <div className="text-center bg-slate-900/50 rounded-xl p-6 mb-6 border border-slate-700">
                        <p className="text-sm font-medium text-cyan-400 tracking-widest uppercase">BPM</p>
                        <p className="text-8xl font-black text-white tracking-tighter tabular-nums">{displayBpm}</p>
                        <p className="text-slate-400 h-6">
                            {isRunning && beatsUntilStep > 0 ? `Beat: ${displayBeat} / ${beatsUntilStep}` : (isRunning ? 'Running' : 'Paused')}
                        </p>
                    </div>

                    <BeatIndicator totalBeats={beatsUntilStep} currentBeat={displayBeat} />

                    <div className="space-y-4 mb-8">
                        <InputControl 
                            label="Initial BPM" 
                            value={initialBpm} 
                            onChange={handleInitialBpmChange}
                            min={20}
                            max={400}
                            disabled={isRunning}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <InputControl 
                                label="Step Inc." 
                                value={step} 
                                onChange={setStep}
                                min={0}
                                max={50}
                                disabled={isRunning}
                            />
                            <InputControl 
                                label="Beats per Step" 
                                value={beatsUntilStep} 
                                onChange={setBeatsUntilStep}
                                min={1}
                                max={100}
                                disabled={isRunning}
                            />
                        </div>
                    </div>

                    <div className="text-center">
                        <button 
                            onClick={toggleMetronome}
                            aria-label={isRunning ? 'Stop metronome' : 'Start metronome'}
                            className={`
                                w-20 h-20 rounded-full text-white flex items-center justify-center mx-auto
                                transition-all duration-300 ease-in-out shadow-lg
                                focus:outline-none focus:ring-4
                                ${isRunning 
                                    ? 'bg-red-500 hover:bg-red-600 focus:ring-red-400/50' 
                                    : 'bg-cyan-500 hover:bg-cyan-600 focus:ring-cyan-400/50'
                                }
                            `}
                        >
                            {isRunning ? <StopIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8 pl-1" />}
                        </button>
                    </div>
                </div>
                 <footer className="text-center text-xs text-slate-500 py-4 border-t border-slate-700">
                    <p>Adjust settings and press play to start.</p>
                </footer>
            </div>
        </div>
    );
};

export default App;