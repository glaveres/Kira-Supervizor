const client = require('./Core/clientHandler.js');

require('./Core/functionHandler')(client);
require('./Core/eventHandler')(client);
require('./Core/commandHandler')(client);
require('./Core/mongoHandler');