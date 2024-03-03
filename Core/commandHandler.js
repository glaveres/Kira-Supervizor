module.exports = (client) => {

    const glob = require("glob");
    const path = require("path")

    glob("./Commands/**/*.js", {}, (err, files) => {
        console.log("[LOG] Komutlar yükleniyor...")
        files.forEach((file, index) => {
            const command = require(path.join(__dirname, '..', file));
            client.commands.set(command.name, command);
            console.log(`[${file.split("/")[file.split("/").length - 2]}] Komut Yüklendi: ${command.name}`);
        });
    });

    /*const fs = require('fs');
    const commander = fs.readdirSync('./Commands')
    console.log(`[LOG] Komutlar yükleniyor.`)
    for(files of commander) {

        const command = fs.readdirSync(`./Commands/${files}`).filter(file => file.endsWith('.js'));

        for(file of command) {
           
            const command = require(`../Commands/${files}/${file}`);
            global.commands.set(command.name, command);
            console.log(`[${files}] Komut Yüklendi: ${command.name}`);

        }


    }*/


}