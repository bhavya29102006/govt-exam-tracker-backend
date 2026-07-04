import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import jwt from "jsonwebtoken";
import { application } from "express";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const generateAccessAndRefreshTokens = async(userId)  => 
{
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({validateBeforeSave : false})

    return {accessToken , refreshToken}

    
  } catch (error) {
    throw new ApiError(500, "something went wrong while generating access and refresh token ")
  }

}


const registerUser = asyncHandler(async (req, res) => {
    
   const {username , email , password} = req.body
   console.log("email:" , email);

   if(
    [username , email , password].some((field) => field?.trim() === "")
   ){
    throw new ApiError(400 , "all fields are required ")
   }
   const existedUser = await User.findOne({
    $or : [{username} , {email}]
   })

   if(existedUser){
    throw new ApiError(409, "user with email or username already exists")
   }
   const user = await User.create({
     username : username.toLowerCase(),
     email,
     password
   })

   const createdUser = await User.findById(user._id).select("-password -refreshToken")

   if(!createdUser){
    throw new ApiError(500, "something went wrong while registering the user ")
   }

   return res.status(201).json(
    new ApiResponse(200, createdUser , "User registered succesfully")
   )

})

const loginUser = asyncHandler(async (req,res) => {

  const {username , email , password} = req.body

  if(!(username || email)) {
    throw new ApiError(400, "username or email is required ")
  }

  const user = await User.findOne({
    $or : [{username},{email}]
  })

  if(!user){
    throw new ApiError(404 , "user does not exist" )
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password)

  if(!isPasswordCorrect) {
    throw new ApiError(401 , "invaild user credentials")
  }

  const {accessToken , refreshToken} = await generateAccessAndRefreshTokens(user._id)

  const loggeduser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
    httpOnly : true,
    secure:  true
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken , options)
  .cookie("refreshToken", refreshToken , options)
  .json (
    new ApiResponse(
      200,
      {
        user: loggeduser , accessToken, refreshToken
      },
      "user logged in succesfully"

    )

    
  )
})

const logoutUser = asyncHandler(async(req,res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new : true
    }
  )

  const options = {
    httpOnly : true,
    secure: true
  }

  return res 
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200 , {} , "user logged out"))
})

  const refreshAccessToken = asyncHandler(async(req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
      throw new ApiError(401 , "unauthorized request")
    }

    try {const decodeToken = jwt.verify(incomingRefreshToken ,process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodeToken?._id)

    if(!user){
      throw new ApiError(401, "invalid refresh token ")
    }

    if(incomingRefreshToken!==user?.refreshToken){
      throw new ApiError(401, "refresh token is expired or used")
    }

    const options = {
      httpOnly: true,
      secure: true
    }

    const {accessToken , refreshToken} = await generateAccessAndRefreshTokens(user._id)

    return res
    .status(200)
    .cookie("accessToken", accessToken , options)
    .cookie("refreshToken",newrefreshToken , options)
    .json (
       new ApiResponse(
        200,
        {accessToken , refreshToken: new refreshToken},
        "access token refreshed"
       )
    )
  } catch(error) {
      throw new ApiError(401, error?.message || "invalid refresh token")
  }

  })

  const changecurrentpassword =  asyncHandler(async(req,res) => {
    const {oldPassword , newPassword, confirmPassword} = req.body

    if(newPassword!==confirmPassword){
      throw new ApiError(400 , "confirm password must be same as new password")
    }

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
      throw new ApiError(400 , "invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave : false})

    return res 
    .status(200)
    .json(new ApiResponse(200, {}, "password change succesfully"))

  })

  const getCurrentuser = asyncHandler(async(req,res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user , "current user fetched succesfully "))
  
  })

  const updateAccountDetails = asyncHandler(async(req,res) => {
    const {username , email} = req.body

    if(!(username || email)){
      throw new ApiError(400 , "all fields are required")
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          username,
          email
        }
      },
      {new : true}
    ).select("_password")

    return res
    .status(200)
    .json(new ApiResponse(200, user , "account details updated successfully"))
  })

  const updateUserCoverImage = asyncHandler(async(req,res) => {
      const CoverImagelocalpath = req.file?.path
    if(!CoverImagelocalpath){
      throw new ApiError(400, "coveriamge file is missing ")
    }

    const coverImage = await uploadOnCloudinary(CoverImagelocalpath)

    if(!coverImage.url){
      throw new ApiError(400, "error while uploading on cloundinary")
    }

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set:{
          coverImage:coverImage.url
        }
      },
      {new : true}
    ).select("_password")

    return res
    .status(200)
    .json(
      new ApiResponse(200, "cover image updated succesfully")
    )


    })

    const deleteoldcoverimage = asyncHandler(async(req,res) => {
      const user  = await User.findById(req.user._id);

      if(!user.coverImage) {
        throw new ApiError(400, "no cover image found");
      }

      const publicId = user.coverImage
      .split("/")
      .slice(-2)
      .join("/")
      .split(".")[0];

      await cloudinary.uploader.destroy(publicId);

      user.coverImage = "";

      await user.save({validateBeforeSave:false});

      return res
      .status(200)
      .json(
      new ApiResponse(200, "cover image deleted succesfully")
    )  
    })
    


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changecurrentpassword,
    getCurrentuser,
    updateAccountDetails,
    updateUserCoverImage,
    deleteoldcoverimage
}