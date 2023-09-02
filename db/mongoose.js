const mongoose = require('mongoose')

mongoose.connect(
    config.DB_URL,
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    }
)
