import express from "express";
import {  
    authUser,
    registerUser,
    logoutUser,
    getUsers,
    getUserProfile,
    deleteUser,
    updateUserProfile,
    getUsersByID,
    updateUser
} from '../controllers/userControllers.js';
import { protect, admin} from '../middleware/authMiddleware.js';



const router = express.Router();

router.route("/")
  .post(registerUser)  // Public registration
  .get(protect, admin, getUsers);
  router.post('/logout', logoutUser);
router.post('/auth', authUser);
router.route('/profile').get( protect, getUserProfile).put(protect , updateUserProfile);
router.route('/:id').delete(protect , admin , deleteUser).get(protect, admin,getUsersByID).put(protect,admin,updateUser);



export default router;
