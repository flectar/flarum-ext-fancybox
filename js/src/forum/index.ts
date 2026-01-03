import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import CommentPost from 'flarum/forum/components/CommentPost';
import DiscussionListItem from 'flarum/forum/components/DiscussionListItem';
import Discussion from 'flarum/common/models/Discussion';
import Model from 'flarum/common/Model';

import { Carousel, Fancybox } from '@fancyapps/ui';

app.initializers.add('flectar/flarum-fancybox', () => {
  Discussion.prototype.excerpt = Model.attribute<string>('excerpt');

  extend(DiscussionListItem.prototype, 'infoItems', function (items) {
    const excerpt = this.attrs.discussion.excerpt();
    if (excerpt) {
      items.remove('excerpt');
      // @ts-ignore
      items.add('excerpt', m.trust(excerpt), -100);
    }
  });

  extend(DiscussionListItem.prototype, 'oncreate', function () {
    const excerptBody = this.$('.item-excerpt');
    if (excerptBody.length == 0) return;

    excerptBody
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

    excerptBody
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
            const group = (carouselEl.length > 0 ? carouselEl : excerptBody).find(`a[data-fancybox="${groupName}"]`).toArray();
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
  });

  extend(CommentPost.prototype, 'refreshContent', function () {
    if (this.isEditing()) return;

    const postBody = this.$('.Post-body');
    if (postBody.length == 0) return;

    postBody
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

    postBody
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
            const group = (carouselEl.length > 0 ? carouselEl : postBody).find(`a[data-fancybox="${groupName}"]`).toArray();
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
  });
});
