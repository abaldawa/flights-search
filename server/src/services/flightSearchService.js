/**
 * User: abhijit.baldawa
 *
 * This module exposes methods to fetch data from third party REST endpoints
 */

const
    http = require('http'),
    https = require('https'),
    {URL: {source1, source2}, credentials} = require('./flightSearchRestEndpoints'),
    {formatPromiseResult} = require('../utils/util'),
    AUTH_STR = `${credentials.username}:${credentials.password}`;

/**
 * @private
 *
 * This method fetches JSON response from the provided URL
 *
 * Note: We are using node.js built-in 'http' module because our use-case is to just GET response from the endpoint. This way we do not
 *       have to install any third-party REST client. For more complex usage we can also use "node-fetch" (or any-other) module which
 *       returns promise by default and can be directly used with async/await without having to wrap it inside promise constructor.
 *
 * @param {string} URL
 * @param {string} [auth] - If present the will be used as auth credentials to access this URL
 * @returns {Promise<Object>}
 */
async function fetchJsonDataFromUrl( URL, auth ) {
    if( !URL || typeof URL !== "string" ) {
        throw new Error("Missing/invalid URL");
    }

    if( auth && typeof auth !== "string" ) {
        //If auth is present then it should be string
        throw new Error(`'auth' parameter must be string with 'username:password' pattern`);
    }

    const
        request = URL.startsWith("https://") ? https : http;

    let
        err,
        httpResponse,
        responseStr = '',
        responseJson;

    // ----------------------- 1. Initiate http(s) get request on URL and get httpResponse stream or error ------------------
    [err, httpResponse] = await formatPromiseResult(
                                   new Promise((resolve, reject) => {
                                       request
                                           .get( URL, {auth}, resolve )
                                           .on('error', reject)
                                   })
                                );

    if(err) {
        throw new Error(`Error fetching data from URL = '${URL}'. Error: ${err}`);
    }

    const
        {statusCode} = httpResponse,
        contentType = httpResponse.headers['content-type'];

    if( statusCode !== 200 ) {
        // Consume response data to free up memory
        httpResponse.resume();
        throw new Error(`Unsuccessful status code = '${statusCode}' received from the URL = '${URL}'`);
    }

    if (!/^application\/json/.test(contentType)) {
        // Consume response data to free up memory
        httpResponse.resume();
        throw new Error(`Invalid content-type. Expected application/json but received ${contentType}`);
    }
    // -------------------------------------------------- 1. END --------------------------------------------------------------


    // ---------- 2. Build the response JSON string by asynchronously iterating httpResponse ------------
    httpResponse.setEncoding('utf8');

    for await (const chunk of httpResponse) {
        responseStr += chunk;
    }
    // --------------------------------------------- 2. END ---------------------------------------------


    // ---------------------------- 3. Parse the JSON 'responseStr' and check if its valid ------------------
    [err, responseJson] = await formatPromiseResult( Promise.resolve().then(()=>JSON.parse(responseStr)) );

    if(err) {
        throw new Error(`Invalid JSON response received from URL='${URL}'. Error = ${err}`);
    }
    // ---------------------------------------------- 3. END ------------------------------------------------

    return responseJson;
}

/**
 * @public
 * @async
 *
 * This method fetches flights schedules from "source1" and "source2" services
 * and responds with results from both sources combined. If any (or both) of the service
 * endpoints takes more time that the provided "timeout" then this method will return 
 * flights schedules of which ever service have responded with response inside that timeout limit.
 * If both the services does not respond within the "timeout" time then this methods returns [];
 *
 * @param {number} timeout - Maximum time to wait for the flights response
 *                           from the service
 * @returns {Promise<Array.<{
 *              slices: [
 *                  {
 *                      origin_name: string,
 *                      destination_name: string,
 *                      departure_date_time_utc: string,
 *                      arrival_date_time_utc: string,
 *                      flight_number: string,
 *                      duration: number
 *                  }
 *              ],
 *              price: number
 *          }> | []>}
 */
async function getFlightsSchedule( timeout ) {
    if( typeof timeout !== "number" ) {
        throw new Error(`'timeout' parameter must be number representing milliseconds`);
    }

    let
        timeoutId,
        fetchedFlights = [];

    await formatPromiseResult(
            Promise.race([
                Promise.allSettled([
                    fetchJsonDataFromUrl( source1, AUTH_STR ).then(response => fetchedFlights.push(response)),
                    fetchJsonDataFromUrl( source2, AUTH_STR ).then(response => fetchedFlights.push(response) )
                ]),
                new Promise( (resolve, reject) => {
                    timeoutId = setTimeout( reject, timeout, "TIMEOUT" )
                } )
            ])
          );

    clearTimeout(timeoutId);
    return fetchedFlights.map( response => response.flights ).flat();
}

module.exports = {
    getFlightsSchedule
};