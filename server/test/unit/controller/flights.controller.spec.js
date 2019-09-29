/**
 * User: abhijit.baldawa
 */

const
    flightsController = require('../../../src/controller/flights.controller');

describe("Module server/controller/flight.controller.js", function() {
    describe("#getKeyByScehduleObj()", function() {
        it("should generate unique key if given a flight inbound/outbund slice object", function(){
            const
                sliceObj = {
                    "slices": [
                        {
                            "origin_name": "Schonefeld",
                            "destination_name": "Stansted",
                            "departure_date_time_utc": "2019-08-08T04:30:00.000Z",
                            "arrival_date_time_utc": "2019-08-08T06:25:00.000Z",
                            "flight_number": "144",
                            "duration": 115
                        },
                        {
                            "origin_name": "Stansted",
                            "destination_name": "Schonefeld",
                            "departure_date_time_utc": "2019-08-10T06:50:00.000Z",
                            "arrival_date_time_utc": "2019-08-10T08:40:00.000Z",
                            "flight_number": "145",
                            "duration": 110
                        }
                    ],
                    "price": 129
                },
                shouldGenerateKey = `129|144-2019-08-08T04:30:00.000Z-2019-08-08T06:25:00.000Z|145-2019-08-10T06:50:00.000Z-2019-08-10T08:40:00.000Z`;

            flightsController.getKeyByScehduleObj(sliceObj).should.be.equal(shouldGenerateKey);
        });
    });
    
    describe("#getFlights() - Testing 5 attempts", function() {
        let
            respondedFlightScheduleObj;

        [1,2,3,4,5].forEach( attempt => {
            it(`(Attempt: ${attempt}): should respond with flights schedules object inside 1 second`, function( done ) {
                const
                    start = new Date(),
                    res = {
                        json( flightStatusObj ) {
                            respondedFlightScheduleObj = flightStatusObj;

                            const end = new Date();

                            (end-start).should.be.below(1000);
                            should.exist(flightStatusObj);
                            flightStatusObj.should.be.an("object");
                            done();
                        }
                    };

                flightsController.getFlights({}, res );
            });

            it(`(Attempt: ${attempt}): Received flight object should contain 'flights' key which can be an empty array or non empty`, function() {
                respondedFlightScheduleObj.should.have.all.keys("flights");
                respondedFlightScheduleObj.flights.should.be.an("array");
            });

            it(`(Attempt: ${attempt}): If 'flights' key is a non empty array then all objects inside it should contain all keys and correct structure`, function() {
                if( respondedFlightScheduleObj.flights.length ) {
                    respondedFlightScheduleObj.flights.forEach( flightObj => {
                        should.exist(flightObj);
                        flightObj.should.be.an("object");
                        flightObj.should.have.all.keys("slices", "price");
                        flightObj.price.should.be.an("number");

                        flightObj.slices.forEach( sliceObj => {
                            should.exist(sliceObj);
                            sliceObj.should.be.an("object");
                            sliceObj.should.have.all.keys("origin_name", "destination_name", "departure_date_time_utc", "arrival_date_time_utc", "flight_number", "duration");
                        } );
                    });
                }
            });

            it(`(Attempt: ${attempt}): If 'flights' key is non empty array then then all the flight schedules should be UNIQUE`, function() {
                let
                    uniqueFlightsObj = {};

                respondedFlightScheduleObj.flights.forEach( scheduleObj => {
                    const flightScheduleKey = flightsController.getKeyByScehduleObj(scheduleObj);

                    should.not.exist(uniqueFlightsObj[flightScheduleKey]);
                    uniqueFlightsObj[flightScheduleKey] = scheduleObj;
                } );
            })
        } );
    });
});