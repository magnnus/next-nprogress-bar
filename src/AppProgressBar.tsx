import React, { useCallback, useEffect, useMemo } from 'react';
import NProgress from 'nprogress';
import { isSameURL, isSameURLWithoutSearch } from './utils/sameURL';
import {
  usePathname,
  useSearchParams,
  useRouter as useNextRouter,
} from 'next/navigation';
import { ProgressBarProps, RouterNProgressOptions } from '.';
import { getAnchorProperty } from './utils/getAnchorProperty';
import { NavigateOptions } from 'next/dist/shared/lib/app-router-context.shared-runtime';

type PushStateInput = [
  data: any,
  unused: string,
  url?: string | URL | null | undefined,
];

export const AppProgressBar = React.memo(
  ({
    color = '#0A2FFF',
    height = '2px',
    options,
    shallowRouting = false,
    startPosition = 0,
    delay = 0,
    style,
    targetPreprocessor,
  }: ProgressBarProps) => {
    const styles = (
      <style>
        {style ||
          `
          #nprogress {
            pointer-events: none;
          }

          #nprogress .bar {
            background: ${color};

            position: fixed;
            z-index: 1031;
            top: 0;
            left: 0;

            width: 100%;
            height: ${height};
          }

          /* Fancy blur effect */
          #nprogress .peg {
            display: block;
            position: absolute;
            right: 0px;
            width: 100px;
            height: 100%;
            box-shadow: 0 0 10px ${color}, 0 0 5px ${color};
            opacity: 1.0;

            -webkit-transform: rotate(3deg) translate(0px, -4px);
                -ms-transform: rotate(3deg) translate(0px, -4px);
                    transform: rotate(3deg) translate(0px, -4px);
          }

          /* Remove these to get rid of the spinner */
          #nprogress .spinner {
            display: block;
            position: fixed;
            z-index: 1031;
            top: 15px;
            right: 15px;
          }

          #nprogress .spinner-icon {
            width: 18px;
            height: 18px;
            box-sizing: border-box;

            border: solid 2px transparent;
            border-top-color: ${color};
            border-left-color: ${color};
            border-radius: 50%;

            -webkit-animation: nprogress-spinner 400ms linear infinite;
                    animation: nprogress-spinner 400ms linear infinite;
          }

          .nprogress-custom-parent {
            overflow: hidden;
            position: relative;
          }

          .nprogress-custom-parent #nprogress .spinner,
          .nprogress-custom-parent #nprogress .bar {
            position: absolute;
          }

          @-webkit-keyframes nprogress-spinner {
            0%   { -webkit-transform: rotate(0deg); }
            100% { -webkit-transform: rotate(360deg); }
          }
          @keyframes nprogress-spinner {
            0%   { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    );

    NProgress.configure(options || {});

    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
      NProgress.done();
    }, [pathname, searchParams]);

    useEffect(() => {
      let timer: NodeJS.Timeout;

      const startProgress = () => {
        timer = setTimeout(() => {
          if (startPosition > 0) NProgress.set(startPosition);
          NProgress.start();
        }, delay);
      };

      const stopProgress = () => {
        clearTimeout(timer);
        NProgress.done();
      };

      const handleAnchorClick = (event: MouseEvent) => {
        const anchorElement = event.currentTarget as
          | HTMLAnchorElement
          | SVGAElement;

        const anchorTarget = getAnchorProperty(anchorElement, 'target');
        // Skip anchors with target="_blank"
        if (anchorTarget === '_blank') return;

        // Skip control/command/option/alt+click
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
          return;

        const targetHref = getAnchorProperty(anchorElement, 'href');
        const targetUrl = targetPreprocessor
          ? targetPreprocessor(new URL(targetHref))
          : new URL(targetHref);
        const currentUrl = new URL(location.href);

        if (shallowRouting && isSameURLWithoutSearch(targetUrl, currentUrl))
          return;
        if (isSameURL(targetUrl, currentUrl)) return;

        startProgress();
      };

      const handleMutation: MutationCallback = () => {
        const anchorElements = Array.from(document.querySelectorAll('a')) as (
          | HTMLAnchorElement
          | SVGAElement
        )[];

        const validAnchorElements = anchorElements.filter((anchor) => {
          const href = getAnchorProperty(anchor, 'href');
          const isNProgressDisabled =
            anchor.getAttribute('data-disable-nprogress') === 'true';
          const isNotTelOrMailto =
            href &&
            !href.startsWith('tel:') &&
            !href.startsWith('mailto:') &&
            !href.startsWith('blob:');

          return (
            !isNProgressDisabled &&
            isNotTelOrMailto &&
            getAnchorProperty(anchor, 'target') !== '_blank'
          );
        });

        validAnchorElements.forEach((anchor) => {
          anchor.addEventListener('click', handleAnchorClick);
        });
      };

      const mutationObserver = new MutationObserver(handleMutation);
      mutationObserver.observe(document, { childList: true, subtree: true });

      window.history.pushState = new Proxy(window.history.pushState, {
        apply: (target, thisArg, argArray: PushStateInput) => {
          stopProgress();
          return target.apply(thisArg, argArray);
        },
      });
    }, []);

    return styles;
  },
  (prevProps, nextProps) => {
    if (!nextProps?.shouldCompareComplexProps) {
      return true;
    }

    return (
      prevProps?.color === nextProps?.color &&
      prevProps?.height === nextProps?.height &&
      prevProps?.shallowRouting === nextProps?.shallowRouting &&
      prevProps?.startPosition === nextProps?.startPosition &&
      prevProps?.delay === nextProps?.delay &&
      JSON.stringify(prevProps?.options) ===
        JSON.stringify(nextProps?.options) &&
      prevProps?.style === nextProps?.style
    );
  },
);

export function useRouter() {
  const router = useNextRouter();

  const startProgress = useCallback(
    (startPosition?: number) => {
      if (startPosition && startPosition > 0) NProgress.set(startPosition);
      NProgress.start();
    },
    [router],
  );

  const progress = useCallback(
    (
      href: string,
      options?: NavigateOptions,
      NProgressOptions?: RouterNProgressOptions,
    ) => {
      if (NProgressOptions?.showProgressBar === false) {
        return router.push(href, options);
      }

      const currentUrl = new URL(location.href);
      const targetUrl = new URL(href, location.href);

      if (isSameURL(targetUrl, currentUrl)) return router.push(href, options);

      startProgress(NProgressOptions?.startPosition);
    },
    [router],
  );

  const push = useCallback(
    (
      href: string,
      options?: NavigateOptions,
      NProgressOptions?: RouterNProgressOptions,
    ) => {
      progress(href, options, NProgressOptions);
      return router.push(href, options);
    },
    [router, startProgress],
  );

  const replace = useCallback(
    (
      href: string,
      options?: NavigateOptions,
      NProgressOptions?: RouterNProgressOptions,
    ) => {
      progress(href, options, NProgressOptions);
      return router.replace(href, options);
    },
    [router, startProgress],
  );

  const back = useCallback(
    (NProgressOptions?: RouterNProgressOptions) => {
      if (NProgressOptions?.showProgressBar === false) return router.back();

      startProgress(NProgressOptions?.startPosition);

      return router.back();
    },
    [router],
  );

  const enhancedRouter = useMemo(() => {
    return { ...router, push, replace, back };
  }, [router, push, replace, back]);

  return enhancedRouter;
}
