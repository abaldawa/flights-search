/**
 * User: abhijit.baldawa
 *
 * This module exposes methods to fetch environment variables, process arguments and configuration values from json file.
 */

const
    {httpServer} = require('./serverConfig');

/**
 * @method PUBLIC
 *
 * This method returns the port number on which the server should run
 *
 * @returns {number}
 */
function getPort() {
    if( process.env.PORT ) {
        return process.env.PORT;
    } else {
        return httpServer.port;
    }
}

/**
 * @method PUBLIC
 *
 * Determines whether the current process is run by mocha tests or not
 *
 * @returns {boolean}
 */
function isMochaTest() {
    return process.argv.indexOf( '--mocha' ) > -1;
}

module.exports = {
    getPort,
    isMochaTest
};