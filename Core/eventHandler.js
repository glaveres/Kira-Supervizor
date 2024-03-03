module.exports = (client) => {

    const requestEvent = (event) => require(`../Events/${event}`);
    client.on('ready', () => requestEvent('ready')(client));
    client.on('messageCreate', messageCreate => requestEvent('messageCreate')(messageCreate, client));
    client.on('messageDelete', messageDelete => requestEvent('messageDelete')(messageDelete, client));
        
}