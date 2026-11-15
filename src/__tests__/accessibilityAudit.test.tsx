import React from 'react';
import fs from 'fs';
import path from 'path';
import axe from 'axe-core';
import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import App from '../App';
import Phrases from '../components/Phrases';
import Quiz from '../components/Quiz';
import BottomNavigation from '../components/BottomNavigation';
import PronunciationButton from '../components/PronunciationButton';
import { AuthModal } from '../components/AuthModal';
import { ProgressModal } from '../components/ProgressModal';
import { UserMenu } from '../components/UserMenu';
import PrivacyPolicy from '../components/PrivacyPolicy';
import TermsOfService from '../components/TermsOfService';
import { ProgressService } from '../services/progressService';
import { scrollToTop } from '../utils/useModalAccessibility';

// Mock HTMLMediaElement playback in jsdom
window.HTMLMediaElement.prototype.play = vi.fn().mockImplementation(() => Promise.resolve());
window.HTMLMediaElement.prototype.pause = vi.fn();

const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function expectNoAxeViolations(target: Element) {
  const results = await axe.run(target, {
    runOnly: {
      type: 'tag',
      values: WCAG_AA_TAGS,
    },
  });

  if (results.violations.length > 0) {
    const formatted = results.violations
      .map(
        (v) =>
          `[${v.id}] (${v.impact}) ${v.help}\n` +
          v.nodes.map((n) => `  - ${n.html}\n    ${n.failureSummary}`).join('\n')
      )
      .join('\n\n');
    expect.fail(`Expected 0 axe WCAG 2.1/2.2 AA violations, found ${results.violations.length}:\n${formatted}`);
  }

  expect(results.violations).toHaveLength(0);
}

// Helper for computing exact WCAG 2.x contrast ratios
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(fgHex: string, bgHex: string): number {
  const l1 = relativeLuminance(hexToRgb(fgHex));
  const l2 = relativeLuminance(hexToRgb(bgHex));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const appCssPath = path.resolve(__dirname, '../App.css');
const rawAppCss = fs.readFileSync(appCssPath, 'utf8');
const sanitizedAppCss = rawAppCss.replace(/@import\s+url\([^)]+\);?/g, '');

let injectedStyleEl: HTMLStyleElement | null = null;

beforeAll(() => {
  injectedStyleEl = document.createElement('style');
  injectedStyleEl.setAttribute('data-test-app-css', 'true');
  injectedStyleEl.textContent = sanitizedAppCss;
  document.head.appendChild(injectedStyleEl);
});

afterAll(() => {
  if (injectedStyleEl && injectedStyleEl.parentNode) {
    injectedStyleEl.parentNode.removeChild(injectedStyleEl);
  }
});

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  window.HTMLMediaElement.prototype.play = vi.fn().mockImplementation(() => Promise.resolve());
  window.HTMLMediaElement.prototype.pause = vi.fn();
  window.history.pushState({}, '', '/');
  document.body.style.overflow = '';
});

describe('WCAG 2.1 / 2.2 Level AA Automated axe-core Audits', () => {
  it('passes axe-core on full App shell, Alphabet view, and mobile BottomNavigation with proper landmarks & skip link', async () => {
    const { container, unmount } = render(<App />);

    await screen.findByRole('heading', { name: /English Alphabet/i, level: 2 });

    // Verify skip link & semantic landmarks
    const skipLink = screen.getByRole('link', { name: /Skip to main content/i });
    expect(skipLink).toHaveAttribute('href', '#main-content');
    expect(container.querySelector('.app')?.firstElementChild).toBe(skipLink);

    const h1 = screen.getByRole('heading', { level: 1 });
    const brandBtn = within(h1).getByRole('button', { name: /Basic English/i });
    expect(brandBtn).toHaveClass('brand-home-button');

    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
    // Bottom navigation is present in DOM and hidden via CSS on desktop viewports
    expect(container.querySelector('nav[aria-label="Bottom navigation"]')).toBeInTheDocument();
    expect(container.querySelector('main#main-content')).toHaveAttribute('tabindex', '-1');

    await expectNoAxeViolations(container);
    unmount();

    // Also audit BottomNavigation when visible on mobile viewports
    const { container: mobileNavContainer } = render(
      <div>
        <style>{`.bottom-navigation { display: flex !important; }`}</style>
        <BottomNavigation activeSection="alphabet" setActiveSection={vi.fn()} />
      </div>
    );
    const mobileNav = screen.getByRole('navigation', { name: 'Bottom navigation' });
    expect(within(mobileNav).getByRole('button', { name: /Alphabet/i })).toHaveAttribute('aria-current', 'page');
    await expectNoAxeViolations(mobileNavContainer);
  });

  it('passes axe-core on Phrases view in both unrevealed and revealed states without masking inner text', async () => {
    const samplePhrases = [
      { phrase: 'Good morning', meaning: 'Polite morning greeting', pronunciation: '/ɡʊd ˈmɔːrnɪŋ/', icon: '☀️' },
      { phrase: 'Thank you', meaning: 'Expression of gratitude', pronunciation: '/θæŋk juː/', icon: '🙏' },
    ];

    const { container } = render(
      <Phrases data={samplePhrases} title="Basic Phrases" contentType="phrases" />
    );

    // 1. Unrevealed state
    await expectNoAxeViolations(container);

    // 2. Single card revealed state
    const revealBtn = screen.getByRole('button', { name: /Reveal translation for Good morning/i });
    expect(revealBtn).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(revealBtn);

    const definitionEl = screen.getByText('Polite morning greeting');
    expect(definitionEl).toBeInTheDocument();
    // Ensure revealed text is NOT wrapped inside an element with role="button" or aria-label masking it
    expect(definitionEl.closest('[role="button"]')).toBeNull();
    expect(definitionEl.closest('[aria-label]')).toBeNull();

    await expectNoAxeViolations(container);

    // 3. Reveal All state
    const studyToggle = screen.getByRole('button', { name: /Reveal all basic phrases/i });
    expect(studyToggle).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(studyToggle);
    expect(screen.getByRole('button', { name: /Hide all basic phrases/i })).toHaveAttribute('aria-pressed', 'true');

    await expectNoAxeViolations(container);
  });

  it('passes axe-core on Numbers & Time and Common Words views via full App navigation', async () => {
    const { container } = render(<App />);
    await screen.findByRole('heading', { name: /English Alphabet/i, level: 2 });

    const mainNav = screen.getByRole('navigation', { name: 'Main navigation' });

    // Numbers & Time (desktop nav button label is "Numbers")
    fireEvent.click(within(mainNav).getByRole('button', { name: 'Numbers' }));
    await screen.findByRole('heading', { name: 'Numbers & Time', level: 2 });
    const firstNumToggle = screen.getAllByRole('button', { name: /Reveal translation for/i })[0];
    fireEvent.click(firstNumToggle);
    await expectNoAxeViolations(container);

    // Common Words
    fireEvent.click(within(mainNav).getByRole('button', { name: 'Common Words' }));
    await screen.findByRole('heading', { name: 'Common Words', level: 2 });
    const firstWordToggle = screen.getAllByRole('button', { name: /Reveal translation for/i })[0];
    fireEvent.click(firstWordToggle);
    await expectNoAxeViolations(container);
  });

  it('passes axe-core on Quiz view across active question, cloze blank, feedback drawer, and session recap states', async () => {
    // Deterministic Math.random = 0.1 triggers standard/cloze modes cleanly
    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    const quizData = {
      basicPhrases: [
        { phrase: 'Thank you very much', meaning: 'Strong expression of gratitude', pronunciation: '/θæŋk juː ˈvɛri mʌtʃ/' },
      ],
    };

    const { container } = render(<Quiz data={quizData} />);

    // Verify progressbar & labeled input
    const progressBar = screen.getByRole('progressbar', { name: /Session progress/i });
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');

    const fiveGoal = screen.getByRole('button', { name: '5 Qs' });
    fireEvent.click(fiveGoal);
    expect(fiveGoal).toHaveAttribute('aria-pressed', 'true');

    // Active question audit
    await expectNoAxeViolations(container);

    // Submit an incorrect answer to audit feedback drawer + "I was right" button
    const input = screen.getByRole('textbox', { name: /Your answer|Type|Fill|Listen|What/i });
    fireEvent.change(input, { target: { value: 'wrong answer' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check Answer' }));

    expect(screen.getByText(/Not quite/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /I was right/i })).toBeInTheDocument();
    await expectNoAxeViolations(container);

    // Advance remaining 4 questions to reach Recap screen with "Words to Review from This Session"
    fireEvent.click(screen.getByRole('button', { name: /Next Question \(2\/5\)/i }));
    for (let i = 2; i <= 5; i++) {
      const ansInput = screen.getByPlaceholderText(/Your answer here/i);
      fireEvent.change(ansInput, { target: { value: 'wrong answer' } });
      fireEvent.click(screen.getByRole('button', { name: 'Check Answer' }));
      if (i < 5) {
        fireEvent.click(screen.getByRole('button', { name: new RegExp(`Next Question \\(${i + 1}/5\\)`, 'i') }));
      } else {
        fireEvent.click(screen.getByRole('button', { name: /Complete Quiz & View Results/i }));
      }
    }

    await screen.findByRole('heading', { name: 'Quiz Session Complete!', level: 2 });
    // Verify missed section heading uses h3 (no skipped h2 -> h4 heading level)
    expect(
      screen.getByRole('heading', { name: /Words to Review from This Session/i, level: 3 })
    ).toBeInTheDocument();

    await expectNoAxeViolations(container);
  });

  it('passes axe-core on AuthModal and ProgressModal (empty and populated states)', async () => {
    const { container: authContainer, unmount: unmountAuth } = render(
      <AuthModal isOpen={true} onClose={vi.fn()} />
    );
    const authDialog = screen.getByRole('dialog', { name: /Sync Your Learning Progress/i });
    expect(authDialog).toHaveAttribute('aria-modal', 'true');
    await expectNoAxeViolations(authContainer);
    unmountAuth();

    // ProgressModal empty state
    const { container: emptyProgContainer, unmount: unmountEmptyProg } = render(
      <ProgressModal isOpen={true} onClose={vi.fn()} />
    );
    await screen.findByText('No Quiz History Yet');
    await expectNoAxeViolations(emptyProgContainer);
    unmountEmptyProg();

    // ProgressModal populated state
    await ProgressService.recordQuizSession({
      category: 'basicPhrases',
      score: 8,
      totalQuestions: 10,
    });
    await ProgressService.recordWordAttempt({
      category: 'phrases',
      wordId: 'phrases-Hello',
      prompt: 'Hello',
      answer: 'Friendly greeting',
      isCorrect: false,
    });

    const { container: popProgContainer, unmount: unmountPopProg } = render(
      <ProgressModal isOpen={true} onClose={vi.fn()} userEmail="learner@example.com" />
    );
    await screen.findByText('Words & Phrases to Review');
    expect(screen.getByText(/0 correct, 1 incorrect/i)).toBeInTheDocument();
    await expectNoAxeViolations(popProgContainer);
    unmountPopProg();
  });

  it('passes axe-core on UserMenu in both guest and authenticated open-menu states', async () => {
    // Guest state (WCAG 2.5.3 Label in Name check)
    const { container: guestContainer, unmount: unmountGuest } = render(<UserMenu />);
    const statsBtn = screen.getByTitle('View learning stats');
    expect(statsBtn.getAttribute('aria-label')).toMatch(/^My Stats/i);
    await expectNoAxeViolations(guestContainer);
    unmountGuest();

    // Logged-in state with open dropdown menu
    const mockUser = {
      email: 'student@example.com',
      user_metadata: { full_name: 'Alex Student' },
      app_metadata: { provider: 'google' },
    };
    const { container: authMenuContainer } = render(
      <UserMenu onNavigate={vi.fn()} initialUser={mockUser} />
    );
    const trigger = screen.getByRole('button', { name: /User menu for Alex Student/i });
    fireEvent.click(trigger);

    const menu = screen.getByRole('menu', { name: /User account menu/i });
    expect(within(menu).getAllByRole('menuitem').length).toBeGreaterThanOrEqual(4);
    await expectNoAxeViolations(authMenuContainer);
  });

  it('passes axe-core on SPA PrivacyPolicy & TermsOfService views and static public HTML legal pages', async () => {
    const { container: privacyContainer, unmount: unmountPrivacy } = render(
      <PrivacyPolicy onNavigate={vi.fn()} />
    );
    await expectNoAxeViolations(privacyContainer);
    unmountPrivacy();

    const { container: termsContainer, unmount: unmountTerms } = render(
      <TermsOfService onNavigate={vi.fn()} />
    );
    await expectNoAxeViolations(termsContainer);
    unmountTerms();

    // Audit static public/privacy/index.html and public/terms/index.html
    for (const relPath of ['../../public/privacy/index.html', '../../public/terms/index.html']) {
      const htmlPath = path.resolve(__dirname, relPath);
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');

      expect(htmlContent).toContain('class="skip-link"');
      expect(htmlContent).toContain('id="main-content"');
      expect(htmlContent).toContain(':focus-visible');
      expect(htmlContent).toContain('prefers-reduced-motion: reduce');
      expect(htmlContent).toMatch(/main a,\s*footer a\s*\{[^}]*text-decoration:\s*underline/s);

      const parsed = new DOMParser().parseFromString(htmlContent, 'text/html');
      const host = document.createElement('div');
      const styleTag = parsed.querySelector('style');
      if (styleTag) {
        host.appendChild(styleTag.cloneNode(true));
      }
      Array.from(parsed.body.children).forEach((child) => {
        host.appendChild(child.cloneNode(true));
      });
      document.body.appendChild(host);
      try {
        await expectNoAxeViolations(host);
      } finally {
        document.body.removeChild(host);
      }
    }
  });
});

describe('Keyboard Operability, Focus Stability, Modal Focus Trap & Reduced Motion', () => {
  it('moves focus to #main-content via skip link and supports keyboard navigation on desktop nav buttons', async () => {
    render(<App />);
    await screen.findByRole('heading', { name: /English Alphabet/i, level: 2 });

    const skipLink = screen.getByRole('link', { name: /Skip to main content/i });
    fireEvent.click(skipLink);
    expect(document.activeElement).toBe(document.getElementById('main-content'));

    const mainNav = screen.getByRole('navigation', { name: 'Main navigation' });
    const alphabetBtn = within(mainNav).getByRole('button', { name: 'Alphabet' });
    const phrasesBtn = within(mainNav).getByRole('button', { name: 'Basic Phrases' });

    expect(alphabetBtn).toHaveAttribute('aria-current', 'page');
    expect(phrasesBtn).not.toHaveAttribute('aria-current');

    phrasesBtn.focus();
    fireEvent.click(phrasesBtn);

    await screen.findByRole('heading', { name: 'Basic Phrases', level: 2 });
    expect(phrasesBtn).toHaveAttribute('aria-current', 'page');
    expect(alphabetBtn).not.toHaveAttribute('aria-current');
  });

  it('retains keyboard focus on PronunciationButton during audio playback using aria-disabled', async () => {
    let resolvePlay!: () => void;
    window.HTMLMediaElement.prototype.play = vi.fn().mockImplementation(
      () =>
        new Promise<void>((res) => {
          resolvePlay = res;
        })
    );

    render(
      <PronunciationButton
        text="Hello"
        label="Pronounce phrase Hello"
        audioCategory="phrases"
        useLocalAudio={true}
      />
    );

    const btn = screen.getByRole('button', { name: 'Pronounce phrase Hello' });
    await waitFor(() => {
      expect(btn).toHaveAttribute('aria-disabled', 'false');
    });

    btn.focus();
    expect(document.activeElement).toBe(btn);

    fireEvent.click(btn);

    // Must never use native disabled attribute which drops activeElement to document.body
    expect(btn).not.toBeDisabled();
    expect(btn).toHaveAttribute('aria-disabled', 'true');
    expect(document.activeElement).toBe(btn);

    if (resolvePlay) resolvePlay();
  });

  it('preserves PhraseCard DOM node identity and keeps focus on the toggle button across reveal and hide', () => {
    const sample = [
      { phrase: 'Excuse me', meaning: 'Polite way to get attention', pronunciation: '/ɪkˈskjuːz miː/' },
    ];

    const { container } = render(
      <Phrases data={sample} title="Basic Phrases" contentType="phrases" />
    );

    const cardBefore = container.querySelector('.phrase-card');
    const toggleBtn = screen.getByRole('button', { name: 'Reveal translation for Excuse me' });

    toggleBtn.focus();
    expect(document.activeElement).toBe(toggleBtn);

    // Reveal
    fireEvent.click(toggleBtn);
    const cardAfterReveal = container.querySelector('.phrase-card');
    expect(cardAfterReveal).toBe(cardBefore);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    expect(toggleBtn).toHaveAttribute('aria-label', 'Hide translation for Excuse me');
    expect(document.activeElement).toBe(toggleBtn);

    // Hide
    fireEvent.click(toggleBtn);
    const cardAfterHide = container.querySelector('.phrase-card');
    expect(cardAfterHide).toBe(cardBefore);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
    expect(toggleBtn).toHaveAttribute('aria-label', 'Reveal translation for Excuse me');
    expect(document.activeElement).toBe(toggleBtn);
  });

  it('does not hijack Enter on interactive controls in Quiz and supports ArrowLeft/ArrowRight on category tablist', async () => {
    render(
      <Quiz
        data={{
          alphabet: [{ character: 'A', pronunciation: '/eɪ/', example: 'as in Apple' }],
          numbers: [{ phrase: 'One', meaning: '1', pronunciation: '/wʌn/' }],
        }}
      />
    );

    // 1. Arrow key navigation on category filter tablist
    const tablist = screen.getByRole('tablist', { name: /Quiz topic filter/i });
    const tabs = within(tablist).getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    tabs[0].focus();

    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(document.activeElement).toBe(tabs[1]);

    fireEvent.keyDown(tablist, { key: 'End' });
    expect(tabs[tabs.length - 1]).toHaveAttribute('aria-selected', 'true');
    expect(document.activeElement).toBe(tabs[tabs.length - 1]);

    fireEvent.keyDown(tablist, { key: 'Home' });
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(document.activeElement).toBe(tabs[0]);

    // 2. Submit wrong answer, then verify pressing Enter on "I was right" is NOT hijacked by global window listener
    const input = screen.getByPlaceholderText(/Your answer here/i);
    fireEvent.change(input, { target: { value: 'definitely wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check Answer' }));

    const overrideBtn = screen.getByRole('button', { name: /I was right/i });
    overrideBtn.focus();
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });
    const notPrevented = overrideBtn.dispatchEvent(enterEvent);
    // Global listener must NOT call preventDefault() or advance to Question 2 without clicking override
    expect(notPrevented).toBe(true);
    expect(screen.getByRole('button', { name: /I was right/i })).toBeInTheDocument();
  });

  it('traps Tab/Shift+Tab focus inside AuthModal, locks scroll, dismisses on Escape, and restores trigger focus', async () => {
    render(<UserMenu />);

    const signInTrigger = screen.getByTitle('Sign in to sync progress');
    signInTrigger.focus();
    expect(document.activeElement).toBe(signInTrigger);

    fireEvent.click(signInTrigger);

    const dialog = await screen.findByRole('dialog', { name: /Sync Your Learning Progress/i });
    expect(document.body.style.overflow).toBe('hidden');

    const focusables = Array.from(
      dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]')
    );
    expect(focusables.length).toBeGreaterThanOrEqual(2);

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    // Forward Tab wrap: last -> first
    last.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
    expect(document.activeElement).toBe(first);

    // Backward Shift+Tab wrap: first -> last
    first.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);

    // Escape closes modal, unlocks scroll, and restores focus to signInTrigger
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(document.body.style.overflow).toBe('');
    expect(document.activeElement).toBe(signInTrigger);
  });

  it('supports ArrowUp/ArrowDown and Escape focus return in UserMenu dropdown', async () => {
    const mockUser = {
      email: 'alex@example.com',
      user_metadata: { full_name: 'Alex' },
      app_metadata: { provider: 'github' },
    };

    render(<UserMenu onNavigate={vi.fn()} initialUser={mockUser} />);
    const trigger = screen.getByRole('button', { name: /User menu for Alex/i });
    trigger.focus();

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    const menu = await screen.findByRole('menu', { name: /User account menu/i });
    const items = within(menu).getAllByRole('menuitem');

    await waitFor(() => {
      expect(document.activeElement).toBe(items[0]);
    });

    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(items[1]);

    fireEvent.keyDown(document, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(items[0]);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });

  it('enforces WCAG AA contrast ratios, underlined inline links, >=24px targets, and prefers-reduced-motion', () => {
    // 1. Verify WCAG AA >= 4.5:1 text contrast on all remediated color pairs
    expect(contrastRatio('#ffffff', '#047857')).toBeGreaterThanOrEqual(4.5); // Emerald buttons & badges
    expect(contrastRatio('#ffffff', '#065f46')).toBeGreaterThanOrEqual(4.5); // Darker emerald gradient stop
    expect(contrastRatio('#047857', '#ffffff')).toBeGreaterThanOrEqual(4.5); // Green text on white
    expect(contrastRatio('#15803d', '#f0fdf4')).toBeGreaterThanOrEqual(4.5); // Mastered badge text
    expect(contrastRatio('#475569', '#f8fafc')).toBeGreaterThanOrEqual(4.5); // Muted slate text on #f8fafc
    expect(contrastRatio('#92400e', '#fffbeb')).toBeGreaterThanOrEqual(4.5); // Gold badge text
    expect(contrastRatio('#b45309', '#ffffff')).toBeGreaterThanOrEqual(4.5); // Highlight stat text
    expect(contrastRatio('#dc2626', '#ffffff')).toBeGreaterThanOrEqual(4.5); // Red error text on white
    expect(contrastRatio('#b91c1c', '#fef2f2')).toBeGreaterThanOrEqual(4.5); // Error alert text
    expect(contrastRatio('#ffffff', '#dc2626')).toBeGreaterThanOrEqual(4.5); // Incorrect next button
    expect(contrastRatio('#475569', '#eef2ff')).toBeGreaterThanOrEqual(4.5); // Quiz hint text
    expect(contrastRatio('#ffffff', '#2563eb')).toBeGreaterThanOrEqual(4.5); // Active category pill gradient end

    // 2. Verify >= 3.0:1 non-text contrast for .quiz-input resting border (#64748b on #ffffff)
    expect(contrastRatio('#64748b', '#ffffff')).toBeGreaterThanOrEqual(3.0);

    // 3. Verify CSS rules for underlines, focus rings, responsive grid, and reduced motion
    expect(rawAppCss).toContain('.skip-link');
    expect(rawAppCss).toContain('minmax(min(100%, 300px), 1fr)');
    expect(rawAppCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(rawAppCss).toMatch(/\.quiz-input:focus\s*\{[^}]*outline:\s*2px solid/s);

    // 4. Verify scrollToTop() respects prefers-reduced-motion
    const scrollSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const originalMatchMedia = window.matchMedia;

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    scrollToTop();
    expect(scrollSpy).toHaveBeenLastCalledWith({ top: 0, behavior: 'auto' });

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    scrollToTop();
    expect(scrollSpy).toHaveBeenLastCalledWith({ top: 0, behavior: 'smooth' });

    window.matchMedia = originalMatchMedia;
  });
});
