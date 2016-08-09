// core deps
const crypto    = require('crypto');

// locals
const keys      = {};
const consts    = {
    TOP    : 'top',
    MIDDLE : 'middle',
    BOTTOM : 'bottom',

    RIGHT  : 'right',
    CENTER : 'center',
    LEFT   : 'left',
};

/**
 * returns whether given input a non-empty string
 *
 * @param  {String} s
 * @return {Boolean}
 */
function validString(s)
{
    return (typeof s === 'string') && s.length;
}

function initSeckey(seckey)
{
    if (!validString(seckey))
        return null;

    const existing_key  = Object.getOwnPropertySymbols(keys).reduce((pv, sym) => pv || (keys[sym] === seckey ? sym : null), null);

    if (existing_key)
        return existing_key;

    const new_key       = Symbol();

    keys[ new_key ] = seckey;

    return new_key;
}

function getSeckey(prop)
{
    return prop && keys[ prop ];
}


/**
 * Build operation path, must be bound to instance of Thumbor
 *
 * @return {Array}
 */
function getOperationPath(reset)
{
    if (!this.imagePath)
        throw new Error('The image url can\'t be null or empty (call `imgpath()` first).');

    const parts = [];

    if (this.meta)
        parts.push('meta');

    if (this.cropValues)
        parts.push(
            this.cropValues.left +
            'x' + this.cropValues.top +
            ':' + this.cropValues.right +
            'x' + this.cropValues.bottom
        );

    if (this.fitInFlag)
        parts.push('fit-in');

    if (
        this.width                ||
        this.height               ||
        this.withFlipHorizontally ||
        this.withFlipVertically
    ) {
        let sizeString = '';

        if (this.withFlipHorizontally)
            sizeString += '-';

        sizeString += this.width;
        sizeString += 'x';

        if (this.withFlipVertically)
            sizeString += '-';

        sizeString += this.height;

        parts.push(sizeString);
    }

    if (this.halignValue)
        parts.push(this.halignValue);


    if (this.valignValue)
        parts.push(this.valignValue);

    if (this.smart)
        parts.push('smart');

    if (this.filtersCalls.length)
        parts.push('filters:' + this.filtersCalls.join(':'));

    parts.push(this.imagePath);

    if (reset)
        this.reset();

    return parts.join('/');
}

class ThumborJS
{
    /**
     * ctor
     *
     * @param {String}      thumborServerUrl
     * @param {String|null} securityKey
     */
    constructor(thumborServerUrl, securityKey)
    {
        if (!validString(thumborServerUrl))
            throw new Error('`thumborServerUrl` parameter must be a non-empty string');

        this.seckeyProp = initSeckey(securityKey);
        this.serverUrl  = thumborServerUrl;

        this.reset();
    }

    /**
     * reset the internal properties (that map to thumbor url-parts)
     */
    reset()
    {
        this.imagePath            = '';
        this.width                = 0;
        this.height               = 0;
        this.smart                = false;
        this.fitInFlag            = false;
        this.withFlipHorizontally = false;
        this.withFlipVertically   = false;
        this.halignValue          = null;
        this.valignValue          = null;
        this.cropValues           = null;
        this.meta                 = false;
        this.filtersCalls         = [];
    }

   /**
    * Set path of image
    *
    * @param {String} imagePath
    */
    imgpath(imagePath, reset)
    {
        if (reset)
            this.reset();

        this.imagePath = (imagePath.charAt(0) === '/') ? imagePath.substring(1, imagePath.length) : imagePath;

        return this;
    }

    /**
     * Resize the image to the specified dimensions. Overrides any previous call
     * to `fitIn` or `resize`.
     *
     * Use a value of 0 for proportional resizing. E.g. for a 640 x 480 image,
     * `.resize(320, 0)` yields a 320 x 240 thumbnail.
     *
     * Use a value of 'orig' to use an original image dimension. E.g. for a 640
     * x 480 image, `.resize(320, 'orig')` yields a 320 x 480 thumbnail.
     * @param  {String} width
     * @param  {String} height
     */
    resize(width, height)
    {
        this.width  = width  || '';
        this.height = height || '';

        return this;
    }

    /**
     * turn on smart-crop
     */
    smartcrop(smartCrop)
    {
        this.smart = smartCrop;

        return this;
    }

    /**
     * Resize the image to fit in a box of the specified dimensions. Overrides
     * any previous call to `fitIn` or `resize`.
     *
     * @param  {String} width
     * @param  {String} height
     */
    fitin(width, height)
    {
        this.fitInFlag = true;

        return this.resize(width, height);
    }

    /**
     * Flip image horizontally
     */
    hflip()
    {
        this.withFlipHorizontally = true;

        return this;
    }

    /**
     * Flip image vertically
     */
    vflip()
    {
        this.withFlipVertically = true;

        return this;
    }

    /**
     * Specify horizontal alignment used if width is altered due to cropping
     *
     * @param  {String} halign 'left', 'center', 'right'
     */
    halign(halign)
    {
        if (
          halign !== consts.LEFT &&
          halign !== consts.RIGHT &&
          halign !== consts.CENTER
        ) throw new Error(`Horizontal align must be ${consts.LEFT}, ${consts.RIGHT} or ${consts.CENTER}.`);

        this.halignValue = halign;

        return this;
    }

    /**
     * Specify vertical alignment used if height is altered due to cropping
     *
     * @param  {String} valign 'top', 'middle', 'bottom'
     */
    valign(valign)
    {
        if (
          valign !== consts.TOP &&
          valign !== consts.BOTTOM &&
          valign !== consts.MIDDLE
        ) throw new Error(`Vertical align must be ${consts.TOP}, ${consts.BOTTOM} or ${consts.MIDDLE}.`);

        this.valignValue = valign;

        return this;
    }

    /**
     * Specify that JSON metadata should be returned instead of the thumbnailed image.
     *
     * @param  {Boolean} metaData
     */
    metadata(metaData)
    {
        this.meta = !!metaData;

        return this;
    }

    /**
     * Append a filter, e.g. quality(80)
     * @param  {String} filterCall
     */
    filter(filterCall)
    {
        if (this.filtersCalls.indexOf(filterCall) == -1)
            this.filtersCalls.push(filterCall);

        return this;
    }

    /**
     * Manually specify crop window.
     *
     * @param  {Integer} left
     * @param  {Integer} top
     * @param  {Integer} right
     * @param  {Integer} bottom
     * @return {[type]}
     */
    crop(left, top, right, bottom)
    {
        this.cropValues = {
            left   : left,
            top    : top,
            right  : right,
            bottom : bottom
        };

        return this;
    }

    /**
     * generate and return the "operation path" based on the "operation" settings currently defined in this ThumborJS instance
     *
     * N.B. this function is primarily for testing purposes - it allows for taking the "operation path" and
     *      performing the encryption with Thumbor's own python module ... thereby allowing for verfication of
     *      the generated security hash
     *
     * @return {String}
     * @throws {Error}      - thrown if an "image path" is not currently set
     */
    getpath()
    {
        return getOperationPath.call(this);
    }

    /**
     * generate and return the encryption hash part of a thumbor URL,
     * based on the "operation" settings currently defined in this ThumborJS instance,
     * or the explicit `operation` string (if given)
     *
     * @param  {String} operation       - optional, will auto-generate it if not supplied
     * @return {String}
     */
    gethash(operation)
    {
        if (!this.seckeyProp)
            return 'unsafe'; // no security key set

        return crypto.createHmac('sha1', getSeckey(this.seckeyProp))
                     .update(operation || this.getpath())
                     .digest('base64')
                     .replace(/\+/g, '-')
                     .replace(/\//g, '_')
                     ;

    }

    /**
     * generate a thumbor image url
     *
     * @param  {Boolean} skip_reset     - optional, pass TRUE to skip resetting of objects internal state (after generation of "operation path")
     * @param  {Boolean} skip_serverurl - optional, pass TRUE to skip prefixing of generated URL with "server url"
     * @return {String}
     * @throws {Error}                  - thrown if an "image path" is not currently set
     */
    genurl(skip_reset, skip_serverurl)
    {
        const operation = getOperationPath.call(this, !skip_reset);

        return (skip_serverurl ? '' : this.serverUrl) + '/' + this.gethash(operation) + '/' + operation;
    }
};

// expose "class constants"
Object.keys(consts).forEach(k => Object.defineProperty(ThumborJS, k, {
    configurable : false,
    writable     : false,
    value        : consts[k],

}));

// export class
module.exports  = ThumborJS;
