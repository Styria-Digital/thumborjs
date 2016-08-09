const ThumborJS = require('../');
const test      = require('tape');

const sign      = require('./.inc/thumbor_sign');
const localsvr  = require('./.inc/get_local_svr');
const seckey    = require('./.inc/get_seckey');

test('hash generation', function(t) {
    const key  = seckey();
    const url  = 'foo/bar/qux.png';

    const inst = new ThumborJS(localsvr(), key);

    inst.imgpath(url);
    t.equal(sign(key, inst.getpath()), inst.gethash());

    inst.imgpath(url).metadata( true );
    t.equal(sign(key, inst.getpath()), inst.gethash());

    inst.imgpath(url).halign( ThumborJS.CENTER ).valign( ThumborJS.MIDDLE );
    t.equal(sign(key, inst.getpath()), inst.gethash());

    t.end();
});