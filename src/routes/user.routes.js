import { Router } from "express";
import { loginUser, registerUser, logoutUser, refreshAccessToken, changecurrentpassword, getCurrentuser, updateAccountDetails, updateUserCoverImage, deleteoldcoverimage } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();


router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }
    ]),
    registerUser
);
router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT , logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-current-password").post(  changecurrentpassword)
router.route("/get-current-user").get(verifyJWT , getCurrentuser)
router.route("/update-account-details").patch( verifyJWT , updateAccountDetails)
router.route("/update-cover-image").patch( verifyJWT ,upload.single("coverimage"), updateUserCoverImage)
router.route("/delete-cover-image").post( verifyJWT , deleteoldcoverimage)

export default router;