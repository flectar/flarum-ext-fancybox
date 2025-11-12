<?php

/*
 * This file is part of flectar/flarum-fancybox.
 *
 * Copyright (c) 2025 Flectar.
 *
 * For the full copyright and license information, please view the LICENSE.md
 * file that was distributed with this source code.
 */

namespace Flectar\Fancybox;

use Flarum\Extend;
use Flectar\Fancybox\WrapImagesInGallery;
use Flectar\Fancybox\DefineGalleryTemplate;
use Flectar\Fancybox\AddExcerptToDiscussion;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less'),

    (new Extend\Formatter)
        ->configure(DefineGalleryTemplate::class)
        ->configure(AddExcerptToDiscussion::class)
        ->render(WrapImagesInGallery::class),
 
    (new Extend\ApiSerializer(\Flarum\Api\Serializer\DiscussionSerializer::class))
        ->attribute('excerpt', function ($serializer, $discussion) {
            return $discussion->firstPost ? $discussion->firstPost->formatContent() : null;
        }),
];