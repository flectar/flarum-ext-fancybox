/**
 * fof/upload's "image preview" template: a link to the original file around a
 * (usually WebP) thumbnail. The lightbox opens the link target, the original.
 */
const UPLOAD_PREVIEW_LINK = 'a.FoFUpload--Upl-Image-Preview-Link';

/** Only web URLs become links; anything else (`javascript:`, `data:`) stays a plain image. */
const WEB_URL = /^(https?:|\/)/i;

/** Containers a block-level gallery may sit in directly; anywhere else it would be invalid HTML. */
const FLOW_CONTAINERS = new Set(['DIV', 'BLOCKQUOTE', 'LI', 'TD', 'TH', 'DD', 'DETAILS', 'SECTION', 'ARTICLE', 'ASIDE', 'FIGURE']);

/**
 * Prepare rendered post HTML for the lightbox:
 *
 * - every image that isn't already inside an author's link opens in the
 *   lightbox, as does every fof/upload image preview;
 * - two or more of those in a row (separated by nothing but whitespace or line
 *   breaks) become a carousel.
 *
 * All triggers share the `data-fancybox` value `group`, so the lightbox can page
 * through every image in the post.
 *
 * This works on the HTML string rather than the live DOM so that Mithril, which
 * renders the result with m.trust(), keeps track of every node.
 */
export default function prepareContent(html: string, group: string): string {
  if (!html || !html.includes('<img')) return html;

  const template = document.createElement('template');
  template.innerHTML = html;
  const root = template.content;

  let found = false;

  root.querySelectorAll<HTMLAnchorElement>(UPLOAD_PREVIEW_LINK).forEach((link) => {
    if (!WEB_URL.test(link.getAttribute('href') || '')) return;

    markTrigger(link, group);
    found = true;
  });

  root.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src');

    // An inline spoiler reveals itself on click, which would open the lightbox at the same time.
    if (!src || !WEB_URL.test(src) || img.classList.contains('emoji') || img.closest('a, span.spoiler')) return;

    const link = document.createElement('a');
    link.setAttribute('href', src);
    markTrigger(link, group);
    img.replaceWith(link);
    link.appendChild(img);
    found = true;
  });

  if (!found) return html;

  const triggers = Array.from(root.querySelectorAll<HTMLElement>('a[data-fancybox]'));
  const grouped = new Set<HTMLElement>();

  for (const trigger of triggers) {
    if (grouped.has(trigger)) continue;

    const run = [trigger];
    let node = trigger.nextSibling;

    while (node) {
      if (isTrigger(node)) run.push(node);
      else if (!isSeparator(node)) break;

      node = node.nextSibling;
    }

    run.forEach((t) => grouped.add(t));

    if (run.length > 1) makeGallery(run);
  }

  return template.innerHTML;
}

function markTrigger(link: HTMLElement, group: string) {
  link.setAttribute('data-fancybox', group);
  // Fancybox otherwise guesses the type from the URL, and opens e.g. `avatar.php?id=3` in an iframe.
  link.setAttribute('data-type', 'image');
}

function isSeparator(node: Node): boolean {
  return (node.nodeType === Node.TEXT_NODE && !node.textContent!.trim()) || (node instanceof HTMLElement && node.tagName === 'BR');
}

function hasContent(node: Node): boolean {
  return Array.from(node.childNodes).some((child) => !isSeparator(child));
}

/** Remove line breaks and whitespace from one end of a node's children. */
function trim(node: Node, end: 'start' | 'end') {
  let child = end === 'start' ? node.firstChild : node.lastChild;

  while (child && isSeparator(child)) {
    const next = end === 'start' ? child.nextSibling : child.previousSibling;
    child.remove();
    child = next;
  }
}

function makeGallery(run: HTMLElement[]) {
  const parent = run[0].parentNode!;
  const first = run[0];
  const last = run[run.length - 1];

  const isParagraph = parent instanceof HTMLElement && parent.tagName === 'P';
  const isFlow = parent instanceof DocumentFragment || (parent instanceof HTMLElement && FLOW_CONTAINERS.has(parent.tagName));

  // A gallery inside phrasing content (bold text, a span, …) would not be valid HTML, so those images stay single.
  if (!isParagraph && !isFlow) return;

  const gallery = document.createElement('div');
  gallery.className = 'fancybox-gallery f-carousel';

  if (isParagraph) {
    // A <div> can't sit inside a <p>: split the paragraph around the gallery.
    const before = parent.cloneNode(false);
    const after = parent.cloneNode(false);

    while (parent.firstChild !== first) before.appendChild(parent.firstChild!);
    while (last.nextSibling) after.appendChild(last.nextSibling);

    trim(before, 'end');
    trim(after, 'start');

    parent.replaceWith(...[before, gallery, after].filter((n) => n === gallery || hasContent(n)));
  } else {
    parent.insertBefore(gallery, first);
  }

  // Separators between the images are dropped: each image gets its own slide.
  let node: ChildNode | null = first;

  while (node) {
    const next: ChildNode | null = node === last ? null : node.nextSibling;

    if (isTrigger(node)) {
      const slide = document.createElement('div');
      slide.className = 'f-carousel__slide';
      slide.appendChild(node);
      gallery.appendChild(slide);
    } else {
      node.remove();
    }

    node = next;
  }

  if (!isParagraph) {
    trimSiblings(gallery);
  }
}

function isTrigger(node: Node): node is HTMLElement {
  return node instanceof HTMLElement && node.matches('a[data-fancybox]');
}

/** Drop line breaks left directly around a gallery placed in a flow container. */
function trimSiblings(gallery: HTMLElement) {
  while (gallery.previousSibling && isSeparator(gallery.previousSibling)) gallery.previousSibling.remove();
  while (gallery.nextSibling && isSeparator(gallery.nextSibling)) gallery.nextSibling.remove();
}
