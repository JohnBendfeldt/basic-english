import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Phrases from '../components/Phrases';
import { PhraseItem } from '../types/index';

// Mock Audio
window.HTMLMediaElement.prototype.play = vi.fn().mockImplementation(() => Promise.resolve());
window.HTMLMediaElement.prototype.pause = vi.fn();

const samplePhrases: PhraseItem[] = [
  { phrase: 'Good morning', meaning: 'Polite morning greeting', pronunciation: '/ɡʊd ˈmɔːrnɪŋ/' },
  { phrase: 'Thank you', meaning: 'Expression of gratitude', pronunciation: '/θæŋk juː/' },
];

describe('Phrases Component - Intuitive Reveal & Study Mode', () => {
  it('renders section title, instructional subtitle, and Reveal All toggle', () => {
    render(<Phrases data={samplePhrases} title="Basic Phrases" contentType="phrases" />);

    expect(screen.getByRole('heading', { name: 'Basic Phrases', level: 2 })).toBeInTheDocument();
    expect(
      screen.getByText(/Tap any card to reveal its meaning and pronunciation/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reveal all/i })).toBeInTheDocument();
  });

  it('renders cards initially hidden with tactile "Tap to reveal" button and no padlock or eye icons', () => {
    render(<Phrases data={samplePhrases} title="Basic Phrases" contentType="phrases" />);

    const revealButtons = screen.getAllByRole('button', { name: /reveal translation for/i });
    expect(revealButtons).toHaveLength(2);
    expect(revealButtons[0]).toHaveTextContent(/tap to reveal/i);

    // Meaning definition should not be visible initially
    expect(screen.queryByText('Polite morning greeting')).not.toBeInTheDocument();
    expect(screen.queryByText('Expression of gratitude')).not.toBeInTheDocument();
  });

  it('reveals translation and pronunciation when tapping "Tap to reveal", and allows hiding it again', () => {
    render(<Phrases data={samplePhrases} title="Basic Phrases" contentType="phrases" />);

    const revealButton = screen.getAllByRole('button', { name: /reveal translation for/i })[0];
    fireEvent.click(revealButton);

    // Meaning definition and pronunciation should now be visible
    expect(screen.getByText('Polite morning greeting')).toBeInTheDocument();
    expect(screen.getByText(/Pronunciation:/i)).toBeInTheDocument();
    expect(screen.getByText('Tap to hide')).toBeInTheDocument();

    // Tap to hide
    const hideButton = screen.getByRole('button', { name: /hide translation for Good morning/i });
    fireEvent.click(hideButton);

    // Should return to hidden state
    expect(screen.queryByText('Polite morning greeting')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /reveal translation for/i })[0]).toBeInTheDocument();
  });

  it('toggles all cards when clicking Reveal All and Hide All', () => {
    render(<Phrases data={samplePhrases} title="Basic Phrases" contentType="phrases" />);

    const toggleAllBtn = screen.getByRole('button', { name: /reveal all/i });
    fireEvent.click(toggleAllBtn);

    // Both cards should now be revealed
    expect(screen.getByText('Polite morning greeting')).toBeInTheDocument();
    expect(screen.getByText('Expression of gratitude')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hide all/i })).toBeInTheDocument();

    // Click Hide All
    fireEvent.click(screen.getByRole('button', { name: /hide all/i }));
    expect(screen.queryByText('Polite morning greeting')).not.toBeInTheDocument();
    expect(screen.queryByText('Expression of gratitude')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reveal all/i })).toBeInTheDocument();
  });
});
