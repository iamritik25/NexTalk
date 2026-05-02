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

            if (!messages[path]) {
                messages[path] = [];
            }
        });

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        })

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

    })

    return { io, activeRooms };
}
