const express = require('express');
const router = express.Router();
const { getStations, searchRoutes } = require('./controllers/searchController');

router.get('/stations', getStations);
router.post('/search', searchRoutes);

module.exports = router;
