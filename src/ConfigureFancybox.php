<?php

namespace Flectar\Fancybox;

use s9e\TextFormatter\Configurator;

class ConfigureFancybox
{
    public function __invoke(Configurator $config)
    {
        // TODO: Lazyload transparent placeholder
        if (!$config->tags->exists('FANCYBOX-GALLERY')) {
            $tag = $config->tags->add('FANCYBOX-GALLERY');
            $tag->template = '<div class="fancybox-gallery f-carousel"><xsl:apply-templates/></div>';
        }

        if (!$config->tags->exists('FANCYBOX-GALLERY-ITEM')) {
            $tag = $config->tags->add('FANCYBOX-GALLERY-ITEM');
            $tag->template = '<div class="f-carousel__slide"><xsl:apply-templates/></div>';
        }

        if (!$config->tags->exists('FANCYBOX-IMG')) {
            $tag = $config->tags->add('FANCYBOX-IMG');
            $tag->attributes->add('src');
            $tag->attributes->add('alt');
            $tag->attributes->add('title');
            $tag->template = '<a data-fancybox="gallery" href="{@src}"><img data-lazy-src="{@src}" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="{@title|@alt}" /></a>';
        }

        if ($config->tags->exists('IMG')) {
            $tag = $config->tags->get('IMG');
            $tag->template = <<<'XML'
                <xsl:choose>
                    <xsl:when test="ancestor::DISCUSSION-EXCERPT">
                        <a data-fancybox="excerpt-gallery" href="{@src}">
                            <img src="{@src}" alt="{@title|@alt}" class="excerpt-image"/>
                        </a>
                    </xsl:when>
                    <xsl:when test="parent::FANCYBOX-GALLERY-ITEM">
                        <a data-fancybox="gallery" href="{@src}">
                            <img data-lazy-src="{@src}" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="{@title|@alt}" />
                        </a>
                    </xsl:when>
                    <xsl:otherwise>
                        <a data-fancybox="single" href="{@src}">
                            <img data-lazy-src="{@src}" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="{@title|@alt}" loading="lazy"/>
                        </a>
                    </xsl:otherwise>
                </xsl:choose>
XML;
        }

        if ($config->tags->exists('UPL-IMAGE-PREVIEW')) {
            $tag = $config->tags->get('UPL-IMAGE-PREVIEW');
            $tag->template = <<<'XML'
                <xsl:choose>
                    <xsl:when test="ancestor::DISCUSSION-EXCERPT">
                        <a data-fancybox="excerpt-gallery" href="{@url}">
                            <img src="{@url}" alt="" class="excerpt-image"/>
                        </a>
                    </xsl:when>
                    <xsl:when test="parent::FANCYBOX-GALLERY-ITEM">
                        <a data-fancybox="gallery" href="{@url}">
                            <img data-lazy-src="{@url}" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" />
                        </a>
                    </xsl:when>
                    <xsl:otherwise>
                        <a data-fancybox="single" href="{@url}">
                            <img data-lazy-src="{@url}" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" loading="lazy"/>
                        </a>
                    </xsl:otherwise>
                </xsl:choose>
XML;
        }
    }
}
