import type { FancyboxOptions } from '@fancyapps/ui/dist/fancybox/fancybox';
import type { CarouselInstance } from '@fancyapps/ui/dist/carousel/carousel';

type Fancyapps = typeof import('./fancyapps');

let library: Promise<Fancyapps> | null = null;

function load(): Promise<Fancyapps> {
  // Forget a failed load (e.g. a network blip) so the next click can try again.
  return (library ??= import('./fancyapps').catch((error) => {
    library = null;
    throw error;
  }));
}

const fancyboxOptions: Partial<FancyboxOptions> = {
  Hash: false,
  dragToClose: true,
  Carousel: {
    infinite: false,
    Toolbar: {
      display: {
        left: ['counter'],
        middle: ['zoomIn', 'zoomOut', 'toggle1to1', 'rotateCCW', 'rotateCW', 'flipX', 'flipY'],
        right: ['autoplay', 'close'],
      },
    },
  },
};

/**
 * Open the lightbox when a trigger is clicked, paging through every trigger in
 * the same group (the same post). One delegated listener covers every post,
 * so nothing has to be bound or unbound as posts come and go.
 */
export function listenForClicks() {
  document.addEventListener('click', (e: MouseEvent) => {
    // Let the browser handle new-tab clicks; a drag in a carousel cancels its own click.
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    // Only post content: a theme or another extension may use `data-fancybox` for its own lightbox.
    const trigger = (e.target as Element | null)?.closest<HTMLElement>('.Post-body a[data-fancybox]');
    if (!trigger) return;

    e.preventDefault();

    const group = Array.from(document.querySelectorAll<HTMLElement>(`.Post-body a[data-fancybox="${CSS.escape(trigger.dataset.fancybox!)}"]`));

    load().then(
      ({ Fancybox }) => Fancybox.fromNodes(group, { ...fancyboxOptions, startIndex: group.indexOf(trigger) }),
      () => window.open((trigger as HTMLAnchorElement).href, '_blank', 'noopener')
    );
  });
}

const carousels = new Map<HTMLElement, CarouselInstance>();

/** Start any carousels that have appeared on the page, and stop any that have gone. */
export function refreshCarousels() {
  carousels.forEach((carousel, el) => {
    if (!el.isConnected) {
      carousel.destroy();
      carousels.delete(el);
    }
  });

  const pending = Array.from(document.querySelectorAll<HTMLElement>('.fancybox-gallery')).filter((el) => !carousels.has(el));
  if (!pending.length) return;

  load().then(({ Carousel, Arrows }) => {
    pending.forEach((el) => {
      // The chunk may arrive after the post has gone, or after another call started this one.
      if (!el.isConnected || carousels.has(el)) return;

      carousels.set(el, Carousel(el, { infinite: false }, { Arrows }).init());
      el.classList.add('is-ready');
    });
  });
}
