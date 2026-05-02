import { Server } from "socket.io"


let connections = {}
let messages = {}
let timeOnline = {}
let activeRooms = {} // Track participant counts for admin

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });


    io.on("connection", (socket) => {



        // socket.on("join-call", (path) => {

        //     if (connections[path] === undefined) {
        //         connections[path] = []
        //     }
        //     connections[path].push(socket.id)

        //     timeOnline[socket.id] = new Date();

        //     // connections[path].forEach(elem => {
        //     //     io.to(elem)
        //     // })

        //     for (let a = 0; a < connections[path].length; a++) {
        //         io.to(connections[path][a]).emit("user-joined", socket.id, connections[path])
        //     }

        //     if (messages[path] !== undefined) {
        //         for (let a = 0; a < messages[path].length; ++a) {
        //             io.to(socket.id).emit("chat-message", messages[path][a]['data'],
        //                 messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
        //         }
        //     }

        // })
        // socket.on("join-call", (path) => {
        //     if (!connections[path]) {
        //         connections[path] = [];
        //     }
        //     connections[path].push(socket.id);
        //     timeOnline[socket.id] = new Date();

        //     connections[path].forEach((clientId) => {
        //         io.to(clientId).emit("user-joined", socket.id, connections[path]);
        //     });

        //     // Send previous messages reliably
        //     if (messages[path]) {
        //         messages[path].forEach((msg) => {
        //             io.to(socket.id).emit("chat-message", msg.data, msg.sender, msg["socket-id-sender"]);
        //         });
        //     }
        // });

        socket.on("join-call", (path) => {
            if (!connections[path]) {
                connections[path] = [];
            }
            connections[path].push(socket.id);
            timeOnline[socket.id] = new Date();
            activeRooms[path] = connections[path].length;

            connections[path].forEach((clientId) => {
                io.to(clientId).emit("user-joined", socket.id, connections[path]);
            });

            // Send previous messages reliably
            // if (messages[path]) {
            //     messages[path].forEach((msg) => {
            //         io.to(socket.id).emit("chat-message", msg.data, msg.sender, msg["socket-id-sender"]);
            //     });
            // }
            // Clear chat messages when a new user joins
            // Initialize chat messages if they don't exist
            if (!messages[path]) {
                messages[path] = [];
            }


        });



        // socket.on("reconnect", () => {
        //     console.log("User reconnected:", socket.id);

        //     let roomId = Object.keys(connections).find((room) =>
        //         connections[room].includes(socket.id)
        //     );

        //     if (roomId) {
        //         io.to(socket.id).emit("reconnect-success", roomId);
        //     }
        // });



        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        })

        // socket.on("chat-message", (data, sender) => {

        //     const [matchingRoom, found] = Object.entries(connections)
        //         .reduce(([room, isFound], [roomKey, roomValue]) => {


        //             if (!isFound && roomValue.includes(socket.id)) {
        //                 return [roomKey, true];
        //             }

        //             return [room, isFound];

        //         }, ['', false]);

        //     if (found === true) {
        //         if (messages[matchingRoom] === undefined) {
        //             messages[matchingRoom] = []
        //         }

        //         messages[matchingRoom].push({ 'sender': sender, "data": data, "socket-id-sender": socket.id })
        //         console.log("message", matchingRoom, ":", sender, data)

        //         connections[matchingRoom].forEach((elem) => {
        //             io.to(elem).emit("chat-message", data, sender, socket.id)
        //         })
        //     }

        // })


        // socket.on("chat-message", (data, sender) => {
        //     if (!data.trim()) return; // Prevent empty messages

        //     const matchingRoom = Object.entries(connections).find(([room, users]) => users.includes(socket.id));

        //     if (matchingRoom) {
        //         const [roomKey] = matchingRoom;
        //         messages[roomKey] = messages[roomKey] || [];

        //         messages[roomKey].push({ sender, data, "socket-id-sender": socket.id });
        //         console.log("Message:", roomKey, ":", sender, data);

        //         connections[roomKey].forEach((user) => {
        //             io.to(user).emit("chat-message", data, sender, socket.id);
        //         });
        //     }
        // });
        socket.on("chat-message", (data, sender) => {
            if (!data.trim()) return; // Prevent empty messages

            const matchingRoom = Object.entries(connections).find(([room, users]) => users.includes(socket.id));

            if (matchingRoom) {
                const [roomKey] = matchingRoom;
                messages[roomKey] = messages[roomKey] || [];

                messages[roomKey].push({ sender, data, "socket-id-sender": socket.id });

                connections[roomKey].forEach((user) => {
                    io.to(user).emit("chat-message", data, sender, socket.id);
                });
            }
        });

        socket.on("reaction", (emoji) => {
            const matchingRoom = Object.entries(connections).find(([room, users]) => users.includes(socket.id));
            if (matchingRoom) {
                const [roomKey] = matchingRoom;
                connections[roomKey].forEach((user) => {
                    io.to(user).emit("reaction", emoji, socket.id);
                });
            }
        });



        socket.on("disconnect", () => {
            if (timeOnline[socket.id]) {
                var diffTime = Math.abs(timeOnline[socket.id] - new Date());
                delete timeOnline[socket.id];
            }

            for (const [room, userList] of Object.entries(connections)) {
                if (userList.includes(socket.id)) {
                    // Notify others in the room
                    userList.forEach(clientId => {
                        if (clientId !== socket.id) {
                            io.to(clientId).emit('user-left', socket.id);
                        }
                    });

                    // Remove user from room
                    connections[room] = userList.filter(id => id !== socket.id);
                    activeRooms[room] = connections[room].length;

                    // Cleanup empty rooms
                    if (connections[room].length === 0) {
                        delete connections[room];
                        delete messages[room];
                        delete activeRooms[room];
                    }
                }
            }
        });

        // socket.on("reconnect", () => {
        //     console.log("User reconnected: ", socket.id);

        //     const matchingRoom = Object.entries(connections).find(([room, users]) =>
        //         users.includes(socket.id)
        //     );

        //     if (matchingRoom) {
        //         const [roomKey] = matchingRoom;
        //         io.to(socket.id).emit("reconnect-success", roomKey);
        //     }
        // });



        //     socket.on("leave-call", (socketId) => {
        //         for (const [room, users] of Object.entries(connections)) {
        //             if (users.includes(socketId)) {
        //                 connections[room] = users.filter(user => user !== socketId);

        //                 // Notify remaining users that this user left
        //                 users.forEach((user) => {
        //                     io.to(user).emit("user-left", socketId);
        //                 });

        //                 if (connections[room].length === 0) {
        //                     delete connections[room]; // Remove empty rooms
        //                 }
        //                 break;
        //             }
        //         }
        //     });



    })



    return { io, activeRooms };
}
