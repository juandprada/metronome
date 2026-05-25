
import React from 'react';

interface BeatIndicatorProps {
    totalBeats: number;
    currentBeat: number;
}

export const BeatIndicator: React.FC<BeatIndicatorProps> = ({ totalBeats, currentBeat }) => {
    // Hide indicator if there's no step change or only one beat in the cycle.
    if (totalBeats <= 1) {
        return <div className="h-6 my-4" />;
    }

    const progressPercentage = totalBeats > 0 ? (currentBeat / totalBeats) * 100 : 0;

    return (
        <div className="my-4 h-6 flex items-center">
            <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div 
                    className="bg-cyan-400 h-2.5 rounded-full transition-all duration-150 ease-linear" 
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
        </div>
    );
};
