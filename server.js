const express = require("express");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
// const session = require("express-session");
const cookieSession = require("cookie-session");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
dotenv.config({ path: "./config.env" });

const routes = require("./routes");
const db_url = process.env.DB_URL;
const PORT = process.env.PORT || 5000;
const passport = require("passport");
const RedisServices = require("./services/RedisServices");
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: ["HeyHowareusjfcytgn"],
    httpOnly: true,
  })
);
// app.use(session({ secret: "thisismyfirstinstagramcloneapp" }));
require("./controllers/auth/oAuth");

app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/api", routes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

var userSet = new Set();

mongoose
  .connect(db_url)
  .then(() => console.log("db connected"))
  .catch((err) => console.log(err));

const server = app.listen(PORT, () => {
  console.log("server running on port " + PORT);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    // methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("connected to socket.io server" + socket.id);
  // console.log(socket)
  socket.on("setup", async (userData) => {
    console.log("setup for " + userData.id + " " + new Date().toLocaleString());
    socket.join(userData.id);
    socket.userData = userData;
    userSet.add(userData.id);
    // console.log(socket.rooms)
    // console.log(userData.id)
    socket.emit("connected");
  });

  socket.on("join-chat", (room) => {
    socket.join(room);
    console.log("user joined room: " + room);
    // console.log(socket.rooms)
  });

  socket.on("new-message", async (newMessageRecieved) => {
    if (!newMessageRecieved.chat.users) return console.log("chat.users is not defined");

    var msg = { ...newMessageRecieved };
    msg.isSender = false;
    newMessageRecieved.chat.users.forEach(async (user) => {
      const userId = user._id;
      if (userId === newMessageRecieved.sender._id) return;
      if (userSet.has(userId)) {
        socket.in(userId).emit("message received", msg);
        socket.in(userId).emit("message received chat", msg);
      } else {
        await RedisServices.setUserStatus(userId, newMessageRecieved.chat._id, 1);
      }
    });
  });

  socket.on("updateUnRead", async (data) => {
    await RedisServices.setUserStatus(socket.userData.id, data.chatId, data.count);
  });

  socket.on("disconnect", async () => {
    if (socket.userData) {
      const userId = socket.userData.id;
      console.log(`User ${userId} disconnected`);
      userSet.delete(userId);
    } else {
      console.log("socket.userData is not defined");
    }
  });
});
