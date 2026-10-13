export class ArticleSpeechManager {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private sentences: string[] = [];
  private currentSentenceIdx: number = 0;
  private rate: number = 1.0;
  private onSentenceChangeCallback: ((index: number, total: number) => void) | null = null;
  private onStateChangeCallback: ((isPlaying: boolean, isPaused: boolean) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public isAvailable(): boolean {
    return !!this.synth;
  }

  public setRate(newRate: number) {
    this.rate = newRate;
    if (this.currentUtterance && this.synth && this.synth.speaking) {
      // Restart current sentence at new rate
      const currentIdx = this.currentSentenceIdx;
      this.stop();
      this.playFromSentence(currentIdx);
    }
  }

  public loadArticleContent(htmlContent: string) {
    this.stop();
    // Parse into readable sentences
    const temp = document.createElement('div');
    temp.innerHTML = htmlContent;
    const text = temp.innerText || temp.textContent || '';
    
    // Split text into meaningful sentences
    this.sentences = text
      .split(/(?<=[.?!])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 5);

    this.currentSentenceIdx = 0;
  }

  public play(
    onSentenceChange?: (index: number, total: number) => void,
    onStateChange?: (isPlaying: boolean, isPaused: boolean) => void
  ) {
    if (onSentenceChange) this.onSentenceChangeCallback = onSentenceChange;
    if (onStateChange) this.onStateChangeCallback = onStateChange;

    if (!this.synth || this.sentences.length === 0) return;

    if (this.synth.paused) {
      this.synth.resume();
      this.notifyState(true, false);
      return;
    }

    this.playFromSentence(this.currentSentenceIdx);
  }

  public pause() {
    if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
      this.notifyState(true, true);
    }
  }

  public resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
      this.notifyState(true, false);
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentSentenceIdx = 0;
      this.notifyState(false, false);
      if (this.onSentenceChangeCallback) {
        this.onSentenceChangeCallback(0, this.sentences.length);
      }
    }
  }

  public playFromSentence(idx: number) {
    if (!this.synth || idx >= this.sentences.length) {
      this.stop();
      return;
    }

    this.synth.cancel();
    this.currentSentenceIdx = Math.max(0, idx);

    const sentence = this.sentences[this.currentSentenceIdx];
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.rate = this.rate;

    utterance.onend = () => {
      if (this.currentSentenceIdx + 1 < this.sentences.length) {
        this.currentSentenceIdx++;
        this.playFromSentence(this.currentSentenceIdx);
      } else {
        this.stop();
      }
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis utterance error:', e);
      this.notifyState(false, false);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
    this.notifyState(true, false);

    if (this.onSentenceChangeCallback) {
      this.onSentenceChangeCallback(this.currentSentenceIdx, this.sentences.length);
    }
  }

  public nextSentence() {
    if (this.currentSentenceIdx + 1 < this.sentences.length) {
      this.playFromSentence(this.currentSentenceIdx + 1);
    }
  }

  public previousSentence() {
    if (this.currentSentenceIdx > 0) {
      this.playFromSentence(this.currentSentenceIdx - 1);
    }
  }

  public getCurrentState() {
    return {
      isPlaying: !!(this.synth && this.synth.speaking && !this.synth.paused),
      isPaused: !!(this.synth && this.synth.paused),
      currentSentenceIdx: this.currentSentenceIdx,
      totalSentences: this.sentences.length,
      currentSentence: this.sentences[this.currentSentenceIdx] || ''
    };
  }

  private notifyState(isPlaying: boolean, isPaused: boolean) {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(isPlaying, isPaused);
    }
  }
}
