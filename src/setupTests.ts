// Extends Vitest's expect with jest-dom matchers
// e.g. expect(element).toBeInTheDocument()
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock window.scrollTo for jsdom environment
window.scrollTo = vi.fn();

// Mock canvas getContext so axe-core runs cleanly in jsdom without stderr noise
HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as any;

