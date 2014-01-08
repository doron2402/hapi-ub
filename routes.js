/*
curl -H "Content-Type: application/json" -H "Accept: application/json" -X POST -d '{"lng":"bob", "lat":"123", "tripId":"123", "event":"end", "fare":"123"}' http://localhost:8080/drive

    TODO:

        1. use hiredis parser for better performance
*/

var Types = require('hapi').types,
    redis = require("redis"),
    redisClient = redis.createClient();

/*
    Checking Redis connection
*/
redisClient.on("error", function(err){
    if(err)
        console.log(err);
})

module.exports = [
    {   method: 'GET', 
        path: '/{args}', 
        config: { 
            handler: showHome 
        } 
    },
    {
        method: 'POST', 
        path: '/drive', 
        config: { 
            handler: updateRide, 
            payload: 'parse', 
            validate: { 
                payload: { 
                    lat: Types.Number().required(), 
                    lng: Types.Number().required(),
                    tripId: Types.Number().integer().min(99).max(10000), //trip id between 100-10000
                    event: Types.String().alphanum().required(),
                    fare: Types.Number().optional()
                } 
            } 
        } 
    }
];

/* Data Schema for Users and Driver */
var users = [{
    id: 1,
    name: 'John Smith',
    lastLocation: {
            lat: 22,
            lng: 23
        }
    },{
        id: 2,
        name: 'Doron Segal',
        lastLocation: {
            lat: 12,
            lng: 28
        } 
    }];

var driver = [ { carType: 3, earnYear: 34421, earnMonth: 323},
               { carType: 3, earnYear: 34421, earnMonth: 323} 
            ];

/* updating ride */
function updateRide (request){
    
    console.log(request.payload);

    switch(request.payload.event){
        case 'begin':
            beginRide(request);
            break;
        case 'update':
            updateRide(request);
            break;
        case 'end':
            endRide(request);
            break;
        default:
            request.reply({status: 'unknown event'}).code(404);
            break;
    }
    
    
}

/*
    Begin Ride 

    - using list to store time, using time as key 
    Bind tripId to starting time
    Bind tripId to starting location [lat,lng]
*/
var beginRide = function(req){
    var starting_time = new Date();
    
    redisClient.LPUSH(tripId, [req.payload.lat,req.payload.lng]);

    redisClient.LPUSH('location:' + req.payload.tripId,[req.payload.lat,req.payload.lng], function (err, replies){
        if (err)
            console.location(err);

        redisClient.LPUSH('start:' + starting_time, req.payload.tripId, function (err, replies){
            if (err)
                console.log(err);

            console.log(replies);
        });

        console.log(replies);

        //If something goes wrong here we always can use loggly :)
    });
    
    req.reply({status: "started"}).code(201); //Why waiting start driving... 
};

/*
    Updating Ride

    - first check that location been changed
    - using lists for updating the trip id

    Lists
*/
var prevUpdate = [];
var updateRide = function (req) {
    
    
    if (prevUpdate.length == 0 || prevUpdate[0] != req.payload.lat || prevUpdate[1] != req.payload.lng ){
        prevUpdate.push(req.payload.lat);
        prevUpdate.push(req.payload.lng);

        redisClient.LPUSH(tripId, [req.payload.lat,req.payload.lng]);

    }

    req.reply({status: "updated"}).code(201);
};

var endRide = function (req) {

    var ending_time = new Date();
    if (isNaN(req.payload.fare))
        req.reply({status: "Error", code: "1"}).code(500);


    redisClient.LPUSH('location:' + req.payload.tripId,[req.payload.lat,req.payload.lng], function (err, replies){
        if (err)
            console.location(err);

        redisClient.LPUSH('end:' + ending_time, req.payload.tripId, function (err, replies){
            if (err)
                console.log(err);

            console.log(replies);
        });

        console.log(replies);

        //If something goes wrong here we always can use loggly :)
    });
    req.reply({status: "ended"}).code(201);

} 

function showHome(request) {
    console.log(request.query);
    console.log(request.params);

    request.reply(request.params);
}


