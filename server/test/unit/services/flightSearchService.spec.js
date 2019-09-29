/**
 * User: abhijit.baldawa
 */

const 
    {formatPromiseResult} = require('../../../src/utils/util');
    flightSearchService = require('../../../src/services/flightSearchService');

describe("Module server/services/flightSearchService.js", function() {
    describe("#getFlightsSchedule()", function() {
        it("should throw an exception if 'timeout' argument is missing", async function(){
           const [err] = await formatPromiseResult( flightSearchService.getFlightsSchedule() );
           
           should.exist(err);
           err.should.be.instanceOf(Error);
           err.message.should.equal(`'timeout' parameter must be number representing milliseconds`);
        });
        
        it("If 'timeout' is 950ms then should fetch flight schedules (or empty array) from the third party services, which ever is quicker, inside 1 second. Attempting 20 parallel attempts", async function() {
            this.timeout(20000);

            return Promise.all(
                    Array(20)
                        .fill(true)
                        .map(async (i, index) => {
                            const
                                start = new Date(),
                                [err, flightsScheduleArr] = await formatPromiseResult( flightSearchService.getFlightsSchedule(950) ),
                                end = new Date();

                            (end-start).should.be.below(1000);
                            should.not.exist(err);
                            should.exist(flightsScheduleArr);
                        })
            );
        });
    });
});