const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to DB')
}).catch(() => {
    console.log('Failed to connect to DB')
})

//6dGW7h2VmJCF97h3