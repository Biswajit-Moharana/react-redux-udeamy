const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const gravtar = require('gravatar');
const bcrypt = require('bcryptjs');
const User = require('../../models/Users');
const jwt = require('jsonwebtoken');
const config = require('config');

//@route    Post api/user
//@desc     register user
//@access   Public
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid Email').isEmail(),
    check('password', 'Please enter a valid password of 6 or more charcters').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;

    try {
        //see if user exists
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
        }

        //Get users gravatar

        const avatar = gravtar.url('email',
            {
                s: '200',
                r: 'pg',
                d: 'mm'
            }
        )

        user = new User({
            name,
            email,
            avatar,
            password
        });

        //Encrpyt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
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