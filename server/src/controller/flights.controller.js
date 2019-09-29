/**
 * User: abhijit.baldawa
 *
 * This module exposes controller method's which are connected to /flights REST endpoints
 */

const
    logger = require('../logger/logger'),
    {isMochaTest} = require('../config/config.js'),
    {getFlightsSchedule} = require('../services/flightSearchService'),
    {formatPromiseResult} = require('../utils/util');

/**
 * @private
 *
 * This method generates unique key based on departure/arrival time, flight number and price.
 *
 * @param {Object} scheduleObj
 *   @param {number} scheduleObj.price
 *   @param {Array.<{
 *       origin_name: string
 *       destination_name: string,
 *       departure_date_time_utc: string,
 *       arrival_date_time_utc: string,
 *       flight_number: string,
 *       duration: number
 *   }>} scheduleObj.slices
 *
 * @returns {string} - A unique key
 */
function getKeyByScehduleObj( scheduleObj ) {
    return scheduleObj.slices.reduce((key, sliceObj) => {
              return `${key}|${sliceObj.flight_number}-${sliceObj.departure_date_time_utc}-${sliceObj.arrival_date_time_utc}`;
           }, `${scheduleObj.price}`);
}

/**
 * @public
 * @async
 * @RestEndPoint GET /flights
 *
 * This controller method gets flight schedules from remote service, removes duplicates,
 * and responds with unique flight schedules inside 1 second.
 * 
 * An example response is as below:
 * [
 *   {
 *     slices: [
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
 *   },
 *   ...
 * ]  
 * or []
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @returns {Promise<void>}
 */
async function getFlights( req, res ) {
    let
        err,
        flightsScheduleArr,
        uniqueFlightsObj = {},
        start = new Date(),
        end;

    // --------------------- 1. Get flight schedules from remote service ----------------------
    [err, flightsScheduleArr] = await formatPromiseResult( getFlightsSchedule(950) );
    
    if(err) {
        /**
         * NOTE: getFlightsSchedule method will never throw error unless timeout value is missing.
         * But nevertheless it is always a good practice to catch error from promise if in case
         * something changes in future
         */
        return res.status(500).send(`Error getting flights schedule. Error: ${err}`);
    }
    // ------------------------------------ END ------------------------------------------------

    
    // ------------------------------------------- 2. Remove duplicate flight schedules ------------------------------------------------- 
    for(const scheduleObj of flightsScheduleArr) {
        const flightScheduleKey = getKeyByScehduleObj(scheduleObj);

        if(!uniqueFlightsObj[flightScheduleKey]) {
            uniqueFlightsObj[flightScheduleKey] = scheduleObj;
        }
    }
    // ---------------------------------------------------------- 2. END ----------------------------------------------------------------
    
    end = new Date();
    logger.info(`getFlights: Total time taken = ${end - start}ms`);

    return res.json({
        flights: Object.values(uniqueFlightsObj)
    });
}

module.exports = {
    getFlights
};

// NOTE: Expose below private methods only in test environment for testing
if( isMochaTest() ) {
    module.exports.getKeyByScehduleObj = getKeyByScehduleObj;
}