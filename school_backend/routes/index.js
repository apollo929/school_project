const express = require('express');
const user = require('./user');
const subject = require('./subject');
// const shipment = require('./shipment');
// const inventory = require('./inventory');
// const notification = require('./notification');
// const garbage = require('./garbage');
// const admin = require('./admin');

const router = express.Router();

router.get('/health', (req, res) => {
  res.send('OK Cool!');
});

router.use('/user', user);
router.use('/subject', subject);
// router.use('/shipment', shipment);
// router.use('/inventory', inventory);
// router.use('/notification', notification);
// router.use('/garbage', garbage);
// router.use('/admin', admin);

module.exports = router;
