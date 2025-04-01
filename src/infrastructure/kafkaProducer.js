const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'event-service',
    brokers: ['kafka:9092'], 
});

const producer = kafka.producer();

const bulkMessages = async () => {
    await producer.connect();

    const actions = ['login', 'logout', 'view', 'click', 'purchase'];
    const messages = [];

    for (let i = 1; i <= 100; i++) {  
        messages.push({
            value: JSON.stringify({
                userId: Math.floor(Math.random() * 1000),  
                action: actions[Math.floor(Math.random() * actions.length)],  
                timestamp: new Date().toISOString()
            })
        });
    }

    await producer.send({
        topic: 'user-activity',
        messages,
    });

    console.log(`✅ Produced ${messages.length} messages`);
    await producer.disconnect();
};

bulkMessages();
