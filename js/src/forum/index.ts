import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';
import Comment from 'flarum/forum/components/Comment';
import prepareContent from './prepareContent';
import { listenForClicks, refreshCarousels } from './lightbox';

/** The prepared HTML for each comment, so it is only rebuilt when the post content changes. */
const prepared = new WeakMap<Comment, { source: string; html: string; group: string }>();
let groups = 0;

app.initializers.add('flectar/flarum-fancybox', () => {
  // Core has no hook to transform post HTML before view() renders it, so swap the attr in and call the original.
  // A `Comment#contentHtml()` method is planned for core 2.1; extend that instead once it exists.
  override(Comment.prototype, 'view', function (this: Comment, original) {
    const source = this.attrs.contentHtml;

    if (source && !this.attrs.isEditing) {
      let entry = prepared.get(this);

      if (!entry || entry.source !== source) {
        const group = entry?.group ?? `post-${++groups}`;
        let html = source;

        try {
          html = prepareContent(source, group);
        } catch (error) {
          // override() swallows errors and would render an empty post, so fall back to the original content.
          console.error(error);
        }

        entry = { source, html, group };
        prepared.set(this, entry);
      }

      this.attrs.contentHtml = entry.html;
    }

    return original();
  });

  extend(Comment.prototype, ['oncreate', 'onupdate'], refreshCarousels);

  // onremove runs before Mithril detaches the DOM, so check once it has gone.
  extend(Comment.prototype, 'onremove', () => setTimeout(refreshCarousels));

  listenForClicks();
});
