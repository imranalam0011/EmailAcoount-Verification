const mongoose = require('mongoose');

//connect to db
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => console.log("DB connected established"))
.catch(() => console.log("DB connection error:", err));