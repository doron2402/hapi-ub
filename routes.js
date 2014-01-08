/*
curl -H "Content-Type: application/json" -H "Accept: application/json" -X POST -d '{"lng":"bob", "lat":"123", "tripId":"123", "event":"end", "fare":"123"}' http://localhost:8080/drive

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


var beginRide = function(req){
    console.log(req);
    req.reply({status: "started"}).code(201);
};

var updateRide = function (req) {
    console.log(req);
    req.reply({status: "updated"}).code(201);
};

var endRide = function (req) {
    console.log(req);
    
    if (isNaN(req.payload.fare))
        req.reply({status: "Error", code: "1"}).code(500);

    req.reply({status: "ended"}).code(201);

} 

function showHome(request) {
    console.log(request.query);
    console.log(request.params);

    request.reply(request.params);
}

function getProducts(request) {

    if (request.query.name) {
        request.reply(findProducts(request.query.name));
    }
    else {
        request.reply(products);
    }
}

function findProducts(name) {

    return products.filter(function(product) {
        return product.name.toLowerCase() === name.toLowerCase();
    });
}

function getProduct(request) {

    var product = products.filter(function(p) {
        return p.id === parseInt(request.params.id);
    }).pop();

    request.reply(product);
}

function addProduct(request) {

    var product = {
        id: products[products.length - 1].id + 1,
        name: request.payload.name
    };

    products.push(product);

    request.reply(product).code(201).header('Location', '/products/' + product.id);
}