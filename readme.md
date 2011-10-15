node-datauri(1) -- node-script to automate the embedding of base64 images in CSS files
======================================================================================

## Usage

    datauri path/to/css/file.css
    datauri css/*.css

## Description

quick experiment on datauris / mhtml images embedding.

## Quick start

Install the package

      git clone git://github.com:mklabs/node-datauris.git && cd node-datauris && npm link

once in npm, running `npm install` will be easier, but for now a git clone + npm link is enough.

To run the script on the example files in css/, first, get the icon set.

      wget wget http://www.famfamfam.com/lab/icons/silk/famfamfam_silk_icons_v013.zip
      unzip famfamfam_silk_icons_v013.zip -d images/

then run

    datauri examples/example.css

## documentation

To display the documentation (simply this readme for now), just run

    datauri help

## Ressources

* http://www.nczonline.net/blog/2009/10/27/data-uris-explained/
* http://www.nczonline.net/blog/2009/11/03/automatic-data-uri-embedding-in-css-files/
* http://nimbupani.com/using-data-uris-in-css.html
* http://www.phpied.com/data-urls-what-are-they-and-how-to-use/
* http://www.phpied.com/mhtml-when-you-need-data-uris-in-ie7-and-under/
* http://www.phpied.com/data-uris-mhtml-ie7-win7-vista-blues/
* http://www.phpied.com/inline-mhtml-data-uris/
* http://www.stevesouders.com/blog/2009/11/16/cssembed-automatically-data-uri-ize/
* http://msdn.microsoft.com/en-us/library/ms526265(v=exchg.10).aspx
* http://documentcloud.github.com/jammit/#embedding

Recommandation from documentcloud/jammit:

It's not recommended to embed all of your site's images, just the ones that conform to the following three rules:

* Images that are small. Large images will simply delay the rendering of your CSS. Jammit won't embed images larger than 32 kilobytes, because Internet Explorer 8 won't render them.
* Images that are immediately visible. It's better to leave the images that are hidden at page load time to download in the background.
* Images that are referenced by a single CSS rule. Referencing the same embedded image in multiple rules will cause that image's contents to be embedded more than once, defeating the purpose. Replace the duplicated rules with an image-specific HTML class, and you're good to go.

## Plan

* only images that are small < 32kilobytes
* dealing with IE < 8: use of mhtml

use of datauris for modern browser, use of mhtml for IE < 8

with a build script, using stoyan's snippet

    #myid {
      /* normal browsers */
      background-image: url("data:image/png;base64,iVBORw0[...snip...]");
      /* IE < 8 targeted with the star hack */
      *background-image: url(mhtml:http://phpied.com/mhtml.css!somestring);
    }

or with `<html />` [conditional comments](http://html5boilerplate.com/docs/The-markup/#ie-html-tag-classes)

    .mystuff {
      /* normal browsers */
      background-image: url("data:image/png;base64,iVBORw0[...snip...]");
    }

    .ie6 .mystuff, .ie7 .mystuff {
      /* IE < 8 */
      background-image: url(mhtml:http://phpied.com/mhtml.css!somestring);
    }

mhtml: have to use absolute urls.. http://msdn.microsoft.com/en-us/library/ms526265(v=exchg.10).aspx

* Content-Base gives an absolute URL base, or "starting point",for relative URLs that appear in other MIME headers and in HTML documents that do not contain any BASE HTML elements. Content-Location specifies the URL that corresponds to the content of the body part that contains this header.

## Drawbacks

* inlining image content twice
* overall css size increase

to avoid double size increase, probably the best way to use both
datauris/mhtml would be to rely on something like [this](http://jashkenas.s3.amazonaws.com/misc/jammit_example/jammit.html):

    <!--[if (!IE)|(gte IE 8)]><!-->
      <link href="assets/silk-datauri.css" media="screen" rel="stylesheet" type="text/css" />
    <!--<![endif]-->
    <!--[if lte IE 7]>
      <link href="assets/silk-mhtml.css" media="screen" rel="stylesheet" type="text/css" />
    <![endif]-->

Thus producing two version of the css files.

