<?php

/*
 * This file is part of flectar/flarum-fancybox.
 *
 * Copyright (c) 2025 Flectar.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Flectar\Fancybox;

use Flarum\Extend;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->jsDirectory(__DIR__.'/js/dist/forum')
        ->css(__DIR__.'/less/forum.less'),
];
