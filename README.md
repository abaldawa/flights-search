## Author: Abhijit Baldawa

## flights-search
A node.js server to fetch unique flight schedules from third party REST services inside 1 second.

## How to run:
1. Install latest node.js
1. git clone project
2. npm i
3. npm test -> to run all the unit tests written
4. npm start -> this will start the node.js server on port 3000 
5. On browser go to localhost:3000/flights to get the response of unique flights

Once server is up and running there is 1 REST endpoint as below: 
## GET /flights

Responds with unique flight schedules merged from two remote services as below :

```javascript
{
   flights: [
      {
        "slices": [
          {
            "origin_name": string,
            "destination_name": string,
            "departure_date_time_utc": string,
            "arrival_date_time_utc": string,
            "flight_number": string,
            "duration": number
          },
          {
            "origin_name": string,
            "destination_name": string,
            "departure_date_time_utc": string,
            "arrival_date_time_utc": string,
            "flight_number": string,
            "duration": number
          }
        ],
        "price": number
      },
      ...
   ]
}

or If none of the third party services responds (or gives error) inside 1 second then response is below

{
     flights: []
}
```
