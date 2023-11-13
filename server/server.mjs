import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";
import { fileURLToPath } from 'url';
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

console.log("dirname", __dirname);

//load spaces from spaces.json directly (experimental)
// import spaces from "./spaces.json" assert { type: "json" };
// import devices from "./devices.json" assert { type: "json" };
//using fs
import fs from "fs";
const spaces = JSON.parse(fs.readFileSync("./spaces.json", "utf8"));
const devices = JSON.parse(fs.readFileSync("./devices.json", "utf8")); 
console.log(spaces);

//device holding area
const unregistered = [];

// Serve static files from 'flash-comm-ui/dist' (VUE app)
app.use(express.static(__dirname + '/flash-comm-ui/dist'));


// Socket.io server
io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("device", (id) => {
        //check if device exists in devices.json
        for(let i = 0; i < devices.length; i++) {
            if(devices[i].id == id) {
                //device exists
                console.log(`Socket.io: device ${id} joining ${devices[i].space}`);
                socket.join(devices[i].space);
                return;
            }
        }
        //device does not exist
        console.log(`Socket.io: device ${id} does not exist. Waiting for space assignment`);
        //check if in unregistered list
        for(let i = 0; i < unregistered.length; i++) {
            if(unregistered[i] == id) {
                //device exists
                console.log(`Socket.io: device ${id} already in unregistered list`);
                return;
            }
        }
        unregistered.push(id);
        io.emit("unregistered", unregistered);
    });

    socket.on("register", (data) => {
        //check if device exists in unregistered array
        for(let i = 0; i < unregistered.length; i++) {
            if(unregistered[i] == data.id) {
                //device exists
                console.log(`Socket.io: device ${data.id} added to devices.json`);
                devices.push(data);
                writeToJsonFileSync("./devices.json", devices);
                
                //alert device
                io.emit(data.id, data);

                // socket.join(data.space);
                // console.log(`Socket.io: device ${data.id} joing space ${data.space}`);
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
                if (spaces[i].flash) {
                    spaces[i].flash = false;
                } else {
                    spaces[i].flash = true;
                }

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

httpServer.listen(3000, () => {
    console.log("listening on *:3000");
});



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
  