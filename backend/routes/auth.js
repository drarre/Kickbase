const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/login', async (req, res) => {
    const { em, pass } = req.body;

    try {
        const response = await axios.post(`${process.env.API_URL}/user/login`, {
            em,
            pass,
            loy: false,
            ext: true,
            rep: {},
        });

        if (response.data && response.data.tkn) {
            res.json({ tkn: response.data.tkn });
        } else {
            res.status(401).json({ message: 'Login failed' });
        }
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
});
