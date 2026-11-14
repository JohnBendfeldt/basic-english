import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import englishData from '../data/englishData';
import { AUDIO_TEXT_MAP, AUDIO_CATEGORY_MAP, AUDIO_VOICE, getLocalAudioUrl } from '../data/audioManifest';

const PUBLIC_DIR = path.resolve(__dirname, '../../public');

describe('English Curriculum Integrity & Pre-Rendered Neural Audio Audit', () => {
  it('defines all 26 English alphabet letters A-Z in order with complete metadata', () => {
    expect(englishData.alphabet).toHaveLength(26);
    const letters = englishData.alphabet.map((item) => item.letter);
    expect(letters.join('')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

    for (const item of englishData.alphabet) {
      expect(item.pronunciation.trim().length).toBeGreaterThan(0);
      expect(item.example.trim().length).toBeGreaterThan(0);
      expect(item.word?.trim().length).toBeGreaterThan(0);
      expect(item.meaning?.trim().length).toBeGreaterThan(0);
      expect(item.icon?.trim().length).toBeGreaterThan(0);
    }
  });

  it.each([
    ['basicPhrases', englishData.basicPhrases, 20],
    ['numbers', englishData.numbers, 30],
    ['commonWords', englishData.commonWords, 30],
  ] as const)('%s has at least %i unique, well-formed entries', (_sectionName, items, minCount) => {
    expect(items.length).toBeGreaterThanOrEqual(minCount);
    const seen = new Set<string>();

    for (const item of items) {
      expect(item.phrase?.trim().length).toBeGreaterThan(0);
      expect(item.meaning?.trim().length).toBeGreaterThan(0);
      expect(item.pronunciation.trim().length).toBeGreaterThan(0);
      const normalized = item.phrase!.toLowerCase().trim();
      expect(seen.has(normalized)).toBe(false);
      seen.add(normalized);
    }
  });

  it('verifies every MP3 referenced in AUDIO_TEXT_MAP and AUDIO_CATEGORY_MAP exists on disk and is non-empty', () => {
    expect(AUDIO_VOICE).toBe('en-US-JennyNeural');

    const allAudioUrls = new Set<string>(Object.values(AUDIO_TEXT_MAP));
    for (const catEntries of Object.values(AUDIO_CATEGORY_MAP)) {
      for (const url of Object.values(catEntries)) {
        allAudioUrls.add(url);
      }
    }

    expect(allAudioUrls.size).toBeGreaterThanOrEqual(200);

    const missingOrEmpty: string[] = [];
    for (const audioUrl of allAudioUrls) {
      expect(audioUrl.startsWith('/audio/')).toBe(true);
      expect(audioUrl.endsWith('.mp3')).toBe(true);
      expect(audioUrl.includes('..')).toBe(false);

      const diskPath = path.join(PUBLIC_DIR, audioUrl.replace(/^\//, ''));
      if (!fs.existsSync(diskPath) || fs.statSync(diskPath).size < 100) {
        missingOrEmpty.push(audioUrl);
      }
    }

    expect(missingOrEmpty).toEqual([]);
  });

  it('resolves every single curriculum item in englishData to an existing on-disk MP3 via getLocalAudioUrl', () => {
    const unresolved: string[] = [];

    const check = (text: string, category: string) => {
      const url = getLocalAudioUrl(text, category);
      if (!url) {
        unresolved.push(`${category}:${text} -> null`);
        return;
      }
      const diskPath = path.join(PUBLIC_DIR, url.replace(/^\//, ''));
      if (!fs.existsSync(diskPath)) {
        unresolved.push(`${category}:${text} -> missing ${url}`);
      }
    };

    for (const item of englishData.alphabet) {
      check(item.letter.toLowerCase(), 'alphabet');
      if (item.word) {
        check(item.word, 'examples');
        // Quiz spoken prompt patterns
        check(`${item.letter.toLowerCase()}. as in ${item.word.toLowerCase()}`, 'quiz');
        check(`${item.word.toLowerCase()}. letter ${item.letter.toLowerCase()}.`, 'quiz');
      }
    }

    for (const item of englishData.basicPhrases) {
      if (item.phrase) check(item.phrase, 'phrases');
    }
    for (const item of englishData.numbers) {
      if (item.phrase) check(item.phrase, 'numbers');
    }
    for (const item of englishData.commonWords) {
      if (item.phrase) check(item.phrase, 'words');
    }

    expect(unresolved).toEqual([]);
  });

  it('exercises all lookup branches of getLocalAudioUrl (empty, direct, category-specific, cross-category slug, and miss)', () => {
    expect(getLocalAudioUrl('')).toBeNull();
    expect(getLocalAudioUrl('   ')).toBeNull();

    // Direct lookup with punctuation/ellipsis stripping
    expect(getLocalAudioUrl('How are you?')).toBe('/audio/phrases/how_are_you.mp3');
    expect(getLocalAudioUrl('My name is...')).toBe('/audio/phrases/my_name_is.mp3');
    expect(getLocalAudioUrl("Two o'clock", 'numbers')).toBe('/audio/numbers/two_oclock.mp3');

    // Category-specific slug lookup where direct map has spaces or hyphens
    expect(getLocalAudioUrl('good_morning', 'phrases')).toBe('/audio/phrases/good_morning.mp3');
    expect(getLocalAudioUrl('x_ray', 'examples')).toBe('/audio/examples/x_ray.mp3');

    // Fallback search across all categories by slug when no category or unknown category is passed
    expect(getLocalAudioUrl('good_morning', 'nonexistent_category')).toBe('/audio/phrases/good_morning.mp3');
    expect(getLocalAudioUrl('a_as_in_apple')).toBe('/audio/quiz/a_as_in_apple.mp3');

    // Unknown phrase returns null cleanly
    expect(getLocalAudioUrl('supercalifragilisticexpialidocious', 'words')).toBeNull();
  });
});
