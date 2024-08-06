import { Schema, model } from 'mongoose';

const profileSchema = new Schema({
  userId: String, // firebase uid
  username: String,
  img: String,
  postsId: [String]
});

export const ProfileModel = model('Profile', profileSchema);
