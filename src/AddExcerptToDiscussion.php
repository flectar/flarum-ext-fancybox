<?php

namespace Darkle\Fancybox;

use s9e\TextFormatter\Configurator;

class AddExcerptToDiscussion
{
    public function __invoke(Configurator $config)
    {
        if ($config->tags->exists('IMG')) {
            $tag = $config->tags->get('IMG');
            $originalTemplate = $tag->template;
            $tag->template = <<<XML
                <xsl:choose>
                    <xsl:when test="ancestor::DISCUSSION-EXCERPT">
                        <a data-fancybox="excerpt-gallery" href="{@src}">
                            <img data-lazy-src="{@src}" alt="{@alt}" class="excerpt-image"/>
                        </a>
                    </xsl:when>
                    <xsl:otherwise>
                        {$originalTemplate}
                    </xsl:otherwise>
                </xsl:choose>
            XML;
        }

        if ($config->tags->exists('UPL-IMAGE-PREVIEW')) {
            $tag = $config->tags->get('UPL-IMAGE-PREVIEW');
            $originalTemplate = $tag->template;
            $tag->template = <<<XML
                <xsl:choose>
                    <xsl:when test="ancestor::DISCUSSION-EXCERPT">
                        <a data-fancybox="excerpt-gallery" href="{@url}">
                            <img data-lazy-src="{@url}" alt="" class="excerpt-image"/>
                        </a>
                    </xsl:when>
                    <xsl:otherwise>
                        {$originalTemplate}
                    </xsl:otherwise>
                </xsl:choose>
            XML;
        }
    }
}
