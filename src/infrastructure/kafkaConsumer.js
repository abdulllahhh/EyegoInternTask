const { Kafka } = require('kafkajs');
const mongoose = require('mongoose');
require('dotenv').config();

const userLogSchema = new mongoose.Schema({
    userId: Number,
    action: String,
    timestamp: { type: Date, default: Date.now }
});
const UserLog = mongoose.model('UserLog', userLogSchema);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

const kafka = new Kafka({
    clientId: 'event-service',
    brokers: ['localhost:9092'], //change if using Docker 
});

const consumer = kafka.consumer({ groupId: 'user-group' });

const consumeMessages = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'user-activity', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const logData = JSON.parse(message.value.toString());
            console.log('📥 Consumed:', logData);

            const logEntry = new UserLog(logData);
            await logEntry.save();
            console.log('Saved to MongoDB Atlas:', logData);
        },
    });
};

consumeMessages();
