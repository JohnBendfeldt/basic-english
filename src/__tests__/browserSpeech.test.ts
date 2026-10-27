import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  scoreVoice,
  isVoiceBlacklisted,
  getFriendlyEnglishVoices,
  getBestEnglishVoice,
  getBrowserVoiceQualityInfo,
  isNeuralVoice,
  speakEnglishText,
  setPreferredVoice,
  getPreferredVoiceURI
} from '../utils/browserSpeech';

// Mock helper to create SpeechSynthesisVoice
const createMockVoice = (
  name: string,
  lang = 'en-US',
  options: { localService?: boolean; isDefault?: boolean } = {}
): SpeechSynthesisVoice => ({
  name,
  lang,
  voiceURI: `uri-${name.toLowerCase().replace(/\s+/g, '-')}`,
  localService: options.localService ?? true,
  default: options.isDefault ?? false,
});

class MockSpeechSynthesisUtterance {
  text: string;
  lang = 'en-US';
  rate = 1.0;
  pitch = 1.0;
  voice: SpeechSynthesisVoice | null = null;
  onend: ((e: any) => void) | null = null;
  onerror: ((e: any) => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

describe('Browser Speech Synthesis - Voice Scoring & Discovery', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.stubGlobal('SpeechSynthesisUtterance', MockSpeechSynthesisUtterance);
  });

  it('blacklists and severely penalizes broken Edge Microsoft Ava voices', () => {
    const brokenEdgeAva = createMockVoice('Microsoft Ava Online (Natural) - English (United States)');
    const brokenEdgeAvaMultilingual = createMockVoice('Microsoft AvaMultilingual Online (Natural)');
    
    expect(isVoiceBlacklisted(brokenEdgeAva.name)).toBe(true);
    expect(isVoiceBlacklisted(brokenEdgeAvaMultilingual.name)).toBe(true);
    expect(scoreVoice(brokenEdgeAva)).toBe(-1000);
    expect(scoreVoice(brokenEdgeAvaMultilingual)).toBe(-1000);
  });

  it('allows local Apple Ava on macOS while blocking Microsoft Ava', () => {
    const appleAva = createMockVoice('Ava (Enhanced)', 'en-US');
    expect(isVoiceBlacklisted(appleAva.name)).toBe(false);
    expect(scoreVoice(appleAva)).toBeGreaterThan(0);
  });

  it('prioritizes Microsoft Jenny Online (Natural) and Aria as top Edge voices', () => {
    const jenny = createMockVoice('Microsoft Jenny Online (Natural) - English (United States)');
    const aria = createMockVoice('Microsoft Aria Online (Natural) - English (United States)');
    const guy = createMockVoice('Microsoft Guy Online (Natural) - English (United States)');
    const brokenAva = createMockVoice('Microsoft Ava Online (Natural) - English (United States)');

    const jennyScore = scoreVoice(jenny);
    const ariaScore = scoreVoice(aria);
    const guyScore = scoreVoice(guy);
    const avaScore = scoreVoice(brokenAva);

    expect(jennyScore).toBeGreaterThan(ariaScore);
    expect(ariaScore).toBeGreaterThan(guyScore);
    expect(guyScore).toBeGreaterThan(0);
    expect(avaScore).toBe(-1000);
  });

  it('prioritizes Google Studio and Apple Siri/Enhanced voices', () => {
    const googleUS = createMockVoice('Google US English');
    const siri = createMockVoice('Siri Voice 1', 'en-US');
    const samantha = createMockVoice('Samantha', 'en-US');
    const legacyRobotic = createMockVoice('Albert', 'en-US');

    expect(scoreVoice(googleUS)).toBeGreaterThan(scoreVoice(samantha));
    expect(scoreVoice(siri)).toBeGreaterThan(scoreVoice(samantha));
    expect(scoreVoice(legacyRobotic)).toBe(-1000);
  });

  it('penalizes legacy Windows SAPI5 desktop voices and novelty synthesizers', () => {
    const davidDesktop = createMockVoice('Microsoft David Desktop - English (United States)');
    const ziraDesktop = createMockVoice('Microsoft Zira Desktop - English (United States)');
    const espeak = createMockVoice('espeak-en');
    const zarvox = createMockVoice('Zarvox');

    expect(scoreVoice(davidDesktop)).toBeLessThan(0);
    expect(scoreVoice(ziraDesktop)).toBeLessThan(0);
    expect(scoreVoice(espeak)).toBe(-1000);
    expect(scoreVoice(zarvox)).toBe(-1000);
  });

  it('heavily penalizes Stephen Hawking-like novelty voices (Eddy, Flo, Reed, Sandy)', () => {
    const eddy = createMockVoice('Eddy', 'en-US');
    const flo = createMockVoice('Flo', 'en-US');
    const reed = createMockVoice('Reed', 'en-US');

    expect(scoreVoice(eddy)).toBe(-600);
    expect(scoreVoice(flo)).toBe(-600);
    expect(scoreVoice(reed)).toBe(-600);
  });

  it('accurately distinguishes true AI neural voices from legacy offline synthesizers with isNeuralVoice', () => {
    const googleUS = createMockVoice('Google US English');
    const jenny = createMockVoice('Microsoft Jenny Online (Natural) - English (United States)');
    const siri = createMockVoice('Siri Voice 1', 'en-US');
    const samanthaEnhanced = createMockVoice('Samantha (Enhanced)', 'en-US');

    const samanthaCompact = createMockVoice('Samantha', 'en-US');
    const eddy = createMockVoice('Eddy', 'en-US');
    const davidDesktop = createMockVoice('Microsoft David Desktop - English (United States)');

    // True Neural AI
    expect(isNeuralVoice(googleUS)).toBe(true);
    expect(isNeuralVoice(jenny)).toBe(true);
    expect(isNeuralVoice(siri)).toBe(true);
    expect(isNeuralVoice(samanthaEnhanced)).toBe(true);

    // Standard / Robotic offline synthesizers
    expect(isNeuralVoice(samanthaCompact)).toBe(false);
    expect(isNeuralVoice(eddy)).toBe(false);
    expect(isNeuralVoice(davidDesktop)).toBe(false);
  });

  it('excludes broken Microsoft Ava when selecting best English voice in Edge environment', () => {
    const mockVoices = [
      createMockVoice('Microsoft Ava Online (Natural) - English (United States)'),
      createMockVoice('Microsoft Jenny Online (Natural) - English (United States)'),
      createMockVoice('Microsoft Aria Online (Natural) - English (United States)')
    ];

    vi.stubGlobal('speechSynthesis', {
      getVoices: () => mockVoices,
      speak: vi.fn(),
      cancel: vi.fn(),
      paused: false,
      speaking: false
    });

    const bestVoice = getBestEnglishVoice('en-US');
    expect(bestVoice).not.toBeNull();
    expect(bestVoice?.name).toContain('Jenny');
    expect(bestVoice?.name).not.toContain('Ava');
  });

  it('respects American accent and picks Samantha when Samantha is the available US voice', () => {
    const samantha = createMockVoice('Samantha', 'en-US');
    const daniel = createMockVoice('Daniel', 'en-GB');

    vi.stubGlobal('speechSynthesis', {
      getVoices: () => [samantha, daniel],
      speak: vi.fn(),
      cancel: vi.fn(),
      paused: false,
      speaking: false
    });

    const bestVoice = getBestEnglishVoice('en-US');
    expect(bestVoice).not.toBeNull();
    expect(bestVoice?.name).toBe('Samantha');

    const ukVoice = getBestEnglishVoice('en-GB');
    expect(ukVoice?.name).toBe('Daniel');
  });

  it('deduplicates voices with identical base name and keeps the enhanced quality version', () => {
    const samanthaCompact = createMockVoice('Samantha', 'en-US');
    const samanthaEnhanced = createMockVoice('Samantha (Enhanced)', 'en-US');
    const danielCompact = createMockVoice('Daniel', 'en-GB');
    const danielEnhanced = createMockVoice('Daniel (Enhanced)', 'en-GB');

    vi.stubGlobal('speechSynthesis', {
      getVoices: () => [samanthaCompact, samanthaEnhanced, danielCompact, danielEnhanced],
      speak: vi.fn(),
      cancel: vi.fn(),
      paused: false,
      speaking: false
    });

    const friendly = getFriendlyEnglishVoices();
    expect(friendly.length).toBe(2);
    expect(friendly.some(v => v.name === 'Samantha (Enhanced)')).toBe(true);
    expect(friendly.some(v => v.name === 'Daniel (Enhanced)')).toBe(true);
  });

  it('keeps Google US English (Studio AI) over Daniel when Google voice is present', () => {
    const googleUS = createMockVoice('Google US English', 'en-US');
    const samantha = createMockVoice('Samantha', 'en-US');
    const daniel = createMockVoice('Daniel', 'en-GB');

    vi.stubGlobal('speechSynthesis', {
      getVoices: () => [googleUS, samantha, daniel],
      speak: vi.fn(),
      cancel: vi.fn(),
      paused: false,
      speaking: false
    });

    const bestVoice = getBestEnglishVoice('en-US');
    expect(bestVoice).not.toBeNull();
    expect(bestVoice?.name).toBe('Google US English');
  });

  it('detects low-quality voice environment (e.g. Firefox on Linux/Windows) and provides recommendation tip', () => {
    const legacyVoices = [
      createMockVoice('Microsoft David Desktop - English (United States)', 'en-US', { localService: true })
    ];

    vi.stubGlobal('speechSynthesis', {
      getVoices: () => legacyVoices,
      speak: vi.fn(),
      cancel: vi.fn(),
      paused: false,
      speaking: false
    });

    const qualityInfo = getBrowserVoiceQualityInfo();
    expect(qualityInfo.isLowQuality).toBe(true);
    expect(qualityInfo.hasNeuralVoices).toBe(false);
    expect(qualityInfo.tip).toContain('recommend Google Chrome');
    expect(qualityInfo.tip).toContain('Microsoft Edge');
  });

  it('detects studio neural voice availability in Edge / Chrome', () => {
    const neuralVoices = [
      createMockVoice('Microsoft Jenny Online (Natural) - English (United States)', 'en-US')
    ];

    vi.stubGlobal('speechSynthesis', {
      getVoices: () => neuralVoices,
      speak: vi.fn(),
      cancel: vi.fn(),
      paused: false,
      speaking: false
    });

    const qualityInfo = getBrowserVoiceQualityInfo();
    expect(qualityInfo.isLowQuality).toBe(false);
    expect(qualityInfo.hasNeuralVoices).toBe(true);
  });

  it('clears stored voice if user previously had broken Ava saved in localStorage', () => {
    localStorage.setItem('basicenglish_voice_uri', 'uri-microsoft-ava-online-(natural)');
    
    const mockVoices = [
      createMockVoice('Microsoft Ava Online (Natural) - English (United States)'),
      createMockVoice('Microsoft Jenny Online (Natural) - English (United States)')
    ];

    vi.stubGlobal('speechSynthesis', {
      getVoices: () => mockVoices,
      speak: vi.fn(),
      cancel: vi.fn(),
      paused: false,
      speaking: false
    });

    const best = getBestEnglishVoice('en-US');
    expect(best?.name).toContain('Jenny');
  });

  it('automatically falls back to system voice if preferred voice triggers an error during speak', () => {
    const brokenVoice = createMockVoice('Buggy Online Voice', 'en-US');
    const localVoice = createMockVoice('System Default Voice', 'en-US', { localService: true, isDefault: true });

    let speakCallCount = 0;
    const speakMock = vi.fn().mockImplementation((utterance: SpeechSynthesisUtterance) => {
      speakCallCount++;
      if (speakCallCount === 1) {
        // First attempt with buggy voice errors out
        setTimeout(() => {
          if (utterance.onerror) {
            utterance.onerror({ error: 'synthesis-failed' } as SpeechSynthesisErrorEvent);
          }
        }, 10);
      } else {
        // Fallback succeeds
        setTimeout(() => {
          if (utterance.onend) {
            utterance.onend({} as SpeechSynthesisEvent);
          }
        }, 10);
      }
    });

    vi.stubGlobal('speechSynthesis', {
      getVoices: () => [brokenVoice, localVoice],
      speak: speakMock,
      cancel: vi.fn(),
      paused: false,
      speaking: false
    });

    const onEndSpy = vi.fn();

    speakEnglishText('Hello world', { voiceURI: brokenVoice.voiceURI }, onEndSpy);

    // After async retries
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(speakCallCount).toBe(2); // Initial attempt + fallback retry
        expect(onEndSpy).toHaveBeenCalled();
        resolve();
      }, 50);
    });
  });
});
