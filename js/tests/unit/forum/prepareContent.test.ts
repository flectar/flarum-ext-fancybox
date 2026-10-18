import prepareContent from '../../../src/forum/prepareContent';

const GROUP = 'post-1';

/** Parse HTML the way m.trust() will, so tests see what the browser sees. */
function parse(html: string): HTMLElement {
  const el = document.createElement('div');
  el.innerHTML = html;
  return el;
}

function prepare(html: string): HTMLElement {
  return parse(prepareContent(html, GROUP));
}

const upload = (url: string, thumb: string) =>
  `<a href="${url}" target="_blank" rel="noopener noreferrer" class="FoFUpload--Upl-Image-Preview-Link"><img class="FoFUpload--Upl-Image-Preview" src="${thumb}" title="a.png" alt="a.png" data-id="u1" loading="lazy" width="10" height="10"></a>`;

describe('prepareContent: single images', () => {
  it('wraps a lone core image in a lightbox link to itself', () => {
    const out = prepare('<p>Look <img src="http://a/1.png" alt="one" title="t" width="5" height="6"> here</p>');
    const link = out.querySelector('a')!;

    expect(link.getAttribute('href')).toBe('http://a/1.png');
    expect(link.getAttribute('data-fancybox')).toBe(GROUP);
    expect(link.querySelector('img')!.outerHTML).toBe('<img src="http://a/1.png" alt="one" title="t" width="5" height="6">');
    expect(out.querySelector('.fancybox-gallery')).toBeNull();
  });

  it('leaves an image inside an author link alone', () => {
    const html = '<p><a href="http://big/x" rel="ugc nofollow"><img src="http://a/1.png" alt=""></a></p>';

    expect(prepareContent(html, GROUP)).toBe(html);
  });

  it('opens the original for a fof/upload preview, keeping the webp thumbnail in the post', () => {
    const out = prepare(`<p>${upload('http://a/orig.png', 'http://a/thumb.webp')}</p>`);
    const link = out.querySelector('a')!;

    expect(link.getAttribute('href')).toBe('http://a/orig.png');
    expect(link.getAttribute('data-fancybox')).toBe(GROUP);
    expect(link.querySelector('img')!.getAttribute('src')).toBe('http://a/thumb.webp');
    expect(out.querySelectorAll('a')).toHaveLength(1);
  });

  it('ignores a fof/upload preview with no URL', () => {
    const html = `<p>${upload('', '')}</p>`;

    expect(prepare(html).querySelector('[data-fancybox]')).toBeNull();
  });

  it('ignores images with no src, and emoji', () => {
    const out = prepare('<p><img src="" alt="x"> <img class="emoji" src="http://e/1f600.png" alt="😀"></p>');

    expect(out.querySelector('[data-fancybox]')).toBeNull();
  });

  it('tells the lightbox every trigger is an image, whatever its URL looks like', () => {
    const out = prepare(`<p><img src="http://a/avatar.php?id=3"> ${upload('http://a/doc.html', 'http://a/t.webp')}</p>`);
    const types = Array.from(out.querySelectorAll('a[data-fancybox]')).map((a) => a.getAttribute('data-type'));

    expect(types).toEqual(['image', 'image']);
  });

  it('only links images with web URLs', () => {
    const out = prepare(
      '<p><img src="javascript:alert(1)"> <img src="data:image/png;base64,AAAA"> <img src="/assets/a.png"> <img src="HTTPS://a/b.png"></p>'
    );

    expect(Array.from(out.querySelectorAll('a[data-fancybox]')).map((a) => a.getAttribute('href'))).toEqual(['/assets/a.png', 'HTTPS://a/b.png']);
  });

  it('leaves images in inline spoilers alone, so revealing one does not open the lightbox', () => {
    const html = '<p><span class="spoiler" onclick="removeAttribute(\'class\')"><img src="http://a/1.png"></span></p>';

    expect(prepareContent(html, GROUP)).toBe(html);
  });

  it('returns content without images unchanged', () => {
    const html = '<p>Hello <strong>world</strong></p>';

    expect(prepareContent(html, GROUP)).toBe(html);
  });
});

describe('prepareContent: galleries', () => {
  it('turns a paragraph of images into a carousel, not a div inside a p', () => {
    const out = prepare('<p><img src="http://a/1.png" alt=""><br>\n<img src="http://a/2.png" alt=""></p>');
    const gallery = out.querySelector('.fancybox-gallery.f-carousel')!;

    expect(gallery).not.toBeNull();
    expect(gallery.parentElement).toBe(out);
    expect(out.querySelector('p')).toBeNull();
    expect(gallery.querySelector('br')).toBeNull();

    const slides = gallery.querySelectorAll(':scope > .f-carousel__slide');
    expect(slides).toHaveLength(2);
    expect(slides[0].querySelector('a[data-fancybox]')!.getAttribute('href')).toBe('http://a/1.png');
    expect(slides[1].querySelector('a[data-fancybox]')!.getAttribute('href')).toBe('http://a/2.png');
  });

  it('gives adjacent and space-separated images a slide each', () => {
    const out = prepare('<p><img src="http://a/1.png"><img src="http://a/2.png"> <img src="http://a/3.png"></p>');

    expect(out.querySelectorAll('.f-carousel__slide')).toHaveLength(3);
  });

  it('splits the paragraph around the gallery, keeping text before and after', () => {
    const out = prepare('<p>Before<br>\n<img src="http://a/1.png"><br>\n<img src="http://a/2.png"><br>\nAfter</p>');
    const children = Array.from(out.children);

    expect(children.map((c) => c.tagName + '.' + c.className)).toEqual(['P.', 'DIV.fancybox-gallery f-carousel', 'P.']);
    expect(children[0].textContent!.trim()).toBe('Before');
    expect(children[0].querySelector('br')).toBeNull();
    expect(children[2].textContent!.trim()).toBe('After');
  });

  it('groups fof/upload previews with core images', () => {
    const out = prepare(
      `<p>${upload('http://a/o1.png', 'http://a/t1.webp')}<br>${upload('http://a/o2.png', 'http://a/t2.webp')}<br><img src="http://a/3.png"></p>`
    );

    expect(out.querySelectorAll('.f-carousel__slide')).toHaveLength(3);
  });

  it('builds galleries inside quotes', () => {
    const out = prepare('<blockquote class="uncited"><div><p><img src="http://a/1.png"><br><img src="http://a/2.png"></p></div></blockquote>');

    expect(out.querySelector('blockquote > div > .fancybox-gallery')).not.toBeNull();
    expect(out.querySelector('p .fancybox-gallery')).toBeNull();
  });

  it('builds galleries at the top level, for posts without paragraphs', () => {
    const out = prepare('<img src="http://a/1.png"><br>\n<img src="http://a/2.png">');

    expect(out.querySelector(':scope > .fancybox-gallery')).not.toBeNull();
  });

  it('does not group images separated by text', () => {
    const out = prepare('<p><img src="http://a/1.png"> and <img src="http://a/2.png"></p>');

    expect(out.querySelector('.fancybox-gallery')).toBeNull();
    expect(out.querySelectorAll('a[data-fancybox]')).toHaveLength(2);
  });

  it('does not group a linked image with lightbox images', () => {
    const out = prepare('<p><img src="http://a/1.png"><br><a href="http://x"><img src="http://a/2.png"></a></p>');

    expect(out.querySelector('.fancybox-gallery')).toBeNull();
  });

  it('survives being parsed again unchanged', () => {
    const once = prepareContent('<p>Hi<br><img src="http://a/1.png"><img src="http://a/2.png"></p><p><img src="http://a/3.png"></p>', GROUP);

    expect(parse(once).innerHTML).toBe(once);
  });
});
