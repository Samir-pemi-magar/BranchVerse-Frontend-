import { io } from "socket.io-client";

const socket = io("http://localhost:4000", {
    autoConnect: false,
});

export const attachToken = () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    socket.auth = { token };

    if (socket.connected) {
        socket.disconnect();
        socket.connect();
    }
};

export default socket;