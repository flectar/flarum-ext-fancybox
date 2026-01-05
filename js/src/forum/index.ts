import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import CommentPost from 'flarum/forum/components/CommentPost';
import DiscussionListItem from 'flarum/forum/components/DiscussionListItem';
import Discussion from 'flarum/common/models/Discussion';
import Model from 'flarum/common/Model';

import { Carousel, Fancybox } from '@fancyapps/ui';

app.initializers.add('flectar/flarum-fancybox', () => {
  const isExcerptEnabled = () => {
    const val = app.forum.attribute('flectar-fancybox.excerpt_enabled');
    return val === '1' || val === true || val === 1;
  };

  Discussion.prototype.excerpt = Model.attribute<string>('excerpt');

  extend(DiscussionListItem.prototype, 'infoItems', function (items) {
    if (!isExcerptEnabled()) return;
    const excerpt = this.attrs.discussion.excerpt();
    if (excerpt) {
      items.remove('excerpt');
      // @ts-ignore
      items.add('excerpt', m.trust(excerpt), -100);
    }
  });

  extend(DiscussionListItem.prototype, 'oncreate', function () {
    if (!isExcerptEnabled()) return;
    initFancybox(this.$('.item-excerpt'));
  });

  extend(CommentPost.prototype, 'refreshContent', function () {
    if (this.isEditing()) return;
    initFancybox(this.$('.Post-body'));
  });

  function initFancybox(container) {
    if (!container || container.length === 0) return;

    container
      .find('img')
      .not('.fancybox-gallery img, a > img')
      .each(function () {
        const $img = $(this);
        const src = $img.attr('src');
        if (src) {
          $img.wrap(`<a data-fancybox="single" href="${src}"></a>`);
        }
      });

    container
      .children('.fancybox-gallery:not(.fancybox-ready)')
      .addClass('fancybox-ready')
      .each((_, gallery) => {
        new Carousel(gallery, {
          Dots: false,
          infinite: false,
          dragFree: false,
          preload: 0,
        });
      });

    container
      .find('a[data-fancybox]:not(.fancybox-ready)')
      .addClass('fancybox-ready')
      .each((_, el) => {
        const link = $(el);
        let isDragging = false;
        let startX: number, startY: number;

        link
          .on('mousedown', (e) => {
            isDragging = false;
            startX = e.clientX;
            startY = e.clientY;
          })
          .on('mousemove', (e) => {
            if (Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5) {
              isDragging = true;
            }
          })
          .on('click', (e) => {
            e.preventDefault();
            if (isDragging) return;

            const groupName = link.attr('data-fancybox');
            const carouselEl = link.closest('.fancybox-gallery');
            let group;

            if (carouselEl.length > 0) {
              group = carouselEl.find(`a[data-fancybox="${groupName}"]`).toArray();
            } else {
              group = container.find(`a[data-fancybox="${groupName}"]`).toArray();
            }

            const startIndex = group.indexOf(el);

            Fancybox.fromNodes(group, {
              Carousel: {
                infinite: false,
                preload: 0,
              },
              Toolbar: {
                display: {
                  left: ['infobar'],
                  middle: ['rotateCCW', 'rotateCW', 'flipX', 'flipY'],
                  right: ['slideshow', 'fullscreen', 'close'],
                },
              },
              Images: {
                initialSize: 'fit' as 'fit',
              },
              dragToClose: true,
              Hash: false,
              startIndex,
            });
          });
      });
  }
});
