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
use Flarum\Api\Context;
use Flarum\Api\Endpoint;
use Flarum\Api\Resource;
use Flarum\Api\Schema;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less'),

    (new Extend\Formatter)
        ->configure(DefineGalleryTemplate::class)
        ->configure(AddExcerptToDiscussion::class)
        ->render(WrapImagesInGallery::class),
 
    // @TODO: Replace with the new implementation https://docs.flarum.org/2.x/extend/api#extending-api-resources
    (new Extend\ApiSerializer(\Flarum\Api\Serializer\DiscussionSerializer::class))
        ->attribute('excerpt', function ($serializer, $discussion) {
            return $discussion->firstPost ? $discussion->firstPost->formatContent() : null;
        }),
];