const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/Users');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
//@route    GET api/auth
//@desc     Test route
//@access   Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
        res.send("Auth route");

    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server error');
    }
}
);
//@route    Post api/auth
//@desc     Test route
//@access   Public

router.post('/', [
    check('email', 'Please include a valid Email').isEmail(),
    check('password', 'Please enter valid password').isLength()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {  email, password } = req.body;

    try {
        //see if user exists
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
        }

        const isMatch=bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
        }



        //Return jsonwebtoken
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            config.get('jwtSecret'),
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        )

    } catch (err) {
        console.error(err.message);
        res.status(500).json('server error');
    }

});


module.exports = router;