//Socket.IO client for flash-comm
import io from "socket.io-client";
import { v4 as uuidv4 } from 'uuid';
import JSONFileHandler from "./json-file-handler.mjs";

//Init file handler and load config
const configFileHandler = new JSONFileHandler('./config.json');

//load config file
const config = await loadConfig();

//create socket
const socket = io(config.host);

//connet to socket
socket.on("connect", () => {
    console.log("Socket.io: connected");

    //check if device is registered
    if(!config.registered) {
        console.log("Socket.io: waiting for device to be registered.");
    }

    //register device
    socket.emit("device", config.id);

    //listen for data from server
    socket.on("data", (data) => {
        console.log("Socket.io: data received");
        console.log(data);

        flash(data.flash);
    });

    //listen for device to be registered
    socket.on(config.id, async (data) => {
        console.log("Socket.io: device registered");
        config.registered = true;
        await configFileHandler.saveJSON(config);
        console.log(data);
        socket.emit("device", config.id);
    });
    
});

//

//socket disconnected
socket.on("disconnect", () => {
    console.log("Socket.io: disconnected");
});


//Put flash code here
//flash led or something
function flash(flash) {
    if(flash) {
        //flash led
    } else {
        //turn off led
    }
}


async function loadConfig() {
    try {
        const data = await configFileHandler.readJSON();
        console.log("Config loaded: ");
        console.log(data);
        return data;
    } catch (error) {
        console.log("Error loading config file. Creating default config.json file and generating id.");
        console.log("Default host is http://localhost:3000");
        console.log("Modify config.json to change host.");
        //generate a unique id
        const id = uuidv4();
        //save config file
        await configFileHandler.saveJSON({
            "id": id,
            "host": "http://localhost:3000",
            "registered": false
        });
        return {
            "id": id,
            "host": "http://localhost:3000",
            "registered": false
        };
    }
}