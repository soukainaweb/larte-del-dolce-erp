import { describe, expect, it } from 'vitest';
import {
  containsArabic,
  getTextAlignment,
  prepareExportText,
  shouldUseRtlLayout,
} from './exportText';

describe('exportText', () => {
  it('detects Arabic characters', () => {
    expect(containsArabic('محمد')).toBe(true);
    expect(containsArabic('John Doe')).toBe(false);
  });

  it('prepares Arabic text for export rendering', () => {
    const prepared = prepareExportText('مرحبا');
    expect(prepared).toBeTruthy();
    expect(prepared).not.toBe('مرحبا');
  });

  it('uses RTL alignment for Arabic values', () => {
    expect(getTextAlignment('محمد', 'left')).toBe('right');
    expect(getTextAlignment('Invoice', 'left')).toBe('left');
  });

  it('detects when RTL layout is required', () => {
    expect(shouldUseRtlLayout(['Users', 'محمد'])).toBe(true);
    expect(shouldUseRtlLayout(['Users', 'Orders'])).toBe(false);
  });
});
