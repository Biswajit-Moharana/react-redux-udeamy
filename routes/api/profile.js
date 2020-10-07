const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/Users');
const Post = require('../../models/Post');


//@route    GET api/profile/me
//@desc     Get current user profile
//@access   private
router.get('/me', auth, async (req, res) => {
    try {
        let profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
    }
    //res.send("Profile route");
}
);
//@route    Post api/profile
//@desc     Create and update user profile
//@access   private
router.post('/', [
    auth, [
        check('status', 'Status is required')
            .not()
            .isEmpty(),
        check('skills', 'Skills is required')
            .not()
            .isEmpty()

    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        company,
        location,
        website,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;

    //Build profile object 
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    console.log(profileFields.skills);

    //Build social object

    profileFields.social = {}
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
        let profile = await Profile.findOne({ user: req.user.id });

        if (profile) {
            //update
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            );

            return res.json(profile);
        }

        //create

        profile = new Profile(profileFields);

        await profile.save();
        res.json(profile);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error');
    }


});
//@route    Get api/profile
//@desc     Get all the profile files
//@access   public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server error');
    }
});
//@route    Get api/profile/user/:userid
//@desc     Get the profile from userid
//@access   public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
        if (!profile) res.status(400).json({ msg: 'Profile is not found' });
        res.json(profile);
    } catch (err) {
        console.log(err.message);
        if (err.kind == 'ObjectId') {
            res.status(400).json({ msg: 'Profile is not found' });
        }
        res.status(500).send('Server error');
    }
});


//@route    Delete  api/profile
//@desc     Delete single profile file,user and post
//@access   Private
router.delete('/', async (req, res) => {
    try {
        //remove user posts
        await Post.deleteMany({ user: req.user.id });

        //remove profile
        await Profile.findOneAndRemove({ user: req.params.user_id });
        //remove user
        await User.findOneAndRemove({ _id: req.params._id });

        res.json({ msg: 'User deleted' });
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server error');
    }
});

//@route    PUT   api/profile/experience
//@desc     Add profile experience
//@access   Private

router.put('/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'company is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()
]
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description

        } = req.body;

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }
        try {
            const profile = await Profile.findOne({ user: req.user.id });
            profile.experience.unshift(newExp);

            await profile.save();

            res.json(profile);
        } catch (error) {
            console.log(error);
            res.status(500).send('server error');
        }
    })

//@route    Delete   api/profile/experience/:exp_id
//@desc     Delete  experience from user profile
//@access   Private

router.delete('/experience/:exp_id', auth,
    async (req, res) => {
        try {
            const profile = await Profile.findOne({ user: req.user.id });

            //Get remove index
            const removeindex = profile.experience
                .map(item => item.id).
                indexOf(req.params.exp_id);

            profile.experience.splice(removeindex, 1);

            await profile.save();

            res.json(profile);
        } catch (err) {
            console.log(err.message);
            res.status(500).send('server error');
        }
    })

//@route    PUT   api/profile/education
//@desc     Add profile education
//@access   Private

router.put('/education', [auth, [
    check('school', 'school is required').not().isEmpty(),
    check('degree', 'degree is required').not().isEmpty(),
    check('fieldofstudy', 'field of study is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()
]
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description

        } = req.body;

        const newEdu = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        }
        try {
            const profile = await Profile.findOne({ user: req.user.id });
            profile.education.unshift(newEdu);

            await profile.save();

            res.json(profile);
        } catch (error) {
            console.log(error);
            res.status(500).send('server error');
        }
    })

//@route    Delete   api/profile/education
//@desc     Delete  education from user profile
//@access   Private

router.delete('/education/:edu_id', auth,
    async (req, res) => {
        try {
            const profile = await Profile.findOne({ user: req.user.id });

            //Get remove index
            const removeindex = profile.education
                .map(item => item.id).
                indexOf(req.params.edu_id);

            profile.education.splice(removeindex, 1);

            await profile.save();

            res.json(profile);
        } catch (err) {
            console.log(err.message);
            res.status(500).send('server error');
        }
    })


module.exports = router;