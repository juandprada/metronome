class Announcer {
    private utterance: SpeechSynthesisUtterance | null = null;
    private selectedVoice: SpeechSynthesisVoice | null = null;
    private voices: SpeechSynthesisVoice[] = [];

    constructor() {
        // Guard against environments where speech synthesis is not available
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            this.utterance = new SpeechSynthesisUtterance();
            this.loadVoices();
            // The 'onvoiceschanged' event is crucial because voices can load asynchronously.
            speechSynthesis.onvoiceschanged = () => this.loadVoices();
        }
    }

    private loadVoices() {
        if (!speechSynthesis) return;
        this.voices = speechSynthesis.getVoices();
        this.selectVoice();
    }

    private selectVoice() {
        if (this.voices.length === 0) return;

        // A scoring system to find the best available female voice.
        const scoredVoices = this.voices
            .filter(voice => voice.lang.startsWith('en')) // Filter for English voices
            .map(voice => {
                let score = 0;
                const name = voice.name.toLowerCase();
                const lang = voice.lang.toLowerCase();

                // High preference for known high-quality voices across platforms
                if (name.includes('samantha') && lang === 'en-us') score += 100; // Apple (high quality)
                if (name.includes('zira') && lang === 'en-us') score += 100;     // Microsoft (high quality)
                if (name.includes('susan') && lang === 'en-gb') score += 90;      // Often found on Android
                if (name.includes('google uk english female')) score += 80;       // Google's high quality voice

                // Generic "female" identifiers get a boost
                if (name.includes('female')) score += 50;
                
                // Local voices are often higher quality than remote ones
                if (voice.localService) score += 20;

                // Penalize known male voices to avoid them
                if (name.includes('male') || name.includes('david') || name.includes('mark')) score -= 100;
                
                // Lower score for generic or robotic-sounding voices
                if (name.includes('google') && !name.includes('uk english female')) score -= 10;
                
                return { voice, score };
            })
            .filter(item => item.score > 0) // Only consider voices with a positive score
            .sort((a, b) => b.score - a.score); // Sort from best to worst

        if (scoredVoices.length > 0) {
            this.selectedVoice = scoredVoices[0].voice;
        } else {
            // Fallback to the first available english female voice if scoring fails
            this.selectedVoice = this.voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')) || null;
        }

        // If still no voice, fallback to any English voice
        if (!this.selectedVoice) {
            this.selectedVoice = this.voices.find(v => v.lang.startsWith('en')) || null;
        }
    }

    public announce(bpm: number) {
        if (!this.utterance || !speechSynthesis) {
            return;
        }
        
        // Voices might not be loaded on the first call, try to load them again.
        if (this.voices.length === 0) {
            this.loadVoices();
        }

        // If a voice has been selected, use it.
        if (this.selectedVoice) {
            this.utterance.voice = this.selectedVoice;
        }
        
        // Configure for a natural sound
        this.utterance.pitch = 1;
        this.utterance.rate = 1.1; // Slightly faster can sound more natural
        this.utterance.volume = 0.9; 

        this.utterance.text = `${Math.round(bpm)} beats per minute`;
        
        // Cancel any currently speaking or queued utterances before speaking the new one.
        speechSynthesis.cancel();
        speechSynthesis.speak(this.utterance);
    }

    public cancel() {
        if (speechSynthesis) {
            speechSynthesis.cancel();
        }
    }
}

export const voiceAnnouncer = new Announcer();