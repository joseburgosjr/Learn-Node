const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/stores/:slug', catchErrors(storeController.getStore));
router.get('/add',
 authController.isLoggedIn, 
 storeController.addStore
);
router.post('/add', 
  storeController.upload, 
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)
);
router.post('/add/:id', 
  storeController.upload, 
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)
);
router.get('/stores/:id/edit', catchErrors(storeController.editStore));

router.get('/tags', catchErrors(storeController.getStoresByTag))
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag))

router.get('/login', userController.loginForm);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.get('/register', userController.registerForm);
router.post('/register', 
  userController.validateRegister, 
  userController.registerUser,
  authController.login
);

router.get('/account', authController.isLoggedIn, userController.account);
router.get('/account/reset/:token', authController.reset);
router.post('/account', catchErrors(userController.updateAccount));
router.post('/account/forgot', catchErrors(authController.forgot));
module.exports = router;
