# ThumboJS - a NodeJS Thumbor Url Builder

ES2015-style Thumbor URL generator for Node JS.

> browsers are not supported simply because to use the code in the browser would imply either having to supply the encryption-key to the browser or not use an encryption key, neither of which is a good idea.

a refactor of the following projects (with thanks to them!) ...
 - https://github.com/dcaramelo/ThumborUrlBuilder
 - https://github.com/rafaelcaricio/ThumborJS

## Install <em>(requires [npm](https://docs.npmjs.com/getting-started/what-is-npm))</em>

```sh
npm install thumbor
```
## Usage

```javascript
const ThumborJS = require('thumborjs');

// Your encryption key may be NULL, but if so your links will be unsafe (this is definitely NOT RECOMMENDED).
const myKey     = 'MY_KEY'; 

// init url generator
const tugen     = new ThumborJS('http://localhost:8888', myKey);

// generate a url
const url       = tugen.setImagePath('foobar.png').resize(50,50).buildUrl();
```
