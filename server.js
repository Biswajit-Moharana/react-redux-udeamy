const express = require('express');
const connectDB = require('./config/db');
const path = require('path');

const app = express();
///* npm run server*/
//connect To db
connectDB();

//Init Middleware
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API running'));
//Define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

//server static assets and productions

if (process.env.NODE_ENV === 'production') {
    //set static folder 
    app.use(express.static('clientreactredux/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'clientreactredux', 'build', 'index.html'));
    })
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server started on ${PORT}`));