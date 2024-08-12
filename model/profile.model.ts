import { Schema, model } from 'mongoose';

const profileSchema = new Schema({
  userId: {
    type: String,
    unique: true,
    required: true
  }, // firebase uid
  username: {
    String,
    required: true
  },
  img: String,
  role: {
    type: String,
    required: true,
    default: 'user',
    enum: ['user', 'admin']
  },
  postsId: [String]
});

export const ProfileModel = model('Profile', profileSchema);
