import { describe, it, expect } from 'vitest';
import type { AxiosError } from 'axios';
import { shouldRetry } from './api';

function fakeError(method: string, status?: number): AxiosError {
  return {
    config: { method },
    response: status === undefined ? undefined : ({ status } as AxiosError['response']),
  } as AxiosError;
}

describe('shouldRetry', () => {
  it('retries a GET with no response (network error / timeout)', () => {
    expect(shouldRetry(fakeError('get'), 0)).toBe(true);
  });

  it('retries a GET on a 502/503/504 (transient upstream failure)', () => {
    expect(shouldRetry(fakeError('get', 502), 0)).toBe(true);
    expect(shouldRetry(fakeError('get', 503), 0)).toBe(true);
    expect(shouldRetry(fakeError('get', 504), 0)).toBe(true);
  });

  it('does not retry a GET on a non-transient status (e.g. 500, 404, 401)', () => {
    expect(shouldRetry(fakeError('get', 500), 0)).toBe(false);
    expect(shouldRetry(fakeError('get', 404), 0)).toBe(false);
    expect(shouldRetry(fakeError('get', 401), 0)).toBe(false);
  });

  it('retries idempotent methods (head, options, put, delete)', () => {
    expect(shouldRetry(fakeError('head', 503), 0)).toBe(true);
    expect(shouldRetry(fakeError('options', 503), 0)).toBe(true);
    expect(shouldRetry(fakeError('put', 503), 0)).toBe(true);
    expect(shouldRetry(fakeError('delete', 503), 0)).toBe(true);
  });

  it('never retries a POST — it is not idempotent, so a blind retry could double-submit', () => {
    expect(shouldRetry(fakeError('post', 503), 0)).toBe(false);
    expect(shouldRetry(fakeError('post'), 0)).toBe(false);
  });

  it('stops retrying once MAX_RETRIES is reached', () => {
    expect(shouldRetry(fakeError('get', 503), 2)).toBe(false);
    expect(shouldRetry(fakeError('get', 503), 3)).toBe(false);
  });
});
