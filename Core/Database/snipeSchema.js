const mongoose = require('mongoose');

const snipeSchema = new mongoose.Schema({

    userID: { type: String, required: true },
    guildID: { type: String, required: true },
    channelID: { type: String, required: true },

    lastSnipeDate: { type: Number, default: Date.now() },
    lastSnipeContent: { type: String, required: true },
    listSnipe: { type: Array, default: [] },

});

module.exports = mongoose.model('Kira_snipeSchema', snipeSchema);