# Flash-Comm Server

### Installation

1. Clone repository to your device.

```sh
git clone https://github.com/austinginn/flash-comm.git
```
2. Navigate to server directory.
```sh
cd flash-comm/server
```
3. Install dependencies
    - Socket.io
    - Express
```sh
npm install
```

### Web UI
A precompiled web app is included in this repository and will run out of the box.  If you want to build the web UI from scratch, the repository can be found [here](https://github.com/austinginn/flash-comm-ui).

### Client Example
Only one active repository currently for nodejs, found [here](https://github.com/austinginn/flash-comm-nodejs)

### Configuration
The flash-comm server lets you define spaces in a spaces.json file. If you run the server before creating spaces.json, one will be created for you with generic space naming. You can always modify this in the future.
1. Create a spaces.json file with at least one space.
```sh
touch spaces.json
nano spaces.json
```
2. The spaces.json file should be formated like this:
```JSON
[
    {
        "id": "someUniqueID",
        "name": "human readable space name",
        "flash": false
    },
    {
        "id": "someUniqueID2",
        "name": "human readable space name 2",
        "flash": false
    },
    ...
]
```
3. A devices.json file is created on first run.  Edit this file if you need to modify a device or want to manually enter a device.

### Usage
```sh
npm start
```
By default the server runs on port 3000. You can pass a port as the first argument.

```sh
npm start --port=3001
```
In a production environment, use a process manager like PM2 to run the server.




