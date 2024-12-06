const express = require('express'); // Import Express framework for building web applications
const multer = require('multer'); // Middleware for handling file uploads
const dotenv = require('dotenv'); // For loading environment variables from a .env file
const session = require('express-session'); // Middleware for managing user sessions

// Import models
const memberModel = require('./models/member'); // Handles database interaction for members
const legoSetModel = require('./models/legoSet'); // Handles database interaction for Lego sets
const bidModel = require('./models/bid'); // Handles database interaction for bids

dotenv.config(); // Load environment variables from the .env file

const app = express(); // Create an Express application

// Middleware configuration

// Set EJS as the templating engine for rendering HTML pages
app.set('view engine', 'ejs');

// Serve static files (e.g., CSS, images, JavaScript) from the 'public' folder
app.use(express.static('public'));

// Parse URL-encoded data submitted via forms
app.use(express.urlencoded({ extended: true }));

// Parse JSON data sent in request bodies
app.use(express.json());

// Configure session middleware for managing user authentication
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret', // Use .env secret or fallback if undefined
    resave: false, // Avoid resaving session data if it hasn't changed
    saveUninitialized: false, // Avoid saving uninitialized sessions
    cookie: { secure: false } // Set to true if your site uses HTTPS
}));

// Configure Multer for file uploads
const upload = multer({
    dest: 'public/images/', // Upload destination folder
    limits: { fileSize: 5 * 1024 * 1024 }, // Max file size: 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, and WEBP files are allowed!'));
        }
    },
});

// Middleware to initialize cart in the session if it doesn't exist
app.use((req, res, next) => {
    if (!req.session.cart) {
        req.session.cart = [];
    }
    next();
});

// Routes

// Homepage: Display all Lego sets
app.get('/', async (req, res) => {
    try {
        const sets = await legoSetModel.getAllLegoSets();
        res.render('index', {
            sets,
            title: 'Lego New In Box',
            session: req.session,
            success: req.query.success || null,
        });
    } catch (error) {
        console.error('Error fetching Lego sets:', error.message);
        res.status(500).send('Error fetching Lego sets.');
    }
});

// Login page: Render the login form
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

// Handle user login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await memberModel.findMemberByEmail(email);
        if (!user) {
            return res.status(401).send('Invalid email or password.');
        }

        const isPasswordValid = await memberModel.validatePassword(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).send('Invalid email or password.');
        }

        req.session.user = { id: user.id, userName: user.userName, email: user.email };
        res.redirect('/');
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).send('An error occurred during login.');
    }
});

// Registration page: Render the registration form
app.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});

// Handle user registration
app.post('/register', async (req, res) => {
    const { fname, lname, userName, email, password, bio } = req.body;

    try {
        const hashedPassword = await require('bcrypt').hash(password, 10);

        await memberModel.createMember({
            fname,
            lname,
            userName,
            email,
            password_hash: hashedPassword,
            bio,
        });

        res.redirect('/login?success=Registration successful! Please log in.');
    } catch (error) {
        console.error('Error during registration:', error.message);
        res.status(500).send('An error occurred during registration.');
    }
});

// Display the bidding page for a specific Lego set
app.get('/bid/:id', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Ensure the user is authenticated
    }

    const legoSetId = req.params.id;

    try {
        const legoSet = await legoSetModel.getLegoSetById(legoSetId);
        if (!legoSet) {
            return res.status(404).send('Lego set not found.');
        }

        res.render('bid', {
            title: 'Place a Bid',
            legoSet,
            session: req.session, // Pass session data to the template
            error: req.query.error || null, // Pass error message if present
        });
    } catch (error) {
        console.error('Error fetching Lego set:', error.message);
        res.status(500).send('Error fetching Lego set.');
    }
});

// Handle bidding for a Lego set
app.post('/bid', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const { userID, legoSetID, bidAmount } = req.body;

    try {
        const legoSet = await legoSetModel.getLegoSetById(legoSetID);

        if (!legoSet) {
            return res.status(404).send('Lego set not found.');
        }

        if (bidAmount <= legoSet.currentValue) {
            return res.redirect(`/bid/${legoSetID}?error=Your bid must be higher than the current bid.`);
        }

        await bidModel.createBid({
            userID,
            legoSetID,
            bidAmount,
        });

        await legoSetModel.updateCurrentBid(legoSetID, bidAmount);

        res.redirect('/?success=Bid placed successfully!');
    } catch (error) {
        console.error('Error placing bid:', error.message);
        res.status(500).send('An error occurred while placing the bid.');
    }
});

// Admin page: Render form for adding new Lego sets
app.get('/admin', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    res.render('admin', { 
        title: 'Add New Lego Set',
        success: req.query.success || null,
    });
});

// Handle adding a new Lego set
app.post('/admin', upload.array('images', 5), async (req, res) => {
    const { id, name, year_released, pieces, currentValue, buy_it_now } = req.body;

    try {
        const imagePaths = req.files.map(file => `/images/${file.filename}`);

        await legoSetModel.addLegoSet({
            id: parseInt(id, 10),
            name,
            year_released: parseInt(year_released, 10),
            pieces: parseInt(pieces, 10),
            currentValue: parseFloat(currentValue),
            buy_it_now: parseFloat(buy_it_now),
            images: JSON.stringify(imagePaths),
        });

        res.redirect('/admin?success=New Lego set added successfully!');
    } catch (error) {
        console.error('Error adding Lego set:', error.message);
        res.status(500).send('An error occurred while adding the Lego set.');
    }
});

// Display the checkout page for a specific Lego set
app.get('/checkout/:id', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Ensure the user is authenticated
    }

    const legoSetId = req.params.id;

    try {
        const legoSet = await legoSetModel.getLegoSetById(legoSetId);
        if (!legoSet) {
            return res.status(404).send('Lego set not found.');
        }

        // Render the checkout page
        res.render('checkout', {
            title: 'Checkout',
            legoSet,
            user: req.session.user, // Pass user information from the session
        });
    } catch (error) {
        console.error('Error fetching Lego set for checkout:', error.message);
        res.status(500).send('An error occurred while preparing the checkout.');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
