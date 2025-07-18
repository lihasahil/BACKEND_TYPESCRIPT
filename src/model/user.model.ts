// src/model/user.model.ts
import mongoose, { Document, Schema } from "mongoose";

interface Address {
  city?: string;
  district?: string;
  state?: string;
  ward?: string;
}

// No need to explicitly declare _id - it's automatically included by extending Document
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  profile_pic?: string;
  cover_photo?: string;
  cover_photo_id?: string;
  pdf?: string[];
  address?: Address;
  role: "user" | "admin";
  // createdAt and updatedAt will be automatically added by timestamps
}

const AddressSchema = new Schema<Address>(
  {
    city: { type: String },
    district: { type: String },
    state: { type: String },
    ward: { type: String },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      maxlength: 60,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    profile_pic: {
      type: String,
    },
    cover_photo: {
      type: String,
    },
    cover_photo_id: {
      type: String,
    },
    pdf: {
      type: [String],
    },
    address: AddressSchema,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// The model will automatically include _id in documents
const User = mongoose.model<IUser>("User", userSchema);

export default User;
