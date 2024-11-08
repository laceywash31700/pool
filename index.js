const express = require('express');
const path = require('path');
const app = express();

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Set the view engine to EJS and configure views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route to render the pool game page
app.get('/', (req, res) => {
    res.render('pool'); // Renders views/pool.ejs
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
