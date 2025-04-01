require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userLogSchema = new mongoose.Schema({
    userId: Number,
    action: String,
    timestamp: { type: Date, default: Date.now }
});
const UserLog = mongoose.model('UserLog', userLogSchema);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB Connection Error:', err));

const app = express();
app.use(cors());
app.use(express.json());

app.get('/logs', async (req, res) => {
    try {
        const { page = 1, limit = 10, userId, action, startDate, endDate } = req.query;
        const query = {};

        if (userId) query.userId = userId;
        if (action) query.action = action;
        if (startDate && endDate) {
            query.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const logs = await UserLog.find(query)
            .sort({ timestamp: -1 }) 
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await UserLog.countDocuments(query);

        res.json({
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            logs
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
