import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      // react-hooks/purity: fully re-enabled (default 'error') — the one
      // violation in the codebase (HeroScene3D's particle-field RNG inside
      // useMemo) was fixed by moving it into a lazy useState initializer.
      //
      // react-hooks/set-state-in-effect: the codebase's established
      // data-loading pattern is `useEffect(() => { fetchX() }, [...])`
      // followed by setState, used pervasively across every dashboard page.
      // Flipping this straight to 'error' would fail the build across ~40
      // call sites and require migrating the whole app's data-fetching
      // architecture (e.g. to React Query / use()) in one shot — out of
      // scope for incremental hardening. Downgraded to 'warn' instead of
      // 'off' so it's visible to contributors and in CI output, without
      // blocking builds; tighten to 'error' once those call sites are
      // migrated incrementally.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  globalIgnores(['.next/**', 'node_modules/**']),
]);
