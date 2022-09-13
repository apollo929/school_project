const express = require('express');

const UserCtrl = require('../controllers/user');
const SubjectCtrl = require('../controllers/subject');
const { catchError } = require('../controllers/error');

const router = express.Router();

/**
 * create customer
 */
router.post('/', UserCtrl.checkAuth, catchError(SubjectCtrl.create));

/**
 * get customers for Customer Selecting Dropbox
 */
router.post(
  '/easy-search',
  UserCtrl.checkAuth,
  catchError(SubjectCtrl.getEasySearch)
);

/**
 * load customers by query
 */
router.post('/load', UserCtrl.checkAuth, catchError(SubjectCtrl.loadByQuery));

/**
 * get customer
 */
router.get('/:id', UserCtrl.checkAuth, catchError(SubjectCtrl.getscore));

/**
 * edit customer
 */
router.put('/:id', UserCtrl.checkAuth, catchError(SubjectCtrl.inputscore));

/**
 * remove customer
 */
router.delete('/:id', UserCtrl.checkAuth, catchError(SubjectCtrl.remove));

router.post('/score_load', UserCtrl.checkAuth, catchError(SubjectCtrl.score_load));

router.post('/get_score', UserCtrl.checkAuth, catchError(SubjectCtrl.getingraphic));


module.exports = router;
