const { Server } = require("socket.io");

const io = new Server({ cors: "http://192.168.241.219:8080" });

let onlineUsers = [];

io.on("connection", (socket) => {
  console.log("new connection: ", socket.id);

  socket.on("addNewUser", (userID) => {
    !onlineUsers.some((user) => user.userID === userID) &&
      onlineUsers.push({
        userID,
        socketID: socket.id,
      });
    console.log("onlineUsers", onlineUsers);

    io.emit("getOnlineUsers", onlineUsers);
  });

  socket.on("send-request-matching", (data) => {
    // console.log('hong diem cho dien');
    console.log("hoho", data);
    const user = onlineUsers.find((user) => user.userID == data.matchId);
    // console.log(onlineUsers);
    // console.log('bicute');
    // console.log('hehe', user);
    // console.log('bi siu cuteeeeeeee');
    console.log(user);
    if (user) {
      socket.to(user.socketID).emit("receive-request-matching", data);
    }
  });

  socket.on("accept-request-matching", (data) => {
    const user = onlineUsers.find((user) => user.userID == data.fromId);
    console.log(user);
    if (user) {
      socket.to(user.socketID).emit("move-to-new-conversation", data);
    }
  });
  socket.on("block-conversation", (data) => {
    const user = onlineUsers.find((user) => user.userID == data.idUser_);
    console.log("user " + user);
    if (user) {
      console.log("hehe có block ko? " + data.value);
      socket.to(user.socketID).emit("blocked-conversation", data);
    }
  });

  socket.on("open-block-conversation", (data) => {
    const user = onlineUsers.find((user) => user.userID == data.idUser_);
    console.log("user open " + user);
    if (user) {
      console.log("hehe mở block ko? " + data);
      socket.to(user.socketID).emit("opened-block-conversation", data);
    }
  });

  socket.on("send-message", (data) => {
    console.log("SEND Message");
    console.log(data._idSession);
    console.log(data.idSession);
    console.log(onlineUsers);
    const user = onlineUsers.find((user) => user.userID == data._idSession);
    console.log(user);
    if (user) {
      socket.to(user.socketID).emit("receive-message", data);
      socket.to(user.socketID).emit("receive-notification", {
        idConversation: data.idConversation,
        senderID: data.idSession,
        receiverID: data._idSession,
        isRead: false,
        date: new Date(),
      });
    }
  });

  socket.on("send-file", (data) => {
    console.log("SEND FILE");
    console.log(data._idSession);
    console.log(onlineUsers);
    const user = onlineUsers.find((user) => user.userID == data._idSession);
    console.log(user);
    if (user) {
      socket.to(user.socketID).emit("receive-message", data);
      socket.to(user.socketID).emit("receive-notification", {
        idConversation: data.idConversation,
        senderID: data.idSession,
        receiverID: data._idSession,
        isRead: false,
        date: new Date(),
      });
    }
  });

  socket.on("deny-matching", (data) => {
    console.log(data);
    console.log("deny");
    const user = onlineUsers.find((user) => user.userID == data.fromId);
    console.log(user);
    if (user) {
      socket.to(user.socketID).emit("send-deny-matching", data);
    }
  });

  socket.on("create-notif-matching", (data) => {
    console.log(data);
    console.log("create-notif-matching");
    const user = onlineUsers.find((user) => user.userID == data.matchId);
    console.log(user);
    if (user) {
      socket.to(user.socketID).emit("receive-notif-matching", data);
    }
  });

  socket.on("create-zodiac-message", (data) => {
    console.log("create-zodiac-message");
    socket.broadcast.emit("receive-zodiac-message", data);
  });

  // socket.on("offer", (candidate) => {
  //   console.log("on offer");
  //   socket.broadcast.emit("offer", candidate);
  // })

  // socket.on("answer", (candidate) => {
  //   console.log("on answer");
  //   socket.broadcast.emit("answer", candidate);
  // })

  // socket.on("ice_candidate", (candidate) => {
  //   console.log("on ice candidate");
  //   socket.broadcast.emit("ice_candidate", candidate);
  // })

  socket.on("offer", (data) => {
    const user = onlineUsers.find((user) => user.userID == data.toUserID);
    if (user) {
      console.log("offer");
      console.log(data);
      socket.to(user.socketID).emit("offer", data.offer);
    }
  });

  socket.on("answer", (data) => {
    const user = onlineUsers.find((user) => user.userID == data.toUserID);
    if (user) {
      console.log("offer");
      console.log(data);
      socket.to(user.socketID).emit("answer", data);
    }
  });

  socket.on("ice_candidate", (data) => {
    const user = onlineUsers.find((user) => user.userID == data.toUserID);
    if (user) {
      console.log("ice_candidate", data);
      console.log(data);
      socket.to(user.socketID).emit("ice_candidate", data.candidate);
    }
  });

  socket.on("start-call", (data) => {
    console.log(data);
    const user = onlineUsers.find((user) => user.userID == data.to);
    if (user) {
      socket.to(user.socketID).emit("receive-call", data);
    }
  });

  socket.on("close-call", (data) => {
    console.log("close-call socket", data);
    const user = onlineUsers.find((user) => user.userID == data.id);
    if (user) {
      socket.to(user.socketID).emit("receive-close-call", data);
    }
  });

  socket.on("stop-calling", () => {
    socket.emit("stopped-calling");
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketID !== socket.id);
    io.emit("getOnlineUsers", onlineUsers);
  });
});
io.listen(3001, {
  cors: "*",
  origins: ["http://192.168.241.219:8080"],
  path: "/socket.io",
});
