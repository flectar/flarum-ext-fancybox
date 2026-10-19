# Fancybox for Flarum

[![Latest Stable Version](https://poser.pugx.org/flectar/flarum-fancybox/v)](https://packagist.org/packages/flectar/flarum-fancybox) [![Total Downloads](https://poser.pugx.org/flectar/flarum-fancybox/downloads)](https://packagist.org/packages/flectar/flarum-fancybox) [![License](https://poser.pugx.org/flectar/flarum-fancybox/license)](https://packagist.org/packages/flectar/flarum-fancybox)

![Screenshot](https://github.com/iamdarkle/assets/blob/main/flarum/fancybox/msedge_RSzIbACInH.gif?raw=true)

Opens images in posts in a touch-friendly, zoomable [Fancybox](https://fancyapps.com/fancybox/) lightbox, and shows consecutive images as a swipeable carousel.

## Features

- Every image in a post opens in the lightbox, and you can page through all of the post's images from there.
- Two or more images in a row become a carousel with arrows, including inside quotes, lists and tables.
- The toolbar has zoom, actual size, rotate, flip and a slideshow.
- [fof/upload](https://github.com/FriendsOfFlarum/upload) image previews keep their thumbnail in the post and open the original file in the lightbox.
- Fancyapps UI is only downloaded when it's needed: when a carousel appears or an image is clicked.
- Nothing changes on the server: posts are prepared in the browser, so existing posts work without re-rendering.

## Compatibility

| Extension version | Flarum | PHP | Branch |
| --- | --- | --- | --- |
| 3.x | 2.x | 8.3+ | `2.x` |
| 2.x | 1.8.x | Flarum 1.8 requirements | `1.x` |

## Installation

Run in your Flarum root directory:

```sh
composer require flectar/flarum-fancybox:"^3.0"
php flarum cache:clear
```

Then enable **Fancybox** in the admin dashboard. There is nothing to configure.

## Usage

Click or tap an image in a post to open it. Ctrl/Cmd-click opens the image in a new tab instead.

To make a carousel, put two or more images next to each other, on the same line or on consecutive lines:

```md
![](https://example.com/one.jpg)
![](https://example.com/two.jpg)
```

Leave a blank line between images to keep them separate.

Some images are left alone on purpose:

- Images inside a link keep the author's link.
- Emoji stay inline with the text.
- Images inside an inline spoiler only reveal the spoiler.

## Updating

```sh
composer update flectar/flarum-fancybox
php flarum cache:clear
```

## Troubleshooting

If images don't open after installing or updating, clear the cache with `php flarum cache:clear` and reload the page.

Linked images that were posted while 3.0.0-beta.1 was installed show the raw `[img]` code inside the link. Edit and save the post to fix it.

## Development

Use PHP 8.3+ with Composer, and Node.js with npm. Install Composer dependencies first; TypeScript uses Flarum's type declarations from `vendor/`.

```sh
composer install
composer analyse:phpstan
cd js
npm ci
npm run format-check
npm run check-typings
npm test
npm run build
```

`npm run build` also copies Fancyapps UI's CSS into `less/`. The bundles in `js/dist` are distributed with the extension; CI checks formatting, types, tests and PHPStan, and pushes to `2.x` refresh the committed bundles and CSS.

## License

This extension's own code is released under the [MIT License](LICENSE).

It bundles [Fancyapps UI](https://github.com/fancyapps/ui) v6 (in `js/dist/` and `less/`), which is **not** MIT licensed. Fancyapps UI is distributed under the [Fancyapps UI license](https://fancyapps.com/license), which requires a paid license for production use. Check its terms, and buy a license from [fancyapps.com/pricing](https://fancyapps.com/pricing) where they apply to your forum, before you install this extension.

## Links

- [Discuss](https://discuss.flarum.org/d/29102)
- [Source and issues](https://github.com/flectar/flarum-ext-fancybox)
- [Packagist](https://packagist.org/packages/flectar/flarum-fancybox)
- [Fancybox documentation](https://fancyapps.com/fancybox/)
- [Flectar](https://flectar.com/)
