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

// export class
module.exports  = ThumborJS;

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

    return Object.getOwnPropertySymbols(keys).reduce((pv, sym) => pv || (keys[sym] === seckey ? sym : null), null) || Symbol();
}

function getSeckey(prop)
{
    return prop && keys[ prop ];
}


/**
 * Build operation array, must be bound to instance of Thumbor
 *
 * @return {Array}
 */
function urlParts()
{
    if (!this.imagePath)
        throw new Error('The image url can\'t be null or empty.');

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

    return parts;
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
    setImagePath(imagePath, reset)
    {
        if (reset)
            this.reset();

        this.imagePath = (imagePath.charAt(0) === '/') ? imagePath.substring(1, imagePath.length) : imagePath;

        return this;
    }

    /**
     * Converts operation array to string
     *
     * @return {String}
     */
    getOperationPath(reset)
    {
        const parts = urlParts.call(this);

        if (reset)
            this.reset();

        return parts.join('/');
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
    smartCrop(smartCrop)
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
    fitIn(width, height)
    {
        this.fitInFlag = true;

        return this.resize(width, height);
    }

    /**
     * Flip image horizontally
     */
    flipHorizontally()
    {
        this.withFlipHorizontally = true;

        return this;
    }

    /**
     * Flip image vertically
     */
    flipVertically()
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
     * @param  {Boolean} metaDataOnly
     */
    metaDataOnly(metaDataOnly)
    {
        this.meta = !!metaDataOnly;

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
     * Combine image url and operations with secure and unsecure (unsafe) paths
     *
     * @return {String}
     */
    buildUrl(skipreset)
    {
        const operation = this.getOperationPath(!skipreset);
        const keypart   = this.seckeyProp
                        ? crypto.createHmac('sha1', getSeckey(this.seckeyProp)).update(operation).digest('base64')
                        : 'unsafe'
                        ;

        return this.serverUrl + '/' + keypart + '/' + operation;
    }
};
