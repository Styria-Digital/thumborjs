/**
 * returns a thumbor server URL for a what is generally/presumably a local instance
 * (but from a testing perspecticve we don't actually care where it is running!)
 *
 * N.B. the returned value can be controlled by setting the env-var "THUMBOR_SECURITY_KEY"
 *
 * @return {String}
 */
module.exports = function()
{
    return process.env.THUMBOR_SECURITY_KEY || 'test-security-key';
};