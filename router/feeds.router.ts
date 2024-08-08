import { Controller, M, useMiddleware } from 'lib/makeRouter';
import { authMiddleware } from 'middleware/authMiddleware';
import { PostModel } from 'model/post.model';
import { ProfileModel } from 'model/profile.model';

import Joi from 'joi';

const postSchema = Joi.object({
  postId: Joi.string().min(3).required()
});

const changePostSchema = Joi.object({
  postId: Joi.string().min(3).required(),
  text: Joi.string().min(3).required(),
  username: Joi.string().min(3).max(10).required(),
  img: Joi.string().required()
});

const createPostSchema = Joi.object({
  userId: Joi.string().min(3).required(),
  text: Joi.string().min(3).required(),
  title: Joi.string().min(3).required(),
  tags: Joi.array().items(Joi.string())
});

const deletePostSchema = Joi.object({
  userId: Joi.string().min(3).required(),
  postId: Joi.string().min(3).required()
});

export class PostController extends Controller {
  @M.get('/post')
  async getPost() {
    const { postId } = await this.jsonParse(postSchema);
    return await PostModel.find({ postId });
  }

  @M.get('/test')
  @useMiddleware(authMiddleware)
  async checkIt() {
    return this.res.status(200).send('test');
  }

  @M.post('/changePost')
  async changePost() {
    const { text, tags, postId, title } =
      await this.jsonParse(changePostSchema);

    return await PostModel.updateOne(
      { postId },
      {
        $push: {
          text,
          tags,
          title
        }
      }
    );
  }

  @M.post('/createPost')
  async createPost() {
    const { userId, text, title, tags } =
      await this.jsonParse(createPostSchema);

    const postId = Date.now().toString();

    await PostModel.create({
      userId,
      text,
      tags,
      title,
      postId
    });

    await ProfileModel.updateOne(
      { userId },
      { $addToSet: { postsId: postId } }
    );

    return this.res.status(200).send('post succeses create');
  }

  @M.delete('/deletePost')
  async deletePost() {
    const { userId, postId } =
      await this.jsonParse(deletePostSchema);

    return await PostModel.deleteOne({ userId, postId });
  }
}
