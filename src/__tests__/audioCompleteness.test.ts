import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import englishData from '../data/englishData';
import { AUDIO_VOICE, AUDIO_CATEGORY_MAP, getLocalAudioUrl } from '../data/audioManifest';

const PUBLIC_DIR = path.resolve(__dirname, '../../public');

describe('Basic English Studio Audio Completeness & Lookup Normalization', () => {
  it('uses en-US-JennyNeural matching basic-language-school', () => {
    expect(AUDIO_VOICE).toBe('en-US-JennyNeural');
  });

  it('resolves every curriculum item and phonics quiz prompt to an existing >1000-byte MP3 on disk', () => {
    const unresolved: string[] = [];

    const verify = (text: string, category?: string) => {
      const url = getLocalAudioUrl(text, category);
      if (!url) {
        unresolved.push(`${category || 'auto'}:${text} -> null`);
        return;
      }
      const diskPath = path.join(PUBLIC_DIR, url.replace(/^\//, ''));
      if (!fs.existsSync(diskPath) || fs.statSync(diskPath).size <= 1000) {
        unresolved.push(`${category || 'auto'}:${text} -> missing or small (${url})`);
      }
    };

    for (const item of englishData.alphabet) {
      verify(item.letter.toLowerCase(), 'alphabet');
      const exampleWord = item.word || item.example;
      if (exampleWord) {
        verify(exampleWord, 'examples');
        verify(`${item.letter.toLowerCase()}. as in ${exampleWord.toLowerCase()}`, 'quiz');
        verify(`${exampleWord.toLowerCase()}. letter ${item.letter.toLowerCase()}.`, 'quiz');
      }
    }

    for (const item of englishData.basicPhrases) {
      if (item.phrase) verify(item.phrase, 'basicPhrases');
    }
    for (const item of englishData.numbers) {
      if (item.phrase) verify(item.phrase, 'numbers');
    }
    for (const item of englishData.commonWords) {
      if (item.phrase) verify(item.phrase, 'commonWords');
    }

    for (const url of Object.values(AUDIO_CATEGORY_MAP.quiz || {})) {
      const diskPath = path.join(PUBLIC_DIR, url.replace(/^\//, ''));
      if (!fs.existsSync(diskPath) || fs.statSync(diskPath).size <= 1000) {
        unresolved.push(`quiz:${url} -> missing or small`);
      }
    }

    expect(unresolved).toEqual([]);
  });

  it('handles curly apostrophes, parenthetical annotations, category aliases, and slash variants', () => {
    expect(getLocalAudioUrl('Two o\u2019clock', 'numbers')).toBe('/audio/numbers/two_oclock.mp3');
    expect(getLocalAudioUrl('Hello (formal)', 'basicPhrases')).toBe('/audio/phrases/hello.mp3');
    expect(getLocalAudioUrl('Water / H2O', 'commonWords')).toBe('/audio/words/water.mp3');
  });
});
