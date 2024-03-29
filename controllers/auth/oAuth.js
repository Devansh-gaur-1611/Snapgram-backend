const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../../models/user");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
      proxy: true,
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        const isEmailExist = await User.exists({ email: profile.emails[0].value });

        if (isEmailExist) {
          User.findOne({ email: profile.emails[0].value })
            .then(async (user) => {
              if (user) {
                if (user.googleId != null && user.googleId == profile.id) {
                  done(null, user);
                } else {
                  const newDoc = await User.findByIdAndUpdate({ email: profile.emails[0].value }, { googleId: profile.id }, { new: true });
                  done(null, newDoc);
                }
              }
            })
            .catch((err) => {
              done(err, null);
            });
        } else {
          User.create({ name: profile?.displayName,userName:profile?.emails[0].value.split('@')[0], email: profile?.emails[0].value, isVerified: profile?.emails[0].verified, googleId: profile.id })
            .then((response) => {
              done(null, response);
            })
            .catch((err) => {
              done(err, null);
            });
        }
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  if (user != null) {
    done(null, user.id);
  }else{
    done(null, null);
  }
});

passport.deserializeUser(function (id, done) {
  if(id != null){
    User.findById(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
  } 
});
