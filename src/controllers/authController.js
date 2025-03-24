const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
    try {
        const { username, password, firstName, lastName, email } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
        }

        // Hacher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Créer un nouvel utilisateur
        const user = new User({
            username,
            password: hashedPassword,
            firstName,
            lastName,
            email
        });

        await user.save();
        
        // Créer un token JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        res.status(201).json({ token, user: { id: user._id, username: user.username } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Identifiants invalides' });
        }

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Identifiants invalides' });
        }

        // Créer un token JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        res.json({ token, user: { id: user._id, username: user.username } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};