<?php

namespace Flectar\Fancybox;

use Flarum\Foundation\AbstractServiceProvider;
use Illuminate\Contracts\Container\Container;

class FancyboxServiceProvider extends AbstractServiceProvider
{
    public function register()
    {
        $this->container->resolving('flarum.formatter', function ($formatter, $container) {
            $formatter->addConfigurationCallback(function ($configurator) {
                if (!$configurator->tags->exists('FANCYBOX-GALLERY')) {
                    $tag = $configurator->tags->add('FANCYBOX-GALLERY');
                    $tag->template = '<div class="fancybox-gallery f-carousel"><xsl:apply-templates/></div>';
                }
                
                if (!$configurator->tags->exists('FANCYBOX-GALLERY-ITEM')) {
                    $tag = $configurator->tags->add('FANCYBOX-GALLERY-ITEM');
                    $tag->template = '<div class="f-carousel__slide" data-fancybox="gallery" data-src="{.//IMG/@src | .//UPL-IMAGE-PREVIEW/@url}"><xsl:apply-templates/></div>';
                }
                
                if ($configurator->tags->exists('IMG')) {
                    $tag = $configurator->tags->get('IMG');
                    $tag->template = <<<'XML'
                        <xsl:choose>
                            <xsl:when test="parent::FANCYBOX-GALLERY-ITEM">
                                <a href="{@src}">
                                    <img src="{@src}" alt="{@alt}" loading="lazy"/>
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
                                <a href="{@url}">
                                    <img src="{@url}" alt="" loading="lazy"/>
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

    public function boot(Container $container)
    {

    }
}
