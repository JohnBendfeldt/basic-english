import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProgressService } from '../services/progressService';
import { QuizSession } from '../types/progress';

const sb = vi.hoisted(() => ({ client: null as null | Record<string, unknown> }));
vi.mock('../services/supabaseClient', () => ({
  get supabase() {
    return sb.client;
  },
}));

type Result = { data?: unknown; error?: unknown };
const makeChain = (result: Result) => {
  const c: Record<string, unknown> = {};
  for (const m of ['select', 'eq', 'gte', 'order', 'limit']) c[m] = vi.fn(() => c);
  c.upsert = vi.fn(() => c);
  c.insert = vi.fn(() => c);
  c.single = vi.fn(() => Promise.resolve(result));
  c.maybeSingle = vi.fn(() => Promise.resolve(result));
  c.then = (res: (v: Result) => unknown, rej: (e: unknown) => unknown) =>
    Promise.resolve(result).then(res, rej);
  return c;
};

const mockSignedIn = (
  tables: Record<string, Result | Result[]>,
  user: { id: string } | null = { id: 'user-123' }
) => {
  const chains: Record<string, ReturnType<typeof makeChain>[]> = {};
  const from = vi.fn((table: string) => {
    const cfg = tables[table] ?? { data: null, error: null };
    const results = Array.isArray(cfg) ? cfg : [cfg];
    const idx = Math.min((chains[table] ?? []).length, results.length - 1);
    const created = makeChain(results[idx]);
    (chains[table] ??= []).push(created);
    return created;
  });
  sb.client = {
    auth: { getUser: vi.fn(() => Promise.resolve({ data: { user } })) },
    from,
  };
  return { from, chains };
};

describe('ProgressService - Storage Hardening, Legacy Migration & Signed-In Cloud Sync', () => {
  beforeEach(() => {
    sb.client = null;
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Guest Mode Storage Hardening & Legacy Migration', () => {
    it('migrates legacy russian_quiz_sessions and russian_word_progress keys to english_* keys', async () => {
      const legacySessions = [
        { id: 's1', userId: 'guest_user', category: 'alphabet', score: 8, totalQuestions: 10, percentage: 80, completedAt: '2026-01-01T00:00:00Z' },
      ];
      const legacyWords = {
        'alphabet-A': {
          userId: 'guest_user',
          category: 'alphabet',
          wordId: 'alphabet-A',
          prompt: 'A',
          answer: 'Apple',
          timesCorrect: 3,
          timesIncorrect: 0,
          lastTestedAt: '2026-01-01T00:00:00Z',
          masteryLevel: 3,
        },
      };
      localStorage.setItem('russian_quiz_sessions', JSON.stringify(legacySessions));
      localStorage.setItem('russian_word_progress', JSON.stringify(legacyWords));

      const stats = await ProgressService.getUserStats();
      expect(stats.totalQuizzesTaken).toBe(1);
      expect(stats.wordsMasteredCount).toBe(1);
      expect(localStorage.getItem('english_quiz_sessions')).not.toBeNull();
      expect(localStorage.getItem('english_word_progress')).not.toBeNull();
      expect(localStorage.getItem('russian_quiz_sessions')).toBeNull();
      expect(localStorage.getItem('russian_word_progress')).toBeNull();
    });

    it('strips prototype pollution keys and survives corrupted or wrong-shaped JSON in localStorage', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      localStorage.setItem('english_quiz_sessions', '{"not":"an array"}');
      localStorage.setItem('english_word_progress', '["array_instead_of_object"]');
      let stats = await ProgressService.getUserStats();
      expect(stats.totalQuizzesTaken).toBe(0);
      expect(stats.wordsLearningCount).toBe(0);

      localStorage.setItem('english_quiz_sessions', '{corrupted json');
      localStorage.setItem('english_word_progress', '{corrupted json');
      stats = await ProgressService.getUserStats();
      expect(stats.totalQuizzesTaken).toBe(0);

      // Prototype-pollution payload keys must be ignored
      localStorage.setItem(
        'english_word_progress',
        '{"__proto__":{"masteryLevel":5},"constructor":{"masteryLevel":5},"valid-word":{"wordId":"valid-word","category":"words","prompt":"Water","answer":"Water","timesCorrect":1,"timesIncorrect":0,"lastTestedAt":"t","masteryLevel":1}}'
      );
      const mastered = await ProgressService.getMasteredWordIds();
      expect(mastered.size).toBe(0);
      expect((await ProgressService.getUserStats()).wordsLearningCount).toBe(1);
    });

    it('caps stored local quiz sessions at 100 and handles 0-question edge case', async () => {
      const zero = await ProgressService.recordQuizSession({ category: 'alphabet', score: 0, totalQuestions: 0 });
      expect(zero.percentage).toBe(0);

      for (let i = 0; i < 105; i++) {
        await ProgressService.recordQuizSession({ category: `cat-${i}`, score: 5, totalQuestions: 10 });
      }
      const stored = JSON.parse(localStorage.getItem('english_quiz_sessions')!) as QuizSession[];
      expect(stored).toHaveLength(100);
      expect(stored[0].category).toBe('cat-104');
    });
  });

  describe('Signed-In Supabase Mode', () => {
    it('upserts word progress with clamped mastery and retries without target column if schema lacks it', async () => {
      const savedRow = {
        id: 'row-1',
        user_id: 'user-123',
        category: 'words',
        word_id: 'words-water',
        prompt: 'Water',
        answer: 'Liquid',
        times_correct: 3,
        times_incorrect: 1,
        last_tested_at: '2026-11-13T00:00:00Z',
        mastery_level: 3,
      };

      const { chains } = mockSignedIn({
        word_progress: [
          // 1st call: select existing
          { data: { ...savedRow, times_correct: 2, mastery_level: 3 } },
          // 2nd call: upsert fails due to missing 'target' column on older DB
          { data: null, error: { message: "Could not find the 'target' column of 'word_progress'" } },
          // 3rd call: retry without target succeeds
          { data: savedRow, error: null },
        ],
      });

      const res = await ProgressService.recordWordAttempt({
        category: 'words',
        wordId: 'words-water',
        prompt: 'Water',
        answer: 'Liquid',
        target: 'Water',
        isCorrect: true,
      });

      expect(chains.word_progress).toHaveLength(3);
      expect(res.userId).toBe('user-123');
      expect(res.masteryLevel).toBe(3);
      expect(res.timesCorrect).toBe(3);
    });

    it('falls back to localStorage when Supabase word upsert returns an error or throws', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockSignedIn({
        word_progress: [
          { data: null },
          { data: null, error: { message: 'RLS policy violation' } },
        ],
      });

      const res1 = await ProgressService.recordWordAttempt({
        category: 'words',
        wordId: 'words-bread',
        prompt: 'Bread',
        answer: 'Food',
        isCorrect: true,
      });
      expect(res1.userId).toBe('guest_user');

      sb.client = {
        auth: { getUser: () => Promise.reject(new Error('network offline')) },
        from: vi.fn(),
      };
      const res2 = await ProgressService.recordWordAttempt({
        category: 'words',
        wordId: 'words-bread',
        prompt: 'Bread',
        answer: 'Food',
        isCorrect: false,
      });
      expect(res2.userId).toBe('guest_user');
      expect(res2.masteryLevel).toBe(0);
    });

    it('merges local and cloud mastered word IDs and survives cloud errors', async () => {
      localStorage.setItem(
        'english_word_progress',
        JSON.stringify({
          'local-mastered': { wordId: 'local-mastered', masteryLevel: 3 },
          'local-learning': { wordId: 'local-learning', masteryLevel: 2 },
        })
      );
      mockSignedIn({
        word_progress: { data: [{ word_id: 'cloud-mastered' }] },
      });

      const ids = await ProgressService.getMasteredWordIds();
      expect([...ids].sort()).toEqual(['cloud-mastered', 'local-mastered']);

      vi.spyOn(console, 'warn').mockImplementation(() => {});
      sb.client = {
        auth: { getUser: () => Promise.reject(new Error('offline')) },
        from: vi.fn(),
      };
      const fallbackIds = await ProgressService.getMasteredWordIds();
      expect([...fallbackIds]).toEqual(['local-mastered']);
    });

    it('records quiz sessions in Supabase and falls back locally on failure', async () => {
      const { chains } = mockSignedIn({
        quiz_sessions: {
          data: {
            id: 'cloud-s1',
            user_id: 'user-123',
            category: 'phrases',
            score: 9,
            total_questions: 10,
            percentage: '90.00',
            completed_at: '2026-11-13T00:00:00Z',
          },
          error: null,
        },
      });

      const session = await ProgressService.recordQuizSession({
        category: 'phrases',
        score: 9,
        totalQuestions: 10,
      });
      expect(session.id).toBe('cloud-s1');
      expect(session.percentage).toBe(90);
      expect(chains.quiz_sessions[0].insert).toHaveBeenCalledTimes(1);

      vi.spyOn(console, 'warn').mockImplementation(() => {});
      sb.client = {
        auth: { getUser: () => Promise.reject(new Error('offline')) },
        from: vi.fn(),
      };
      const localFallback = await ProgressService.recordQuizSession({
        category: 'phrases',
        score: 7,
        totalQuestions: 10,
      });
      expect(localFallback.userId).toBe('guest_user');
      expect(localFallback.percentage).toBe(70);
    });

    it('fetches and aggregates cloud user stats and falls back locally on network error', async () => {
      mockSignedIn({
        quiz_sessions: {
          data: [
            { id: 's1', user_id: 'user-123', category: 'mixed', score: 8, total_questions: 10, percentage: null, completed_at: '2026-11-13T00:00:00Z' },
          ],
        },
        word_progress: {
          data: [
            { id: 'w1', user_id: 'user-123', category: 'words', word_id: 'water', prompt: 'Water', answer: 'Drink', times_correct: 3, times_incorrect: 0, last_tested_at: 't', mastery_level: 3 },
            { id: 'w2', user_id: 'user-123', category: 'words', word_id: 'bread', prompt: 'Bread', answer: 'Food', times_correct: 0, times_incorrect: 3, last_tested_at: 't', mastery_level: 0 },
          ],
        },
      });

      const stats = await ProgressService.getUserStats();
      expect(stats.totalQuizzesTaken).toBe(1);
      expect(stats.averageScore).toBe(80);
      expect(stats.wordsMasteredCount).toBe(1);
      expect(stats.wordsLearningCount).toBe(1);
      expect(stats.wordsToReview.map((w) => w.wordId)).toEqual(['bread']);

      vi.spyOn(console, 'warn').mockImplementation(() => {});
      sb.client = {
        auth: { getUser: () => Promise.reject(new Error('offline')) },
        from: vi.fn(),
      };
      const fallbackStats = await ProgressService.getUserStats();
      expect(fallbackStats.totalQuizzesTaken).toBe(0);
    });
  });

  describe('syncGuestDataToCloud', () => {
    const seedGuestData = () => {
      localStorage.setItem(
        'english_word_progress',
        JSON.stringify({
          'words-coffee': {
            wordId: 'words-coffee',
            category: 'words',
            prompt: 'Coffee',
            answer: 'Drink',
            timesCorrect: 2,
            timesIncorrect: 1,
            lastTestedAt: '2026-11-13T00:00:00Z',
            masteryLevel: 2,
          },
        })
      );
      const sessions = Array.from({ length: 25 }, (_, idx) => ({
        id: `s-${idx}`,
        userId: 'guest_user',
        category: 'words',
        score: 8,
        totalQuestions: 10,
        percentage: 80,
        completedAt: '2026-11-13T00:00:00Z',
      }));
      localStorage.setItem('english_quiz_sessions', JSON.stringify(sessions));
    };

    it('skips cleanly when unconfigured, signed out, or local storage is empty', async () => {
      seedGuestData();
      await ProgressService.syncGuestDataToCloud(); // sb.client is null

      const signedOut = mockSignedIn({}, null);
      await ProgressService.syncGuestDataToCloud();
      expect(signedOut.from).not.toHaveBeenCalled();

      localStorage.clear();
      const emptyLocal = mockSignedIn({});
      await ProgressService.syncGuestDataToCloud();
      expect(emptyLocal.from).not.toHaveBeenCalled();
    });

    it('uploads words and up to 20 sessions, clears localStorage on success, and deduplicates concurrent sync calls', async () => {
      vi.spyOn(console, 'info').mockImplementation(() => {});
      seedGuestData();
      const { chains } = mockSignedIn({
        word_progress: { data: null, error: null },
        quiz_sessions: { data: null, error: null },
      });

      // Fire two concurrent syncs; syncInFlight guard must prevent duplicate uploads
      await Promise.all([
        ProgressService.syncGuestDataToCloud(),
        ProgressService.syncGuestDataToCloud(),
      ]);

      expect(chains.word_progress).toHaveLength(1);
      expect(chains.quiz_sessions).toHaveLength(1);
      const sessionPayload = (chains.quiz_sessions[0].insert as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(sessionPayload).toHaveLength(20);
      expect(localStorage.getItem('english_word_progress')).toBeNull();
      expect(localStorage.getItem('english_quiz_sessions')).toBeNull();
    });

    it('retains localStorage caches when Supabase returns an upload error or throws', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      seedGuestData();
      mockSignedIn({
        word_progress: { data: null, error: { message: 'db error' } },
        quiz_sessions: { data: null, error: { message: 'db error' } },
      });

      await ProgressService.syncGuestDataToCloud();
      expect(localStorage.getItem('english_word_progress')).not.toBeNull();
      expect(localStorage.getItem('english_quiz_sessions')).not.toBeNull();

      sb.client = {
        auth: { getUser: () => Promise.reject(new Error('network down')) },
        from: vi.fn(),
      };
      await expect(ProgressService.syncGuestDataToCloud()).resolves.toBeUndefined();
    });
  });
});
