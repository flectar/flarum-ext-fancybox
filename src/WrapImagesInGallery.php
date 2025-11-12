<?php

namespace Flectar\Fancybox;

use s9e\TextFormatter\Renderer;

class WrapImagesInGallery
{
    public function __invoke(Renderer $renderer, $context, string $xml): string
    {
        $pattern = '/' .
            '(?:<[IPr]\s[^>]*>)*' .
            '(' .
                '(?:' .
                    '(?:<IMG[^>]*>(?:<\/IMG>)?|<UPL-IMAGE-PREVIEW[^>]*>(?:<\/UPL-IMAGE-PREVIEW>)?)' .
                    '(?:\s*<[br]\s*\/?>\s*)*' .
                '){2,}' .
            ')' .
            '(?:<\/[IPr]>)*' .
            '/s';

        return preg_replace_callback($pattern, function ($matches) {
            $imagesBlock = $matches[1];
            
            $images = preg_split('/<[br]\s*\/?>/', $imagesBlock);
            $images = array_filter(array_map('trim', $images));

            if (count($images) < 2) {
                return $matches[0];
            }

            $wrappedImages = array_map(function($img) {
                return '<FANCYBOX-GALLERY-ITEM>' . $img . '</FANCYBOX-GALLERY-ITEM>';
            }, $images);

            return '<FANCYBOX-GALLERY>' . implode('', $wrappedImages) . '</FANCYBOX-GALLERY>';
        }, $xml);
    }
}
