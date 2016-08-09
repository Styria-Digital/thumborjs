/**
 * returns a thumbor server URL for a what is generally/presumably a local instance
 * (but from a testing perspecticve we don't actually care where it is running!)
 *
 * N.B. the returned value can be controlled by setting the env-var "THUMBOR_URL"
 *
 * @return {String}
 */
module.exports = function()
{
    return process.env.THUMBOR_URL || 'http://localhost:8888';
};
