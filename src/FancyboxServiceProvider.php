<?php

namespace Flectar\Fancybox;

use Flarum\Foundation\AbstractServiceProvider;

class FancyboxServiceProvider extends AbstractServiceProvider
{
    public function register()
    {
        $this->container->resolving('flarum.formatter', function ($formatter) {
            $formatter->addConfigurationCallback(function ($configurator) {
                $tag = $configurator->tags->add('FANCYBOX-GALLERY');
                $tag->template = '<div class="fancybox-gallery f-carousel"><xsl:apply-templates/></div>';
                
                $tag = $configurator->tags->add('FANCYBOX-GALLERY-ITEM');
                $tag->template = '<div class="f-carousel__slide"><xsl:apply-templates/></div>';
                
                if ($configurator->tags->exists('IMG')) {
                    $tag = $configurator->tags->get('IMG');
                    $tag->template = <<<'XML'
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
                
                if ($configurator->tags->exists('UPL-IMAGE-PREVIEW')) {
                    $tag = $configurator->tags->get('UPL-IMAGE-PREVIEW');
                    $tag->template = <<<'XML'
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
            });
        });
    }
}
