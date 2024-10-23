import { sendEmail } from "../../utils";

const registerOrloginUser=async(req,res)=>{
try {
    if (req.body.payment_status) {
      return res
        .status(500)
        .json({ error: "Go back fucking hacker from here...." });
    }
    const { email} = req.body;

    const existingUser = await User.findOne({ email });
    const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/; // Regular expression for email validation
    if (!regex.test(email)) {
      return res.status(400).json({ message: "Email is not valid" });
    }
    if (existingUser) {

  
    

          const token = generateToken({
            _id: user._id,
          });
          res
            .status(200)
            .json({
              username: user.username,
              email: user.email,
              token,
              profilePhoto: user.profilePhoto,
              id: user._id,
            });
    }
    sendEmail(user.email,"Your account logged in Successfully")
    const newUser = new User({ email});
    await newUser.save();
    res.status(201).json({ email});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create user" });
  }
}

export {registerOrloginUser}