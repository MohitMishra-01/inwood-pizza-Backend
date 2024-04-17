const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const nodemailer = require("nodemailer")
const otpGenerator = require("otp-generator")


const registerController = async (req, res) =>{
    try{
        const existingUser = await User.findOne({email: req.body.email});
        if(existingUser){
            return res.status(200).send({
                message: "User already exist",
                success: false,
            })
        }

        const password = req.body.password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt)
        req.body.password = hashPassword;

        const confrimPassword = await bcrypt.hash(req.body.passwordConfirm, salt);

        const otp = otpGenerator.generate(6, {
            digits: true,
            upperCase: false,
            specialChars: false,
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
        });
        

        req.body.passwordConfirm = confrimPassword
        if(req.body.password === req.body.passwordConfirm){
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                passwordConfirm: req.body.passwordConfirm,
                otp: otp,
            });
            await newUser.save();

            const token = jwt.sign({id : newUser._id}, process.env.JWT_SECRET, {
                expiresIn: "1d",
            })
            const transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: "",
                    pass: ""
                },
            });

            const mailOptions = {
                from: " Inwood Pizza Shop",
                to: req.body.email,
                subject: "OTP for Email verification",
                text: ` Your Verify OTP is ${otp}`
            };

            transporter.sendMail(mailOptions), (error, info) => {
                if(error){
                    console.log(error);
                    return res.status(500).send("Error Sending email..");
                }
                res.send({
                    message: "OTP Sent to email",
                })
            }
            return res.status(201).send({
                message: "Register Sucessfully",
                data: {
                user: newUser,
                token,
                },
                success: true,
            });
        }
        else{
            return res.status(201).send({
                message: "Password not Match",
                success: false,
            });
        }
    } catch (error){
        console.log(error);
        return res.status(500).send({
            message: "Register error",
            success: false
        });
    }
};

const authController = async (req, res) => {
    try {
        const user = await User.findOne({_id: req.body.userId});
        if(!user){
            return res.status(200).send({
                message: "user not found",
                success: false,
            })
        } else{
            console.log(user);
            return res.status(200).send({
                message: "Register Successfully",
                data: {
                    user,
                },
                success: true,
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Auth error",
        });
    }
};

const loginController = async(req, res) =>{
    try {
        const user = await User.findOne({email: req.body.email}).select(
            "+password"
        );
        if(!user){
            return res.status(200).send({
                message: "user not found",
                success: false,
            });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password)
        const signuser = await User.findOne({email: req.body.email})
        
        if(!isMatch) {
            res.status(500).send({
                success: false,
                message: "Invalid Password and Email",
            });
        }

        const token = jwt.sign({id : signuser._id}, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });

        return res.status(201).send({
            message: "Login Sucessfully",
            data: {
            user: signuser,
            token,
            },
            success: true,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Auth error",
        });
    }
}

const verifyOTPController = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        console.log("Hello",user.otp)
        if (user.otp === req.body.combineOtp) {
            user.isVerified = true;
            await user.save();
            res.status(200).send({
                success: true,
                message: `OTP verified`,
            });
        } else {
            res.status(200).send({
                success: false,
                message: `OTP not verified`,
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: `Failed to verify OTP1`,
        });
    }
}

module.exports = {registerController, authController, loginController, verifyOTPController};