const axios = require('axios');
const jwt = require('jsonwebtoken');
const oauth2Client = require('../utils/oauth2client');
const catchAsync = require('./../utils/catchAsync');
const User = require('../models/userModel');




const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_TIMEOUT,
    });
};



// Create and send Cookie ->
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user.id);

    console.log(process.env.JWT_COOKIE_EXPIRES_IN);
    const cookieOptions = {
        expires: new Date(Date.now() + +process.env.JWT_COOKIE_EXPIRES_IN),
        httpOnly: true,
        path: '/',
        // sameSite: "none",
        secure: false,
    };
    if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
        cookieOptions.sameSite = 'none';
    }

    user.password = undefined;

    res.cookie('jwt', token, cookieOptions);

    console.log(user);

    res.status(statusCode).json({
        message: 'success',
        token,
        data: {
            user,
        },
    });
};




/* GET Google Authentication API. */
exports.googleAuth = catchAsync(async (req, res, next) => {
    const code = req.query.code;
    console.log("USER CREDENTIAL -> ", code);

    const googleRes = await oauth2Client.oauth2Client.getToken(code);

    console.log("Google Response",googleRes)
    
    oauth2Client.oauth2Client.setCredentials(googleRes.tokens); ////Without calling setCredentials, the oauth2Client will not include the access token in subsequent API requests, resulting in unauthorized requests.

    const userRes = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
	);

    console.log("User Res",userRes.data)


    // data: {
    //     id: '106354731852151498313',
    //     email: 'suphal@klizos.com',
    //     verified_email: true,
    //     name: 'Suphal Maity',
    //     given_name: 'Suphal ',
    //     family_name: 'Maity',
    //     picture: 'https://lh3.googleusercontent.com/a/ACg8ocLYdH2YirG1IyWwpb7MigjWY7JamyFnphsryaXWaYaCYmPSvmI=s96-c',
    //     hd: 'klizos.com'
    //   }



    ////// write your function to to find and do the next thing
	
    let user = await User.findOne({ email: userRes.data.email });
    console.log("user from db",user)
   
    if (!user) {
        console.log('New User found');
        user = await User.create({
            name: userRes.data.name,
            email: userRes.data.email,
            image: userRes.data.picture,
        });
    }

    createSendToken(user, 201, res);
});


