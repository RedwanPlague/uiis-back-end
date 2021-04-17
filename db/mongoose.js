const mongoose = require('mongoose')

mongoose.connect(
    'mongodb+srv://taskapp:!Asswordp20@cluster0.b0dxn.mongodb.net/uiis?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    }
)
