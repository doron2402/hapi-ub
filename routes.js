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
    { method: 'GET', path: '/{args}', config: { handler: showHome } },
    { method: 'POST', path: '/start', config: { handler: startRide, payload: 'parse', validate: { payload: { name: Types.String().required().min(3) } } } },
    { method: 'POST', path: '/update', config: { handler: updateRide, payload: 'parse', validate: { payload: { name: Types.String().required().min(3) } } } },
    { method: 'POST', path: '/end', config: { handler: endRide, payload: 'parse', validate: { payload: { name: Types.String().required().min(3) } } } }
];


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

function updateRide (request){
    console.log(request);
}

function startRide(request) {
    console.log(request.query);
    console.log(request.params);
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