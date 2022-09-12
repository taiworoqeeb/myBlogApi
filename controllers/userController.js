const bcrypt = require('bcryptjs');
const users = require('./../models/userModel');
const jwt = require('jsonwebtoken')
// const session = require('../server')

exports.UserRegister = async(req, res, next) => {
    try{
        const {username, email, password } = req.body;

        let user = await users.findOne({email});
        if(user) {
            return res.status(401).json({
                status: false,
                message: "user already exist"
            })
        }
        const salt = await bcrypt.genSalt(12);
        const hashedPass = await bcrypt.hash(password, salt);

        user = new users({
            username,
            email,
            password: hashedPass
        });
    
        await user.save();

 
        res.status(201).json({
            status: true,
            message: 'Registration successfully',
            user
        });

    } catch(err){
        console.log(err);
        res.status(500).json({
            status: false,
            message: "An error occured",
            err
        });
        next(err)
    }
};

exports.UserLogin = async(req, res, next)=>{
    try{
        const {email, password } = req.body;
        const user = await users.findOne({ 
            $or: [
                {
                    email: `${email}`
                },
                {
                    username: `${email}`
                }
            ]
        }).populate(['password']);
        if(!user){
            res.status(401).json({
                status: false,
                message: 'user does not exist'
            });
        }
        const validate = await bcrypt.compare(password, user.password);
        if(!validate){
            res.status(401).json({
                status: false,
                message: 'wrong password'
            });
        }
        let token = jwt.sign(
            {
            email: user.email, 
            username: user.username, 
            id: user._id}, 
            process.env.TOKEN, { expiresIn: "24h"});

        let result = {
            email: user.email, 
            username: user.username,
            token: `Bearer ${token}`,
        };

        res.status(200).json({
            status: true,
            message: "login successfully",
            data: result
        });

    } catch(err){
        console.log(err);
        res.status(500).json({
            status: false,
            message: "An error occurred", 
            err
        });
        next(err)
    }
}


