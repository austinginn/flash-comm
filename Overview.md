# Flash Comm

Flash Comm is a web based take on the Clear-Com FL-7 call signal flasher.  This was project was created so that a person on stage could signal the Front of House engineer to get on comms.  While the described use case is very specific, this concept can be adapted to many other production communication scenerios. 

## Table of Contents

- [Overview](#overview)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Overview

The Flash Comm repository contains a web server and a sample client implementation.  Both are written in JS for node.js. A specific README for each can be found in the corresponding folder.  The following provides a brief overview of Flash Comm.

Flash Comm uses a node.js server to disseminate signal/flash data to all connected clients using socket.io.  The server also hosts a Vue3 web application to provide a dashboard and call page for users.  Multiple signal/flash spaces can be added to the server.  In our environment we have a stage1, stage2 and production space to ensure the right communication channel is used.

The dashboard displays all configured spaces and their status.  When a device first trys to communicate with the Flash Comm server it generates a unique ID and then waits for it to be named and assigned in the dashboard.  After this initial setup the device will automatically join the assigned space. 

The call page provides a web based interface to toggle the signal/flash for a space.  To join a space navigate to http://serverIPAddress:3000/call/:space:

## Contributing
If you'd like to contribute to this project, please follow these guidelines:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your changes to your fork.
5. Create a pull request, describing your changes in detail.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

MIT License

## Contact
Hey! My name is Austin.  I specialize in creating custom AVL Integration solutions. If you're interseted in collaborating you can reach me at [austinleeginn@gmail.com](mailto:austinleeginn@gmail.com).