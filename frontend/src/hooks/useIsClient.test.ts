import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import { useIsClient } from './useIsClient';

function Probe() {
  return createElement('span', null, useIsClient() ? 'client' : 'server');
}

describe('useIsClient', () => {
  it('is false when rendered on the server', () => {
    expect(renderToString(createElement(Probe))).toContain('server');
  });

  it('is true once rendered in the browser', () => {
    const { result } = renderHook(() => useIsClient());
    expect(result.current).toBe(true);
  });
});
