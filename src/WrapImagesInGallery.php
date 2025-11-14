<?php

namespace Flectar\Fancybox;

use s9e\TextFormatter\Renderer;

class WrapImagesInGallery
{
    const MATCH_IMG_TAGS = '((?:<UPL-IMAGE-PREVIEW[^>]*>(?:(?!<\/UPL-IMAGE-PREVIEW>).)*<\/UPL-IMAGE-PREVIEW>)|(?:<IMG[^>]*>(?:(?!<\/IMG>).)*<\/IMG>))';
    const MATCH_GALLERY_REGEX = '((?:'.self::MATCH_IMG_TAGS.'(?:\s*(?:<br\/>|<br>|\n)\s*)?){2,})';

    public function __invoke(Renderer $renderer, $context, string $xml): string
    {
        return preg_replace_callback('/'.self::MATCH_GALLERY_REGEX.'/m', function ($matches) {
            $images = array_filter(preg_split('/\s*(?:<br\/>|<br>|\n)\s*/', $matches[0]), function($img) {
                return !empty($img);
            });
            
            $galleryItems = array_map(function($img) {
                return '<FANCYBOX-GALLERY-ITEM>' . trim($img) . '</FANCYBOX-GALLERY-ITEM>';
            }, $images);
            
            return '<FANCYBOX-GALLERY>' . implode('', $galleryItems) . '</FANCYBOX-GALLERY>';
        }, $xml);
    }
}
