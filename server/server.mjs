//Node v14.0.0 or higher for top level await
//Testing done on v20.8.1

import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";
import { fileURLToPath } from 'url';
import { dirname } from "path";
import JSONFileHandler from "./json-file-handler.mjs";

//init file handler for spaces and devices
const spacesFileHandler = new JSONFileHandler("./spaces.json");
const devicesFileHandler = new JSONFileHandler("./devices.json");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
console.log("dirname", __dirname);

//init server
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = process.env.npm_config_port || 3000;

//load spaces.json
const spaces = await loadSpaces();
console.log("Spaces: ", spaces);

//load devices.json
const devices = await loadDevices();
console.log("Devices: ", devices);

//device holding area
const unregistered = [];

// Serve static files from 'flash-comm-ui/dist' (VUE app)
app.use(express.static(__dirname + '/flash-comm-ui/dist'));

// Socket.io server callbacks
io.on("connection", (socket) => {
    console.log("a user connected");

    //Device handshake
    socket.on("device", (id) => {
        //check if device exists in devices.json
        for (let i = 0; i < devices.length; i++) {
            if (devices[i].id == id) {
                //device exists so join to corresponding space
                console.log(`Socket.io: device ${id} joining ${devices[i].space}`);
                socket.join(devices[i].space);
                return;
            }
        }

        //device does not exist in devices
        console.log(`Socket.io: device ${id} does not exist. Waiting for space assignment`);

        //check if in unregistered list
        for (let i = 0; i < unregistered.length; i++) {
            if (unregistered[i] == id) {
                //device exists
                console.log(`Socket.io: device ${id} already in unregistered list`);
                return;
            }
        }

        //device not in unregistered list
        //push to unregistered and emit to dashboard
        unregistered.push(id);
        io.emit("unregistered", unregistered);
    });

    //Device registration
    socket.on("register", (data) => {
        //check if device exists in unregistered array
        for (let i = 0; i < unregistered.length; i++) {
            if (unregistered[i] == data.id) {
                //device exists push to array and write json
                console.log(`Socket.io: device ${data.id} added to devices.json`);
                devices.push(data);
                writeToJsonFileSync("./devices.json", devices);

                //alert device that it was registered
                io.emit(data.id, data);

                //remove from unregistered holding
                unregistered.splice(i, 1);
                io.emit("unregistered", unregistered);
                return;
            }
        }
        //device is not in unregistred list
        console.log(`Socket.io: device ${data.id} is not in unregistered list`);
    });

    //join a space
    socket.on("join", (space) => {
        console.log(space);
        //dashboard
        if (space == "dashboard") {
            //send unregistered devices
            io.emit("unregistered", unregistered);
            //join all rooms and send space
            for (let i = 0; i < spaces.length; i++) {
                socket.join(spaces[i].id);
                io.to(spaces[i].id).emit("data", spaces[i]);
            }
            return;
        }
        //individual clients
        //join space and send space
        for (let i = 0; i < spaces.length; i++) {
            if (spaces[i].id == space) {
                socket.join(space);
                io.to(space).emit("data", spaces[i]);
                return;
            }
        }
    });

    //flash toggle
    socket.on("flash", (space) => {
        console.log(`Socket.io: flash ${space}`);
        for (let i = 0; i < spaces.length; i++) {
            if (spaces[i].id == space) {
                //toggle flash
                spaces[i].flash = spaces[i].flash ? false : true;

                //emit flash data to space
                io.to(space).emit("data", spaces[i]);
                return;
            }
        }
    });

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});

// Catch-all route to serve 'index.html'
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/flash-comm-ui/dist/index.html');
});

httpServer.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});


//Write data to .json
function writeToJsonFileSync(path, data) {
    try {
        // Convert JavaScript object to JSON string
        const jsonData = JSON.stringify(data, null, 2); // The third parameter (2) is for indentation

        // Write JSON data to a file synchronously
        fs.writeFileSync(path, jsonData);

        console.log('Data has been written to output.json');
    } catch (error) {
        console.error('Error writing to the JSON file:', error.message);
    }
}


//load spaces.json
async function loadSpaces() {
    try {
        const data = await spacesFileHandler.readJSON();
        return data;
    } catch (error) {
        console.error('Error reading from the spaces.json:', error.message);

        //Is edge case possible where spaces.json exists but json is corrupt?
        //Should probably check for that here and then backup the corrupt file before overwriting it with default spaces.json
        
        //generate default spaces.json
        const defaultSpaces = [
            {
                id: "space1",
                name: "Space 1",
                flash: false,
            }
        ];
        await spacesFileHandler.saveJSON(defaultSpaces);
        console.log("Default spaces.json generated");
        return defaultSpaces;
    }
}

//load devices.json
async function loadDevices() {
    try {
        const data = await devicesFileHandler.readJSON();
        return data;
    } catch (error) {
        console.error('Error reading from the devices.json:', error.message);

        //see possible edge case in loadSpaces()
        
        //generate default devices.json
        const defaultDevices = [];
        await devicesFileHandler.saveJSON(defaultDevices);
        console.log("Default devices.json generated");
        return defaultDevices;
    }
}