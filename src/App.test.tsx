import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

describe('App', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/');
  });

  test('renders Basic English heading', () => {
    render(<App />);
    const headingElement = screen.getByRole('heading', { name: /basic english/i, level: 1 });
    expect(headingElement).toBeInTheDocument();
  });

  test('navigates to Privacy Policy when clicking footer link', async () => {
    render(<App />);
    const privacyLink = screen.getByRole('link', { name: /privacy policy/i });
    fireEvent.click(privacyLink);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Privacy Policy', level: 1 })).toBeInTheDocument();
      expect(window.location.pathname).toBe('/privacy');
    });
  });

  test('navigates to Terms of Service when clicking footer link', async () => {
    render(<App />);
    const termsLink = screen.getByRole('link', { name: /terms of service/i });
    fireEvent.click(termsLink);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Terms of Service', level: 1 })).toBeInTheDocument();
      expect(window.location.pathname).toBe('/terms');
    });
  });

  test('renders Privacy Policy when loaded directly at /privacy', async () => {
    window.history.pushState({}, '', '/privacy');
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Privacy Policy', level: 1 })).toBeInTheDocument();
    });
  });

  test('renders Terms of Service when loaded directly at /terms', async () => {
    window.history.pushState({}, '', '/terms');
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Terms of Service', level: 1 })).toBeInTheDocument();
    });
  });

  test('navigates back to practice from Privacy Policy', async () => {
    window.history.pushState({}, '', '/privacy');
    render(<App />);

    const backBtn = await screen.findByRole('button', { name: /back to practice lessons/i });
    fireEvent.click(backBtn);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/alphabet');
      expect(screen.getByRole('heading', { name: /english alphabet/i, level: 2 })).toBeInTheDocument();
    });
  });

  test('renders GitHub repository links in footer and Terms of Service', async () => {
    render(<App />);
    const footerGithubLink = screen.getByRole('link', { name: /^GitHub$/i });
    expect(footerGithubLink).toHaveAttribute('href', 'https://github.com/JohnBendfeldt/basic-english');
    expect(footerGithubLink).toHaveAttribute('rel', 'noopener noreferrer');

    fireEvent.click(screen.getByRole('link', { name: /terms of service/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Terms of Service', level: 1 })).toBeInTheDocument();
    });

    const mitLink = screen.getByRole('link', { name: /MIT License/i });
    expect(mitLink).toHaveAttribute('href', 'https://github.com/JohnBendfeldt/basic-english/blob/main/LICENSE');
    expect(screen.getByRole('link', { name: 'github.com/JohnBendfeldt/basic-english' })).toHaveAttribute(
      'href',
      'https://github.com/JohnBendfeldt/basic-english'
    );
  });
});
