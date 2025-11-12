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
use Flarum\Discussion\Discussion;
use Flarum\Api\Resource\DiscussionResource;
use Flarum\Api\Schema;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less'),

    (new Extend\Formatter)
        ->configure(DefineGalleryTemplate::class)
        ->configure(AddExcerptToDiscussion::class)
        ->render(WrapImagesInGallery::class),

    (new Extend\ApiResource(DiscussionResource::class))
        ->fields(fn () => [
            Schema\Str::make('excerpt')
                ->get(fn (Discussion $discussion) => $discussion->firstPost ? $discussion->firstPost->formatContent() : null),
        ]),
];
