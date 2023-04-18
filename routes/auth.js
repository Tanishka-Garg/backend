const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");

const JWT_secret = "thisisasecret";
//create a user using POST "api/auth/createUser"
router.post(
  "/createUser",
  [
    body("email", "enter valid email").isEmail(),
    body("password", "enter valid password").isLength({ min: 7 }),
    body("name").isLength({ min: 3 }),
  ],
  async (req, res) => {
    //check error return bad request if any
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //check if same email is unique or not
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ error: "email already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const securepass = await bcrypt.hash(req.body.password, salt);
      //create a new user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: securepass,
      });

      const data = {
        user: {
          id: user.id,
        },
      };
      const auth_token = jwt.sign(data, JWT_secret);

      res.json({ auth_token });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("some error occurred");
    }
  }
);

//authenticate a user using POST "api/auth/login"
router.post(
  "/login",
  [
    body("email", "enter valid email").isEmail(),
    body("password", "enter valid password").exists(),
  ],
  async (req, res) => {
    //check error return bad request if any
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    //check if user  email exists or not
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: "enter valid credentials" });
      }
      const comparePassword = await bcrypt.compare(password, user.password);
      if (!comparePassword) {
        return res.status(400).json({ error: "enter valid credentials" });
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      const auth_token = jwt.sign(data, JWT_secret);

      res.json({ auth_token });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("some error occurred");
    }
  }
);

// get a user details using POST "api/auth/getuser"
router.post("/getuser", fetchuser, async (req, res) => {
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   return res.status(400).json({ errors: errors.array() });
  // }
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("some error occurred");
  }
});

module.exports = router;
