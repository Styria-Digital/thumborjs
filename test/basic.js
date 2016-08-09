const ThumborJS = require('../');
const test      = require('tape');

const localsvr  = require('./.inc/get_local_svr');
const seckey    = require('./.inc/get_seckey');

test('urls', function(t) {
    const key  = seckey();
    const url  = 'foo/bar/qux.png';

    const inst = new ThumborJS(localsvr(), key);

    // TODO: write a number of tests to validate that resetting (and not resetting)
    //       the internal state works as expected

    t.end();
});

test('resetting', function(t) {
    const key  = seckey();
    const url  = 'foo/bar/qux.png';

    const inst = new ThumborJS(localsvr(), key);

    // TODO: write a number of tests to validate that resetting (and not resetting)
    //       the internal state works as expected
    t.end();
});

