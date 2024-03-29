const express = require("express");
const router = express.Router();
const registerUser = require("../controllers/auth/register");
const loginUser = require("../controllers/auth/login");
const refresh = require("../controllers/auth/refresh");
const emailexist = require("../controllers/auth/emailExist");
const createPost = require("../controllers/post/createPost");
const getPost = require("../controllers/post/getPost");
const likes = require("../controllers/post/like");
const auth = require("../middleware/auth");
const userDetails = require("../controllers/auth/userDetails");
const isUser = require("../controllers/auth/isUser");
const createComment = require("../controllers/comments/createComment");
const getComment = require("../controllers/comments/getComments");
const getUserPosts = require("../controllers/post/getUserPost");
const followUser = require("../controllers/auth/follow");
const createStatus = require("../controllers/status/createStatus");
const getStatuses = require("../controllers/status/getStatus");
const profileImage = require("../controllers/auth/userPhoto");
const getSinglePost = require("../controllers/post/getOnePost");
const logout = require("../controllers/auth/logout");
const otpVerify = require("../controllers/auth/otpVerification");
const forgot = require("../controllers/auth/forgot");
// const googleAuth = require("../controllers/auth/oAuth")
const passport = require("passport");
const searchUser = require("../controllers/auth/searchUser")

router.get("/register", (req, res) => {
  res.send("Register");
});

router.post("/user/register", registerUser);
router.post("/user/login", loginUser);
router.post("/user/refresh", refresh);
router.post("/user/emailexist", emailexist);
router.get("/user/profile/",[auth], userDetails);
router.get("/user/profile/isUser", [auth], isUser);
router.post("/user/follow",[auth], followUser);
router.post("/user/uploadProfilePic",[auth], profileImage.uploadImage);
router.post("/user/removeProfilePic",[auth], profileImage.removeImage);
router.post("/user/logout",[auth], logout);
router.post("/user/otpVerify", otpVerify);
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.post("/user/forgot", forgot.ForgotPassword);
router.post("/user/resetPassword", forgot.ResetPassword);
router.post("/user/changePassword", [auth], forgot.ChangePassword);
router.get("/user/search/:input",searchUser)

router.get("/auth/google/callback", passport.authenticate("google"), function (req, res) {
  res.redirect(process.env.FRONTEND_URL);
  // res.send(req.user)
});
router.get("/asdf",[auth], function (req, res) {
  return res.status(200).json({ message: req.user });
});
router.post("/asdfg", function (req, res) {
  return res.status(200).json({ message: req.user });
});


router.post("/post/create", [auth], createPost);
router.get("/post/allPost/",[auth], getPost);
router.post("/post/likes", [auth], likes);
router.get("/post/reels_tray", getUserPosts);
router.get("/post/get",[auth], getSinglePost);

router.post("/comment/create",[auth], createComment);
router.get("/comment/fetch", getComment);

router.post("/status/create",[auth], createStatus);
router.get("/status/fetch",[auth], getStatuses);

module.exports = router;
