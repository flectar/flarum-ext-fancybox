/**
 * fof/upload's "image preview" template: a link to the original file around a
 * (usually WebP) thumbnail. The lightbox opens the link target, the original.
 */
const UPLOAD_PREVIEW_LINK = 'a.FoFUpload--Upl-Image-Preview-Link';

/** Only web URLs become links; anything else (`javascript:`, `data:`) stays a plain image. */
const WEB_URL = /^(https?:|\/)/i;

/** Containers a block-level gallery may sit in directly; anywhere else it would be invalid HTML. */
const FLOW_CONTAINERS = new Set(['DIV', 'BLOCKQUOTE', 'LI', 'TD', 'TH', 'DD', 'DETAILS', 'SECTION', 'ARTICLE', 'ASIDE', 'FIGURE']);

/** Lets a theme or another extension keep an image, or everything inside an element, out of the lightbox. */
const OPTED_OUT = '[data-fancybox-ignore], [data-fancybox-ignore] *';

/**
 * Images that stay plain, besides those opted out:
 *
 * - an author's link already says where the image goes;
 * - an inline spoiler reveals itself on click, which would open the lightbox at the same time;
 * - Flamoji's custom emoji (`<span class="flamoji"><img></span>`) are inline text, like core's `img.emoji`.
 */
const PLAIN_IMAGE_CONTAINERS = 'a, span.spoiler, span.flamoji';

/**
 * Prepare rendered post HTML for the lightbox:
 *
 * - every image that isn't already inside an author's link opens in the
 *   lightbox, as does every fof/upload image preview;
 * - two or more of those on consecutive lines, each alone on its line, become a
 *   carousel. Images that share a line with each other (a row of badges, say)
 *   or with text are meant to be seen in place, so they stay as they are.
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
    if (!WEB_URL.test(link.getAttribute('href') || '') || link.matches(OPTED_OUT)) return;

    markTrigger(link, group);
    found = true;
  });

  root.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src');

    if (!src || !WEB_URL.test(src) || img.classList.contains('emoji') || img.matches(OPTED_OUT) || img.closest(PLAIN_IMAGE_CONTAINERS)) return;

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
    // A trigger partway along a line shares it with text or another image, so it stays inline.
    if (grouped.has(trigger) || !startsLine(trigger)) continue;

    const run = collectRun(trigger);

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

function isLineBreak(node: Node): boolean {
  return node instanceof HTMLElement && node.tagName === 'BR';
}

function isWhitespace(node: Node): boolean {
  return node.nodeType === Node.TEXT_NODE && !node.textContent!.trim();
}

function isSeparator(node: Node): boolean {
  return isWhitespace(node) || isLineBreak(node);
}

/** Whether nothing but whitespace comes before the node on its line. */
function startsLine(node: Node): boolean {
  let prev = node.previousSibling;

  while (prev && isWhitespace(prev)) prev = prev.previousSibling;

  return !prev || isLineBreak(prev);
}

/**
 * The triggers on the lines starting with `first`, up to the first line that
 * holds anything but a single trigger. Blank lines don't end the run.
 */
function collectRun(first: HTMLElement): HTMLElement[] {
  const run: HTMLElement[] = [];
  let current: HTMLElement | null = null;
  let node: ChildNode | null = first;

  while (true) {
    if (!node || isLineBreak(node)) {
      if (current) run.push(current);
      if (!node) break;

      current = null;
    } else if (isTrigger(node) && !current) {
      current = node;
    } else if (!isWhitespace(node)) {
      // Another image or some text on the line: it is meant to be seen as it is.
      break;
    }

    node = node.nextSibling;
  }

  return run;
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
