import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import * as browserSpeech from '../utils/browserSpeech';
import { speak, initVoices, isSpeechSupported, cancelAllSpeech } from '../utils/speech';
import PronunciationButton from '../components/PronunciationButton';

class FakeAudio {
  static instances: FakeAudio[] = [];
  src: string;
  currentTime = 0;
  playbackRate = 1.0;
  duration = 1.2;
  listeners: Record<string, Array<(e?: any) => void>> = {};
  playImpl: () => Promise<void> = () => Promise.resolve();
  pause = vi.fn();

  constructor(src = '') {
    this.src = src;
    FakeAudio.instances.push(this);
  }

  addEventListener(event: string, cb: (e?: any) => void) {
    (this.listeners[event] ??= []).push(cb);
  }

  emit(event: string, payload?: any) {
    for (const cb of this.listeners[event] ?? []) {
      cb(payload);
    }
  }

  play() {
    return this.playImpl();
  }
}

describe('Speech Audio Engine & PronunciationButton', () => {
  const OriginalAudio = globalThis.Audio;

  beforeEach(() => {
    FakeAudio.instances = [];
    (globalThis as any).Audio = FakeAudio;
    vi.spyOn(browserSpeech, 'initVoices').mockResolvedValue();
    vi.spyOn(browserSpeech, 'unlockIOSAudio').mockImplementation(() => {});
  });

  afterEach(() => {
    cancelAllSpeech();
    globalThis.Audio = OriginalAudio;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('plays pre-rendered local MP3s, applies custom rate on loadedmetadata, and invokes onEnd when ended', async () => {
    expect(isSpeechSupported()).toBe(true);
    await initVoices();
    await initVoices(); // idempotent second call

    const onEnd = vi.fn();
    speak('Hello', 'en-US', 'btn-1', onEnd, undefined, { rate: 0.7, category: 'phrases' });

    expect(FakeAudio.instances).toHaveLength(1);
    const audio = FakeAudio.instances[0];
    expect(audio.src).toBe('/audio/phrases/hello.mp3');

    audio.emit('loadedmetadata');
    expect(audio.playbackRate).toBe(0.7);

    audio.emit('ended');
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('interrupts an already-playing button and fires its onEnd immediately when another button starts', () => {
    const firstEnded = vi.fn();
    const secondEnded = vi.fn();

    speak('Hello', 'en-US', 'btn-first', firstEnded, undefined, { category: 'phrases' });
    expect(FakeAudio.instances).toHaveLength(1);

    speak('Goodbye', 'en-US', 'btn-second', secondEnded, undefined, { category: 'phrases' });
    expect(FakeAudio.instances).toHaveLength(2);
    expect(FakeAudio.instances[0].pause).toHaveBeenCalled();
    expect(firstEnded).toHaveBeenCalledTimes(1);

    FakeAudio.instances[1].emit('ended');
    expect(secondEnded).toHaveBeenCalledTimes(1);
  });

  it('falls back to browser speech synthesis when Audio emits an error or play() rejects or text has no local MP3', async () => {
    const ttsSpy = vi
      .spyOn(browserSpeech, 'speakEnglishText')
      .mockImplementation((_text, _opts, onEnd) => {
        if (onEnd) onEnd();
      });

    // 1. Audio element error event
    const onEnd1 = vi.fn();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    speak('Hello', 'en-US', 'btn-err', onEnd1, undefined, { category: 'phrases' });
    FakeAudio.instances[0].emit('error', new Error('404'));
    expect(ttsSpy).toHaveBeenCalledTimes(1);
    expect(onEnd1).toHaveBeenCalledTimes(1);

    // 2. Audio play() promise rejection
    class RejectingAudio extends FakeAudio {
      play() {
        return Promise.reject(new Error('NotAllowedError'));
      }
    }
    (globalThis as any).Audio = RejectingAudio;
    const onEnd2 = vi.fn();
    speak('Goodbye', 'en-US', 'btn-reject', onEnd2, undefined, { category: 'phrases' });
    await waitFor(() => expect(onEnd2).toHaveBeenCalledTimes(1));
    expect(ttsSpy).toHaveBeenCalledTimes(2);

    // 3. useLocalAudio: false bypasses local MP3s directly
    const onEnd3 = vi.fn();
    speak('Custom dynamic sentence', 'en-US', 'btn-tts', onEnd3, undefined, { useLocalAudio: false });
    expect(onEnd3).toHaveBeenCalledTimes(1);
    expect(ttsSpy).toHaveBeenCalledTimes(3);
  });

  it('propagates speech synthesis fallback errors and cancels active playback cleanly', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(browserSpeech, 'speakEnglishText').mockImplementation((_t, _o, _onEnd, onError) => {
      if (onError) onError(new Error('synth failed'));
    });

    const onError = vi.fn();
    speak('Unknown phrase without mp3', 'en-US', 'btn-fail', undefined, onError);
    expect(onError).toHaveBeenCalledWith(expect.any(Error));

    // Active audio cancellation
    const onCancelEnd = vi.fn();
    speak('Water', 'en-US', 'btn-cancel', onCancelEnd, undefined, { category: 'words' });
    const active = FakeAudio.instances[FakeAudio.instances.length - 1];
    cancelAllSpeech();
    expect(active.pause).toHaveBeenCalled();
    expect(onCancelEnd).toHaveBeenCalledTimes(1);
  });

  it('releases stuck playback via safety timer if browser drops the ended event', () => {
    vi.useFakeTimers();
    const onEnd = vi.fn();
    speak('Apple', 'en-US', 'btn-timeout', onEnd, undefined, { category: 'examples' });
    const audio = FakeAudio.instances[0];
    audio.duration = 1.0;
    audio.emit('loadedmetadata');

    vi.advanceTimersByTime(2500);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('renders PronunciationButton, plays on click, shows Speaking state, and resets on completion or prop change', async () => {
    const { rerender, unmount } = render(
      <PronunciationButton text="Hello" audioCategory="phrases" label="Hear Hello" />
    );

    const btn = await screen.findByRole('button', { name: 'Hear Hello' });
    await waitFor(() => expect(btn).not.toBeDisabled());

    fireEvent.click(btn);
    expect(btn).toHaveClass('playing');
    expect(btn).toHaveAttribute('aria-label', 'Speaking...');
    expect(FakeAudio.instances).toHaveLength(1);

    // Changing text resets playing state immediately
    rerender(<PronunciationButton text="Goodbye" audioCategory="phrases" label="Hear Goodbye" />);
    expect(btn).not.toHaveClass('playing');

    // Click again and complete via ended event
    fireEvent.click(btn);
    expect(btn).toHaveClass('playing');
    act(() => {
      FakeAudio.instances[FakeAudio.instances.length - 1].emit('ended');
    });
    expect(btn).not.toHaveClass('playing');

    unmount();
  });
});
