const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");
const { sendEmail } = require("../utils");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const client = new OAuth2Client(`${process.env.GOOGLE_CLIENT_ID}`);
// google login
const googleLogin = async (req, res) => {
  const credentials = req.query.credentials;

  // Check if credentials is a string
  if (typeof credentials !== "string") {
    return res.status(400).send("Invalid credentials");
  }

  try {
    let email, email_verified, name, picture, given_name, family_name, sub;
    if (req.query.flag === "link") {
      const response = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${credentials}`,
        {
          headers: {
            Authorization: `Bearer ${credentials}`,
            Accept: "application/json",
          },
        }
      );
      ({
        email,
        verified_email: email_verified,
        name,
        picture,
        given_name,
        family_name,
        id: sub,
      } = response.data);
    } else {
      const verify = await client.verifyIdToken({
        idToken: credentials,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      ({ email, email_verified, name, picture, given_name, family_name, sub } =
        verify.getPayload());
    }

    if (!email_verified) {
      return res.status(500).json({ message: "Invalid email" });
    }
    console.log("hello 1");
    console.log(sub, "sub");

    const password =
      email +
      "sdkjfksdjfksdf735893475ncv8wrhj89fisjdf89wrj89usijf8urewjr23109587489573djfsdjft4hrshfsdfisdfsdfsdfsdjfsdfisduiofsdf8978957435iuerw89udshifijfd";
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken({
        _id: user._id,
      });
      sendEmail(user.email, "Your account logged in Successfully");
      return res.status(200).json({
        username: user.username,
        email: user.email,
        token,
      });
    } else {
      let baseUsername = given_name;
      let timestamp = new Date().getTime(); // This will give you the number of milliseconds since January 1, 1970
      let username = `${baseUsername}_${timestamp}`;
      const newUser = new User({
        username,
        email,
        password: password,
        googleId: sub,
      });
      await newUser.save();
      const token = generateToken({
        _id: newUser._id,
      });
      sendEmail(email, "Your account logged in Successfully");
      return res.status(200).json({
        username,
        email,
        token,
      });
    }

    // generate token
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not login user" });
  }
};
const googleLogOut = async (req, res) => {
  try {
    const user = await User.findOne({ email:req.user.email });

    sendEmail(user.email, "Your account logged out Successfully");
    return res.status(200).json({
      message: "Logged Out Sccessfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not login user" });
  }
};

// Register new user
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await User.create({ name, email, password });
  res.status(201).json({ token: generateToken(user._id) });
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({ token: generateToken(user._id) });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
};

module.exports = { registerUser, loginUser, googleLogin,googleLogOut };
