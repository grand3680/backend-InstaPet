import { Schema, model } from 'mongoose';

const profileSchema = new Schema({
  userId: {
    type: String,
    unique: true
  }, // firebase uid
  username: String,
  img: String,
  role: String,
  postsId: [String]
});

export const ProfileModel = model('Profile', profileSchema);
