const exec = require('child_process').execSync;

/**
 * calls a python command that uses the `thumbor.crypto` module to perform the
 * signing of the given `str` with the given `key`
 *
 *
 * @param  {String} key     - an encryption key
 * @param  {String} str     - a thumbor [instruction] url
 * @return {String}
 * @throws {Error}          - thrown if the command fails in any way (Python not installed, Thumbor not installed, etc)
 */
module.exports = function(key, str)
{
    const cmd = "python -c 'import sys; from thumbor.crypto import Signer; signer = Signer(\"" + key + "\"); sys.stdout.write(signer.signature(\"" + str + "\"))'";

    return exec(cmd, {
        timeout : 250,
        encoding: 'utf8'
    });
};