import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import CommentPost from 'flarum/forum/components/CommentPost';
import DiscussionListItem from 'flarum/forum/components/DiscussionListItem';
import Discussion from 'flarum/common/models/Discussion';
import Model from 'flarum/common/Model';
import { Carousel, Fancybox } from '@fancyapps/ui';

app.initializers.add('flectar/flarum-fancybox', () => {
  const fancyboxOptions = {
    Carousel: {
      infinite: false,
      preload: 1,
    },
    Toolbar: {
      display: {
        left: ['infobar'],
        middle: ['rotateCCW', 'rotateCW', 'flipX', 'flipY'],
        right: ['slideshow', 'close'],
      },
    },
    Images: {
      zoom: true,
    },
    dragToClose: true,
    Hash: false,
  };

  const singleImageOptions = {
    Toolbar: {
      display: {
        left: ['infobar'],
        middle: ['rotateCCW', 'rotateCW', 'flipX', 'flipY'],
        right: ['close'],
      },
    },
    Images: {
      zoom: true,
    },
    dragToClose: true,
    Hash: false,
  };

  const carouselOptions = {
    Dots: false,
    infinite: false,
    dragFree: false,
    preload: 1,
  };

  function initializeFancybox(container: JQuery) {
    container.children('.fancybox-gallery:not(.fancybox-ready)')
      .addClass('fancybox-ready')
      .each((_, gallery) => {
        Carousel(gallery, carouselOptions).init();
        Fancybox.bind(gallery, '[data-fancybox="gallery"]', fancyboxOptions);
      });

    if (container.find('a[data-fancybox="single"]:not(.fancybox-ready)').length > 0) {
      container.find('a[data-fancybox="single"]').addClass('fancybox-ready');
      Fancybox.bind(container[0], '[data-fancybox="single"]', singleImageOptions);
    }
  }

  extend(CommentPost.prototype, 'refreshContent', function () {
    if (this.isEditing()) return;

    const postBody = this.$('.Post-body');
    if (postBody.length === 0) return;

    initializeFancybox(postBody);
  });

  Discussion.prototype.excerpt = Model.attribute<string>('excerpt');

  extend(DiscussionListItem.prototype, 'infoItems', function (items) {
    const excerpt = this.attrs.discussion.excerpt();
    if (excerpt) {
      items.remove('excerpt');
      items.add('excerpt', m.trust(excerpt), -100);
    }
  });

  extend(DiscussionListItem.prototype, 'oncreate', function () {
    const excerptBody = this.$('.item-excerpt');
    if (excerptBody.length === 0) return;

    initializeFancybox(excerptBody);
  });
});
