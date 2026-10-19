import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import CommentPost from 'flarum/forum/components/CommentPost';

import { Carousel, Fancybox } from '@fancyapps/ui';

app.initializers.add('flectar/flarum-fancybox', () => {
  extend(CommentPost.prototype, 'refreshContent', function () {
    if (this.isEditing()) return;
    initFancybox(this.$('.Post-body'));
  });

  function initFancybox(container) {
    if (!container || container.length === 0) return;

    // flarum/emoji renders emoji as images too; those stay inline.
    container
      .find('img')
      .not('.fancybox-gallery img, a img, img.emoji')
      .each(function () {
        const $img = $(this);
        const src = $img.attr('src');
        if (src) {
          $img.wrap($('<a data-fancybox="single"></a>').attr('href', src));
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
