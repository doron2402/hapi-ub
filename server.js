var Hapi = require('hapi')
 	, routes = require('./routes')
	, config = { }
	, port = process.env.PORT || 8080
	, server = new Hapi.Server('0.0.0.0', port, config);
server.pack.require({ lout: { endpoint: '/docs' } }, function (err) {

    if (err) {
        console.log('Failed loading plugins');
    }
});

server.addRoutes(routes);

console.log('Starting Server on Port: %s', port);
server.start();