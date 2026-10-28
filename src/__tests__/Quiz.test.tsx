import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Quiz from '../components/Quiz';
import { ProgressService } from '../services/progressService';

// Mock Audio
window.HTMLMediaElement.prototype.play = vi.fn().mockImplementation(() => Promise.resolve());
window.HTMLMediaElement.prototype.pause = vi.fn();

const sampleData = {
  alphabet: [
    { letter: 'A', character: 'A', pronunciation: '/eɪ/', example: 'as in Apple, Ant' },
    { letter: 'B', character: 'B', pronunciation: '/biː/', example: 'as in Book, Boy' },
    { letter: 'C', character: 'C', pronunciation: '/siː/', example: 'as in Cat, Car' },
  ],
  basicPhrases: [
    { phrase: 'Hello', meaning: 'Universal friendly greeting', pronunciation: '/həˈloʊ/' },
    { phrase: 'Thank you', meaning: 'Polite expression of gratitude', pronunciation: '/θæŋk juː/' },
  ],
  numbers: [
    { phrase: 'One', meaning: '1', pronunciation: '/wʌn/' },
  ],
  commonWords: [
    { phrase: 'Water', meaning: 'Essential clear liquid to drink', pronunciation: '/ˈwɔːtər/' },
  ],
};

describe('Quiz Component - Session Goals & Mastery Filtering', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders default session goal of 10 questions and pool indicator', async () => {
    render(<Quiz data={sampleData} />);

    // Session goal pills
    expect(screen.getByRole('button', { name: '10 Qs' })).toHaveClass('active');
    expect(screen.getByText('Question')).toBeInTheDocument();
    expect(screen.getByText('of 10')).toBeInTheDocument();

    // Mastery pool badge
    expect(screen.getByText(/Mastered:/i)).toBeInTheDocument();
  });

  it('allows user to change the session goal to 5 or 20 questions', async () => {
    render(<Quiz data={sampleData} />);

    const fivePill = screen.getByRole('button', { name: '5 Qs' });
    fireEvent.click(fivePill);

    expect(fivePill).toHaveClass('active');
    expect(screen.getByText('of 5')).toBeInTheDocument();
    expect(localStorage.getItem('english_quiz_goal')).toBe('5');

    const twentyPill = screen.getByRole('button', { name: '20 Qs' });
    fireEvent.click(twentyPill);

    expect(twentyPill).toHaveClass('active');
    expect(screen.getByText('of 20')).toBeInTheDocument();
    expect(localStorage.getItem('english_quiz_goal')).toBe('20');
  });

  it('excludes mastered words (masteryLevel >= 5) from active questions', async () => {
    // Mock getMasteredWordIds to return 'alphabet-A' as already mastered
    vi.spyOn(ProgressService, 'getMasteredWordIds').mockResolvedValue(new Set(['alphabet-A']));

    render(<Quiz data={{
      alphabet: [
        { letter: 'A', character: 'A', pronunciation: '/eɪ/', example: 'as in Apple' },
        { letter: 'B', character: 'B', pronunciation: '/biː/', example: 'as in Book' }
      ]
    }} />);

    // Wait for mastered words to load
    await waitFor(() => {
      expect(screen.getByText(/Mastered:/i)).toBeInTheDocument();
    });

    // The prompt should be B, NOT the mastered A
    const prompt = document.querySelector('.quiz-prompt');
    expect(prompt?.textContent).toContain('B');
    expect(prompt?.textContent).not.toContain('A');
  });

  it('finishes session and shows Done recap card when goal questions answered', async () => {
    const recordQuizSpy = vi.spyOn(ProgressService, 'recordQuizSession').mockResolvedValue({
      id: 'session_1',
      userId: 'guest',
      category: 'mixed',
      score: 5,
      totalQuestions: 5,
      percentage: 100,
      completedAt: new Date().toISOString()
    });

    render(<Quiz data={{
      alphabet: [{ letter: 'A', character: 'A', pronunciation: '/eɪ/', example: 'as in Apple' }]
    }} />);

    // Switch goal to 5
    const fivePill = screen.getByRole('button', { name: '5 Qs' });
    fireEvent.click(fivePill);

    // Answer questions 1 through 5
    for (let i = 1; i <= 5; i++) {
      const input = screen.getByPlaceholderText(/Your answer here/i);
      fireEvent.change(input, { target: { value: 'apple' } });
      fireEvent.click(screen.getByRole('button', { name: 'Check Answer' }));

      if (i < 5) {
        const nextBtn = screen.getByRole('button', { name: new RegExp(`Next Question \\(${i + 1}/5\\)`, 'i') });
        fireEvent.click(nextBtn);
      } else {
        const finishBtn = screen.getByRole('button', { name: /Complete Quiz & View Results/i });
        fireEvent.click(finishBtn);
      }
    }

    // Now Done screen should be rendered!
    await waitFor(() => {
      expect(screen.getByText('Quiz Session Complete!')).toBeInTheDocument();
      expect(screen.getByText(/Outstanding!/i)).toBeInTheDocument();
      expect(screen.getByText(/100%/i)).toBeInTheDocument();
      expect(screen.getByText(/5 \/ 5 correct/i)).toBeInTheDocument();
      expect(screen.getByText(/Logged as 1 completed quiz in your learning progress/i)).toBeInTheDocument();
    });

    expect(recordQuizSpy).toHaveBeenCalledWith({
      category: 'mixed',
      score: 5,
      totalQuestions: 5
    });

    // Test restarting with button
    const restartBtn = screen.getByRole('button', { name: /Start Next Quiz/i });
    fireEvent.click(restartBtn);

    // Active quiz returns!
    expect(screen.getByText('Test Your Knowledge')).toBeInTheDocument();
    expect(screen.getByText('of 5')).toBeInTheDocument();
  });

  it('accepts conversational synonyms and contractions for English phrases (e.g., wheres the restroom for where is the bathroom)', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99); // Audio mode
    render(<Quiz data={{
      basicPhrases: [
        { phrase: 'Where is the bathroom', meaning: 'Asking politely for the restroom', pronunciation: '/wɛər ɪz ðə ˈbɑːθruːm/' }
      ]
    }} />);

    // Wait for question to render
    const input = await screen.findByRole('textbox');
    // User types contraction + synonym "wheres the restroom"
    fireEvent.change(input, { target: { value: 'wheres the restroom' } });
    fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));

    expect(screen.getByText(/Correct!/i)).toBeInTheDocument();
  });

  it('renders the fluid bottom feedback drawer on answer check', async () => {
    render(<Quiz data={{
      alphabet: [{ letter: 'A', character: 'A', pronunciation: '/eɪ/', example: 'as in Apple' }]
    }} />);

    const input = await screen.findByPlaceholderText(/Your answer here/i);
    fireEvent.change(input, { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check Answer' }));

    // Bottom feedback sheet should be present with Not quite
    const drawer = document.querySelector('.quiz-feedback-drawer');
    expect(drawer).toBeInTheDocument();
    expect(drawer).toHaveClass('feedback-incorrect');
    expect(screen.getByText('Not quite')).toBeInTheDocument();
    expect(screen.getByText(/The correct answer is:/i)).toBeInTheDocument();
  });

  it('renders dialogue cloze mode with Speaker A and Speaker B bubbles for English phrases and accepts missing word', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01);
    render(<Quiz data={{
      basicPhrases: [
        { phrase: 'You are welcome', meaning: 'Standard polite reply to thank you', pronunciation: '/jʊər ˈwɛlkəm/' }
      ]
    }} />);

    await waitFor(() => {
      expect(screen.getByText(/Complete the Dialogue/i)).toBeInTheDocument();
    });

    // Check Speaker A and Speaker B bubbles
    expect(screen.getByText(/Thank you so much/i)).toBeInTheDocument();
    expect(screen.getByText(/You are/i)).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/Your answer here/i);
    fireEvent.change(input, { target: { value: 'welcome' } });
    fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));

    expect(screen.getByText(/Correct!/i)).toBeInTheDocument();
  });

  it('renders audio dictation mode with Play Audio and Slow buttons for English phrases', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99); // Picks Audio Dictation
    render(<Quiz data={{
      basicPhrases: [
        { phrase: 'Good morning', meaning: 'Polite greeting used from dawn until 12:00 PM', pronunciation: '/ɡʊd ˈmɔːrnɪŋ/' }
      ]
    }} />);

    await waitFor(() => {
      expect(screen.getByText(/Listen & Type/i)).toBeInTheDocument();
    });

    // Audio controller buttons
    expect(screen.getByRole('button', { name: /^Play audio$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Play audio slowly/i })).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/Your answer here/i);
    fireEvent.change(input, { target: { value: 'good morning' } });
    fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));

    expect(screen.getByText(/Correct!/i)).toBeInTheDocument();
  });

  it('accepts cafe order variations like "can i have a coffee please" and "coffee"', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99); // Audio mode
    render(<Quiz data={{
      basicPhrases: [
        { phrase: 'I would like a coffee, please', meaning: 'Ordering a beverage politely at a cafe', pronunciation: '/aɪ wʊd laɪk ə ˈkɒfi pliːz/' }
      ]
    }} />);

    const input = await screen.findByRole('textbox');
    fireEvent.change(input, { target: { value: 'can i have a coffee please' } });
    fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));

    expect(screen.getByText(/Correct!/i)).toBeInTheDocument();
  });

  it('renders English number questions and accepts digit and word spellings', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99); // Digits to Words mode
    render(<Quiz data={{
      numbers: [
        { phrase: 'Twelve', meaning: '12 (a dozen)', pronunciation: '/twɛlv/' }
      ]
    }} />);

    await waitFor(() => {
      expect(screen.getByText(/Number Spelling/i)).toBeInTheDocument();
    });

    expect(screen.getByText('12')).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/Your answer here/i);
    fireEvent.change(input, { target: { value: 'twelve' } });
    fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));

    expect(screen.getByText(/Correct!/i)).toBeInTheDocument();
  });

  it('does not give away the answer in alphabet hints', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01); // Primary direction
    render(<Quiz data={{
      alphabet: [{ letter: 'O', character: 'O', pronunciation: '/oʊ/ & /ɒ/', example: 'open, orange' }]
    }} />);

    await waitFor(() => {
      expect(screen.getByText('O')).toBeInTheDocument();
    });

    // Should not contain (O) or (open) in the hint
    expect(screen.queryByText(/Type letter \(O\)/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\(open\)/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Type letter or example word/i)).toBeInTheDocument();
  });

  it('properly formats time questions without leaking the digit answer in prompt instructions', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01); // Primary direction
    render(<Quiz data={{
      numbers: [{ phrase: 'Half past two', meaning: '2:30 (30 minutes past 2)', pronunciation: '/hæf pæst tuː/' }]
    }} />);

    await waitFor(() => {
      expect(screen.getByText('Half past two')).toBeInTheDocument();
    });

    // Should not leak "e.g. 2:30" or "e.g. 2" in the prompt
    expect(screen.queryByText(/e\.g\. 2:30/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/e\.g\. 2\b/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Type this time in digital format \(e\.g\. 12:00\):/i)).toBeInTheDocument();

    // Verify 2:30 is accepted
    const input = screen.getByPlaceholderText(/Your answer here/i);
    fireEvent.change(input, { target: { value: '2:30' } });
    fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));

    expect(screen.getByText(/Correct!/i)).toBeInTheDocument();
  });
});
