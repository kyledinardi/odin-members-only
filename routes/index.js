const express = require('express');
const userController = require('../controllers/userController');
const messageController = require('../controllers/messageController');

const router = express.Router();

router.get('/', messageController.index);
router.post('/new-message', messageController.newMessage);
router.post('/delete-message', messageController.deleteMessage);

router.get('/sign-up', userController.signUpGet);
router.post('/sign-up', userController.signUpPost);
router.get('/login', userController.loginGet);
router.post('/login', userController.loginPost);
router.get('/logout', userController.logout);

router.get('/join-club', userController.joinClubGet);
router.post('/join-club', userController.joinClubPost);
router.get('/admin', userController.adminGet);
router.post('/admin', userController.adminPost);

module.exports = router;
