import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from '../App';
import Alphabet from '../components/Alphabet';
import AuthModal from '../components/AuthModal';
import UserMenu from '../components/UserMenu';
import * as supabaseMod from '../services/supabaseClient';
import * as speechMod from '../utils/speech';
import { ProgressService } from '../services/progressService';

describe('App Routing, Navigation, Alphabet, AuthModal & UserMenu', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/');
    localStorage.clear();
    vi.spyOn(speechMod, 'initVoices').mockResolvedValue();
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('routes cleanly across all URL paths, BottomNavigation, Navigation, Terms/Privacy links, and browser popstate', async () => {
    window.history.pushState({}, '', '/words/');
    render(<App />);

    expect(await screen.findByRole('heading', { name: /Common Words/i })).toBeInTheDocument();
    expect(document.title).toContain('Common English Words');

    // Switch via BottomNavigation to Numbers, Phrases, Quiz, Alphabet
    const numbersBtn = screen.getByRole('button', { name: 'Switch to Numbers section' });
    fireEvent.click(numbersBtn);
    expect(await screen.findByRole('heading', { name: /Numbers & Time/i })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/numbers');

    fireEvent.click(screen.getByRole('button', { name: 'Switch to Phrases section' }));
    expect(await screen.findByRole('heading', { name: /Basic Phrases/i })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/phrases');

    // Switch via top Navigation bar to Quiz
    const navListItems = document.querySelectorAll('.navigation li');
    const quizNavItem = Array.from(navListItems).find((el) => el.textContent === 'Quiz')!;
    fireEvent.click(quizNavItem);
    expect(window.location.pathname).toBe('/quiz');

    // Footer Terms of Service -> View Privacy Policy -> Back to Practice
    fireEvent.click(screen.getByRole('link', { name: 'Terms of Service' }));
    expect(await screen.findByRole('heading', { name: 'Terms of Service' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/terms');

    fireEvent.click(screen.getByRole('button', { name: 'View Privacy Policy' }));
    expect(await screen.findByRole('heading', { name: 'Privacy Policy' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/privacy');

    // Header h1 logo returns to alphabet
    fireEvent.click(screen.getByTitle('Return to alphabet lessons'));
    expect(await screen.findByRole('heading', { name: /English Alphabet & Phonics/i })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/alphabet');

    // Browser back/forward popstate
    act(() => {
      window.history.pushState({}, '', '/terms');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(await screen.findByRole('heading', { name: 'Terms of Service' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back to practice lessons' }));
    expect(await screen.findByRole('heading', { name: /English Alphabet & Phonics/i })).toBeInTheDocument();
  });

  it('handles PWA beforeinstallprompt, Install App click, and appinstalled events', async () => {
    render(<App />);
    await screen.findByRole('heading', { name: /English Alphabet & Phonics/i });

    const promptSpy = vi.fn();
    const fakeInstallEvent = new Event('beforeinstallprompt');
    Object.assign(fakeInstallEvent, {
      preventDefault: vi.fn(),
      prompt: promptSpy,
      userChoice: Promise.resolve({ outcome: 'accepted' }),
    });

    act(() => {
      window.dispatchEvent(fakeInstallEvent);
    });

    const installBtn = await screen.findByRole('button', { name: 'Install App' });
    fireEvent.click(installBtn);
    expect(promptSpy).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Install App' })).not.toBeInTheDocument());

    // Re-trigger and clear via appinstalled event
    act(() => {
      window.dispatchEvent(fakeInstallEvent);
    });
    expect(await screen.findByRole('button', { name: 'Install App' })).toBeInTheDocument();
    act(() => {
      window.dispatchEvent(new Event('appinstalled'));
    });
    expect(screen.queryByRole('button', { name: 'Install App' })).not.toBeInTheDocument();
  });

  it('plays example audio when clicking the Alphabet emoji icon badge', async () => {
    const speakSpy = vi.spyOn(speechMod, 'speak').mockImplementation(() => {});
    render(
      <Alphabet
        data={[
          {
            letter: 'A',
            pronunciation: '/eɪ/',
            example: 'as in Apple',
            word: 'Apple',
            meaning: 'Noun: Fruit',
            icon: '🍎',
          },
        ]}
      />
    );

    const badgeBtn = screen.getByRole('button', { name: 'Pronounce Apple' });
    fireEvent.click(badgeBtn);
    expect(speakSpy).toHaveBeenCalledWith(
      'Apple',
      'en-US',
      'badge-Apple',
      undefined,
      undefined,
      { category: 'examples' }
    );
  });

  it('invokes Google, GitHub, and Microsoft Entra login handlers in AuthModal and displays returned or thrown errors', async () => {
    const onClose = vi.fn();
    const googleSpy = vi.spyOn(supabaseMod, 'signInWithGoogle').mockResolvedValue({ error: new Error('Google OAuth disabled') });
    const githubSpy = vi.spyOn(supabaseMod, 'signInWithGithub').mockRejectedValue(new Error('GitHub network timeout'));
    const entraSpy = vi.spyOn(supabaseMod, 'signInWithEntra').mockResolvedValue({ error: null });

    const { rerender } = render(<AuthModal isOpen={false} onClose={onClose} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(<AuthModal isOpen={true} onClose={onClose} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Sign in with Google' }));
    expect(await screen.findByText('Google OAuth disabled')).toBeInTheDocument();
    expect(googleSpy).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Sign in with GitHub' }));
    expect(await screen.findByText('GitHub network timeout')).toBeInTheDocument();
    expect(githubSpy).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Sign in with Microsoft Entra ID' }));
    await waitFor(() => expect(entraSpy).toHaveBeenCalledTimes(1));

    // Backdrop click closes modal; inner container click does not
    fireEvent.click(document.querySelector('.auth-modal-container')!);
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('validates UserMenu avatar URLs, provider badges, outside click dismissal, legal links, and sign-out', async () => {
    const signOutSpy = vi.spyOn(supabaseMod, 'signOutUser').mockResolvedValue({ error: null });
    const onNavigate = vi.fn();
    vi.spyOn(ProgressService, 'getUserStats').mockResolvedValue({
      totalQuizzesTaken: 0,
      averageScore: 0,
      wordsMasteredCount: 0,
      wordsLearningCount: 0,
      wordsToReview: [],
      recentSessions: [],
    });

    // Unsafe HTTP avatar URL must be rejected in favor of placeholder icon
    const { unmount } = render(
      <UserMenu
        onNavigate={onNavigate}
        initialUser={{
          id: 'u1',
          email: 'alice@example.com',
          app_metadata: { provider: 'github' },
          user_metadata: { full_name: 'Alice', avatar_url: 'http://insecure.example.com/pic.png' },
        }}
      />
    );

    const trigger = screen.getByRole('button', { name: 'User menu for Alice' });
    expect(document.querySelector('.user-avatar-img')).toBeNull();
    expect(document.querySelector('.user-avatar-placeholder')).not.toBeNull();

    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText(/GitHub/)).toBeInTheDocument();

    // Legal navigation items inside dropdown
    fireEvent.click(screen.getByText('Privacy Policy'));
    expect(onNavigate).toHaveBeenCalledWith('privacy');

    fireEvent.click(trigger);
    fireEvent.click(screen.getByText('Terms of Service'));
    expect(onNavigate).toHaveBeenCalledWith('terms');

    // Click outside closes menu
    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    // Sign out clears user back to guest state
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText('Sign Out'));
    await waitFor(() => expect(signOutSpy).toHaveBeenCalledTimes(1));
    expect(await screen.findByRole('button', { name: 'Sign in to sync progress' })).toBeInTheDocument();

    unmount();

    // Valid HTTPS avatar URL renders <img> with no-referrer
    render(
      <UserMenu
        initialUser={{
          id: 'u2',
          email: 'bob@example.com',
          app_metadata: { provider: 'azure' },
          user_metadata: { full_name: 'Bob', avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4' },
        }}
      />
    );
    const img = screen.getByAltText('Bob') as HTMLImageElement;
    expect(img).toHaveAttribute('referrerpolicy', 'no-referrer');
  });
});
