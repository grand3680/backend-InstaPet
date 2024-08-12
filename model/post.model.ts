import { Schema, model } from 'mongoose';

const postSchema = new Schema({
  userId: String,
  postId: {
    type: String,
    unique: true,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  tags: [String],
  date: {
    type: Date,
    default: Date.now()
  },
  title: {
    type: String,
    required: true
  }
});

export const PostModel = model('Post', postSchema);
