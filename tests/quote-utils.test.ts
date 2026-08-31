import { describe, it, expect } from 'vitest';
import { validateAndBuildQuote } from '../lib/admin/quote-utils';

describe('validateAndBuildQuote', () => {
  it('parses numeric fields and returns valid', () => {
    const { valid, errors, quote } = validateAndBuildQuote({ finalEstimatedPrice: '1000', serviceFee: '50' });
    expect(valid).toBe(true);
    expect(errors.length).toBe(0);
    expect(quote.finalEstimatedPrice).toBe(1000);
    expect(quote.serviceFee).toBe(50);
  });

  it('rejects non-numeric finalEstimatedPrice', () => {
    const { valid, errors } = validateAndBuildQuote({ finalEstimatedPrice: 'abc' });
    expect(valid).toBe(false);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects negative finalEstimatedPrice', () => {
    const { valid, errors } = validateAndBuildQuote({ finalEstimatedPrice: '-5' });
    expect(valid).toBe(false);
    expect(errors).toContain('finalEstimatedPrice must be >= 0');
  });
});