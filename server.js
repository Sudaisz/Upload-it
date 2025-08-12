const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
// Render provides the PORT environment variable.
const PORT = process.env.PORT || 3000; 

// --- Middleware ---
// Enable CORS for all routes. This allows your front-end to communicate with this server.
app.use(cors()); 
// Serve the static front-end files from the 'public' directory.
app.use(express.static('public'));
// Serve the uploaded files from the 'uploads' directory.
app.use('/uploads', express.static('uploads'));


// --- File Upload Setup (Multer) ---

// Define the directory where files will be stored.
const uploadDir = 'uploads';

// Create the uploads directory if it doesn't exist.
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Configure how files are stored.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Save files to the 'uploads' folder.
  },
  filename: function (req, file, cb) {
    // Create a unique filename to prevent overwriting files with the same name.
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


// --- API Routes ---

// The main upload endpoint. The front-end will send files here.
// 'upload.single('file')' means we are expecting one file, with the form field name 'file'.
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  // If the file is uploaded successfully, send back the URL to access it.
  // Note: In a real production app, you'd use the full Render URL.
  // We'll construct this on the client-side for flexibility.
  const fileUrl = `/uploads/${req.file.filename}`;
  
  res.json({ 
    success: true, 
    url: fileUrl 
  });
});


// --- Server Start ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});