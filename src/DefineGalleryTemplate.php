<?php

namespace Flectar\Fancybox;

use s9e\TextFormatter\Configurator;

class DefineGalleryTemplate
{
    public function __invoke(Configurator $config)
    {
        $tag = $config->tags->add('FANCYBOX-GALLERY');
        $tag->template = '<div class="fancybox-gallery f-carousel"><xsl:apply-templates/></div>';

        $tag = $config->tags->add('FANCYBOX-GALLERY-ITEM');
        $tag->template = '<div class="f-carousel__slide"><xsl:apply-templates/></div>';

        if ($config->tags->exists('IMG')) {
            $tag = $config->tags->get('IMG');
            $newTemplate = $tag->template;
            $tag->template = <<<XML
                <xsl:choose>
                    <xsl:when test="parent::FANCYBOX-GALLERY-ITEM">
                        <a data-fancybox="gallery" href="{@src}">
                            <img data-lazy-src="{@src}" alt="{@alt}" loading="lazy"/>
                        </a>
                    </xsl:when>
                    <xsl:otherwise>
                        <a data-fancybox="single" href="{@src}">
                            <img src="{@src}" alt="{@alt}" loading="lazy"/>
                        </a>
                    </xsl:otherwise>
                </xsl:choose>
            XML;
        }

        if ($config->tags->exists('UPL-IMAGE-PREVIEW')) {
            $tag = $config->tags->get('UPL-IMAGE-PREVIEW');
            $tag->template = <<<XML
                <xsl:choose>
                    <xsl:when test="parent::FANCYBOX-GALLERY-ITEM">
                        <a data-fancybox="gallery" href="{@url}">
                            <img data-lazy-src="{@url}" alt="" loading="lazy"/>
                        </a>
                    </xsl:when>
                    <xsl:otherwise>
                        <a data-fancybox="single" href="{@url}">
                            <img src="{@url}" alt="" loading="lazy"/>
                        </a>
                    </xsl:otherwise>
                </xsl:choose>
            XML;
        }
    }
}