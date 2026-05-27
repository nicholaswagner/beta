import { Suspense, use, useEffect, useId, useState } from 'react';
import { useTheme } from '~/components/ui/ThemeContext';

/**
 * Wrapper that defers rendering until after first paint (mermaid needs the
 * DOM) and provides a Suspense boundary so the `use()` calls inside
 * `MermaidContent` can suspend on cold-cache renders without crashing.
 *
 * Fences are rewritten to `<Mermaid chart="..." />` by `remarkMdxMermaid` in
 * `source.config.ts`.
 */
export function Mermaid({ chart }: { chart: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return (
    <Suspense fallback={<MermaidPlaceholder />}>
      <MermaidContent chart={chart} />
    </Suspense>
  );
}

function MermaidPlaceholder() {
  return (
    <div
      style={{
        padding: '1.5rem',
        textAlign: 'center',
        color: 'var(--gray-10)',
        fontSize: 'var(--font-size-1)',
      }}
    >
      Rendering diagram…
    </div>
  );
}

const cache = new Map<string, Promise<unknown>>();

function cachePromise<T>(key: string, setPromise: () => Promise<T>): Promise<T> {
  const cached = cache.get(key);
  if (cached) return cached as Promise<T>;

  const promise = setPromise();
  cache.set(key, promise);
  return promise;
}

function MermaidContent({ chart }: { chart: string }) {
  const id = useId();
  const { theme } = useTheme();
  const { default: mermaid } = use(cachePromise('mermaid', () => import('mermaid')));

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    fontFamily: 'inherit',
    themeCSS: `
      margin: 1.5rem auto 0;

      /* Radar (radar-beta) — use Radix tokens so the chart matches the
         site's accent + gray scales in both light and dark themes. */
      .radarGraticule {
        fill: transparent;
        stroke: var(--gray-6);
        stroke-width: 1px;
      }
      .radarAxisLine {
        stroke: var(--gray-7);
        stroke-width: 1px;
      }
      .radarAxisLabel {
        fill: var(--gray-12);
        color: var(--gray-12);
        font-size: var(--font-size-2);
      }
      .radarTitle {
        fill: var(--gray-12);
        color: var(--gray-12);
        font-size: var(--font-size-4);
        font-weight: 600;
      }
      [class^="radarCurve-"], [class*=" radarCurve-"] {
        fill: var(--accent-a4);
        stroke: var(--accent-9);
        stroke-width: 2px;
      }
      [class^="radarLegendBox-"], [class*=" radarLegendBox-"] {
        fill: var(--accent-9);
        stroke: var(--accent-9);
      }
      .radarLegendText {
        fill: var(--gray-11);
        color: var(--gray-11);
        font-size: var(--font-size-1);
      }
    `,
    theme: theme === 'dark' ? 'dark' : 'default',
  });

  const { svg, bindFunctions } = use(
    cachePromise(`${chart}-${theme}`, () => {
      return mermaid.render(id.replace(/[:]/g, '_'), chart.replaceAll('\\n', '\n'));
    }),
  );

  return (
    <div
      ref={(container) => {
        if (container) bindFunctions?.(container);
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
