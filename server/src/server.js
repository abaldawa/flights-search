/**
 * User: abhijit.baldawa
 */

const
    express = require('express'),
    app = express(),
    flightsRouter = require('./routes/flights.routes'),
    logger = require('./logger/logger'),
    {getPort} = require('./config/config'),
    {formatPromiseResult} = require('./utils/util');

/**
 * Immediately invoking async method which does all the standard server startup routine.
 */
(async () =>{
    const
        PORT = getPort();

    let
        err;

    if( !PORT ) {
        logger.error(`Cannot start server as 'port' information is missing`);
        process.exit(1);
    }

    // --------------------- 1. Add all the required express middleware ---------------------
    app.use(express.json());
    // ---------------------------- 1. END -------------------------------------------------


    // ---------------------------- 2. Add express routes ----------------------------------
    app.use('/flights', flightsRouter);
    // -------------------------------------- 2. END ---------------------------------------


    // ------------------------------ 3. Start Http Server -------------------------------------------
    [err] = await formatPromiseResult(
                    new Promise( (resolve, reject) => {
                        app
                          .listen(PORT, resolve)
                          .on('error', reject)
                    } )
                  );

    if( err ) {
        logger.error(`Error while starting server on port = ${PORT}. Error: ${err.stack || err}. Exiting...`);
        process.exit(1);
    }

    logger.info(`Server is listening on port = ${PORT}`);
    // --------------------------------- 3. END -------------------------------------------------------
})();