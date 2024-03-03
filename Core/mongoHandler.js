const mongoose = require('mongoose');
const config = require('./Settings/Settings');

mongoose.connect(config.database.URI, config.database.options);

mongoose.connection.on('connected', async () => {
    console.log('[LOG] Mongoose bağlantısı sağlandı!');
});