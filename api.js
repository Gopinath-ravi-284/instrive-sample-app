const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {ObjectId} = require('mongodb');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/home/gopinath/Desktop/');
    },
    filename: function (req, file, cb) {
      let uniqueFileName = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
      cb(null, uniqueFileName);
      req.latestFileName = uniqueFileName;
    },
  });

const upload = multer({ storage: storage });

// Upload file
router.post('/upload-excel', upload.single('excelFile'), async (req, res) => {
    const data = {
        filename : req.latestFileName,
        created_at : new Date()
    }
    const result = await req.db.collection('fileNames').insertOne(data);
    res.json({ message: 'Excel file uploaded and processed successfully', uploadedFileName: req.latestFileName });
});

// Get all items
router.get('/get-user', async (req, res) => {
  try {
    console.log(req.query)
    const items = await req.db.collection('user_details').find(req.query).toArray();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a specific item
router.delete('/:id', async (req, res) => {
  try {
    console.log(req.params.id)
    const result = await req.db.collection('user_details').deleteOne({ _id: ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
