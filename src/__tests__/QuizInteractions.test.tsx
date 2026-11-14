import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Quiz from '../components/Quiz';
import { ProgressService } from '../services/progressService';
import * as speechMod from '../utils/speech';

describe('Quiz Deep Interactions - Dialogues, Audio Speed Controls, Enter Key, Mastery & Missed Recap', () => {
  beforeEach(() => {
    localStorage.clear();
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = vi.fn();
    vi.spyOn(speechMod, 'initVoices').mockResolvedValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('plays normal and 0.7x slow audio in Quiz audio toolbar and celebrates Word Mastered (3/3)', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const speakSpy = vi.spyOn(speechMod, 'speak').mockImplementation((_t, _l, _id, onEnd) => {
      if (onEnd) onEnd();
    });
    vi.spyOn(ProgressService, 'recordWordAttempt').mockResolvedValue({
      userId: 'guest_user',
      category: 'commonWords',
      wordId: 'commonWords-Water',
      prompt: 'Water',
      answer: 'Clear liquid',
      timesCorrect: 3,
      timesIncorrect: 0,
      lastTestedAt: new Date().toISOString(),
      masteryLevel: 3,
    });

    render(
      <Quiz
        data={{
          commonWords: [{ phrase: 'Water', meaning: 'Clear liquid', pronunciation: '/ˈwɔːtər/' }],
        }}
      />
    );

    const playBtn = await screen.findByRole('button', { name: 'Play audio' });
    const slowBtn = screen.getByRole('button', { name: 'Play audio slowly at 0.7x speed' });
    fireEvent.click(playBtn);
    fireEvent.click(slowBtn);
    expect(speakSpy).toHaveBeenCalledTimes(2);
    expect(speakSpy.mock.calls[1][5]).toMatchObject({ rate: 0.72 });

    // Answer correctly via Enter key and verify Word Mastered banner
    const input = screen.getByPlaceholderText('Your answer here...') as HTMLInputElement;
    // Determine expected answer depending on selected direction
    const promptText = document.querySelector('.quiz-prompt-text')?.textContent || '';
    const answerToType = promptText.includes('Water') ? 'Water' : 'Water';

    fireEvent.change(input, { target: { value: answerToType } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(await screen.findByText('Correct!')).toBeInTheDocument();
    expect(screen.getByText(/Word Mastered \(3\/3\)!/i)).toBeInTheDocument();
  });

  it('auto-plays audio once for listening questions and supports "I was right" override persistence', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01);
    const speakSpy = vi.spyOn(speechMod, 'speak').mockImplementation((_t, _l, _id, onEnd) => {
      if (onEnd) onEnd();
    });

    render(
      <Quiz
        data={{
          commonWords: [{ phrase: 'Water', meaning: 'Clear liquid', pronunciation: '/ˈwɔːtər/' }],
        }}
      />
    );

    await waitFor(() => {
      expect(speakSpy).toHaveBeenCalledWith(
        'Water',
        'en-US',
        'quiz-audio-controller',
        expect.any(Function),
        expect.any(Function),
        expect.objectContaining({ rate: 0.92 })
      );
    });

    const input = screen.getByPlaceholderText('Your answer here...');
    fireEvent.change(input, { target: { value: 'wrong guess' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check Answer' }));

    expect(await screen.findByText('Not quite')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /I was right/i }));
    expect(await screen.findByText('Correct! (Overridden)')).toBeInTheDocument();

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('english_word_progress') || '{}');
      expect(saved['commonWords-Water']).toMatchObject({
        timesCorrect: 1,
        timesIncorrect: 0,
        masteryLevel: 1,
      });
    });
  });

  it('tracks missed words across a 5-question session, displays Words to Review recap, and starts a new quiz', async () => {
    localStorage.setItem('english_quiz_goal', '5');
    render(
      <Quiz
        data={{
          basicPhrases: [
            { phrase: 'Good morning', meaning: 'Morning greeting', pronunciation: '/ɡʊd ˈmɔːrnɪŋ/' },
          ],
        }}
      />
    );

    for (let i = 0; i < 5; i++) {
      const input = screen.getByPlaceholderText('Your answer here...');
      fireEvent.change(input, { target: { value: 'wrongguess' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
      expect(await screen.findByText('Not quite')).toBeInTheDocument();

      if (i < 4) {
        fireEvent.click(screen.getByRole('button', { name: /Next Question/i }));
      } else {
        fireEvent.click(screen.getByRole('button', { name: /Complete Quiz & View Results/i }));
      }
    }

    expect(await screen.findByText(/Words to Review from This Session/i)).toBeInTheDocument();
    expect(screen.getAllByText(/wrongguess/i).length).toBeGreaterThan(0);

    // Switch next quiz length on recap screen to 10 Qs and start next quiz
    const recapGroup = screen.getByRole('group', { name: 'Next quiz length' });
    const tenBtn = Array.from(recapGroup.querySelectorAll('button')).find((b) => b.textContent === '10 Qs')!;
    fireEvent.click(tenBtn);
    expect(localStorage.getItem('english_quiz_goal')).toBe('10');

    fireEvent.click(screen.getByRole('button', { name: 'Start Next Quiz (10 Qs)' }));
    await waitFor(() => expect(screen.getByText('of 10')).toBeInTheDocument());
  });
});
