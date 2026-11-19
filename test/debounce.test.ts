import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from '../src/debounce';

describe('debounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('не вызывает функцию до истечения задержки', () => {
    const fn = vi.fn();
    const d = debounce(fn, 400);
    d('a');
    expect(fn).not.toHaveBeenCalled();
  });

  it('вызывает после delay', () => {
    const fn = vi.fn();
    const d = debounce(fn, 400);
    d('a');
    vi.advanceTimersByTime(400);
    expect(fn).toHaveBeenCalledWith('a');
  });

  it('сбрасывает таймер при повторном вызове', () => {
    const fn = vi.fn();
    const d = debounce(fn, 400);
    d('a');
    vi.advanceTimersByTime(300);
    d('b');
    vi.advanceTimersByTime(300);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith('b');
  });
});
