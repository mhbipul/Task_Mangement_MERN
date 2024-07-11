import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import cloudinary from "cloudinary";
import { sendToken } from "../utils/jwtToken.js";

export const register = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Use Avatar Required!", 400));
  }
  const { avatar } = req.files;
  const allowedFormats = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/avif",
  ];
  if (!allowedFormats.includes(avatar.mimetype)) {
    return next(
      new ErrorHandler("Please Provide png,jpeg,webp,avif format", 400)
    );
  }
  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password) {
    return next(ErrorHandler("Please Fill Full Form!", 400));
  }
  let user = await User.findOne({ email });
  if (user) {
    return next(new ErrorHandler("User Already Exists!!", 400));
  }
  const cloudinaryResponse = await cloudinary.uploader.upload(
    avatar.tempFilePath
  );
  if (!cloudinaryResponse || cloudinary.err) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponse.error || "Unknown cloudinary error!"
    );
  }
  user = await User.create({
    name,
    email,
    phone,
    password,
    avatar: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });
  sendToken("User Registerd", user, res, 200);
  // res.status(200).json({
  //     success: true,
  //     message: "User Registered!!"
  // });
});
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please Provide email and password", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password!", 400));
  }
  sendToken("User Loggedin", user, res, 200);
  // res.status(200).json({
  //     success:true,
  //     message : "User Loggedin!",
  //     user,
  // });
});
export const logout = catchAsyncErrors((req, res, next) => {
  res.status(200).cookie("token", "", {
    expires: new Date(Date.now()),
    httpOnly: true,
  })
  .json({
    success: true,
    message : "User Logged Out!!"
  })
});
export const myProfile = catchAsyncErrors((req, res, next) => {
    const user = req.user;

    res.status(200).json({
        success : true,
        user,
    });
});
