const { Server } = require("socket.io");
let io = null;

module.exports = {
  initsocketIO: (httpServer) => {
    try {
      io = new Server(httpServer, {
        cors: {
          origin: "*",
        },
      });

      io.on("connection", (socket) => {
        console.log("user has connected", socket.id);
        const userId = socket.handshake.query.userId;
        console.log(userId);
        socket.join(userId);

        socket.on("disconnect", () => {
          console.log("user disconnected");
        });
      });
    } catch (error) {
      console.log("Error in Socket IO Initialization", error);
    }
  },

  getIO: () => {
    if (io !== null) {
      return io;
    }
  },
};
