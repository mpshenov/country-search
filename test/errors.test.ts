import { describe, it, expect } from 'vitest';
import { classifyError, HttpError } from '../src/errors';

describe('classifyError', () => {
  it('HttpError → http', () => expect(classifyError(new HttpError(500, 'x'))).toBe('http'));
  it('AbortError → aborted', () =>
    expect(classifyError(new DOMException('', 'AbortError'))).toBe('aborted'));
  it('TimeoutError → timeout', () =>
    expect(classifyError(new DOMException('', 'TimeoutError'))).toBe('timeout'));
  it('TypeError → network', () => expect(classifyError(new TypeError('fail'))).toBe('network'));
});
