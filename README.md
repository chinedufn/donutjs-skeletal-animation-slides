Skeletal Animation in Your Browser via WebGL
============================================

> The accompanying slides for a ten minute talk at [Portland Donut.js](http://donutjs.club/)

## Viewing the slides live

[Click here to view the slides online](http://www.chinedufn.com/talks/donutjs/)

## Viewing the talk

TODO: Add YouTube link to talk

## Viewing the slides locally

You can view the slides locally by pasting the following into your terminal:

```sh
git clone https://github.com/chinedufn/donutjs-skeletal-animation-slides
cd donutjs-skeletal-animation-slides
npm install
npm run start
```

Any changes that you make to your local version will live reload in your browser.
This can be helpful for hands-on tweaking things in order to better understand them.

## To embed into another web oage

These slides are an npm module that you can require and use should you wish:

```sh
npm install donutjs-skeletal-animation-slides
```

```js
var skeletalAnimationSlides = require('donutjs-skeletal-animation-slides')

var slidesDomElement = skeletalAnimationSlides()

document.body.appendChild(slidesDomElement)
```

## Comments

I started off trying to comment and make things neat and what not... And yeah that went out the door pretty quickly when things started breaking.
Then some hardcore copy pasta was boiled.
So yeah sorry
