/**
 * User: abhijit.baldawa
 */

const
    router = require('express').Router(),
    flightsController = require('../controller/flights.controller');

router.get('/', [
    flightsController.getFlights
]);

module.exports = router;