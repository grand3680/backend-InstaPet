import { Controller, M, useMiddleware } from '@/lib/makeRouter';
import { authMiddleware } from '@/middleware/authMiddleware';
import { PostModel } from '@/model/post.model';
import { ProfileModel } from '@/model/profile.model';

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
  text: Joi.string().min(3).required(),
  title: Joi.string().min(3).required(),
  tags: Joi.array().items(Joi.string())
});

const deletePostSchema = Joi.object({
  postId: Joi.string().min(3).required()
});

class PostController extends Controller {
  @M.get('/post')
  async getPost() {
    const { postId } = await this.jsonParse(postSchema);
    const postData = await PostModel.findOne({
      postId
    });

    return this.res.status(200).json({ data: postData });
  }

  @useMiddleware(authMiddleware(['user', 'admin']))
  @M.post('/changePost')
  async changePost() {
    const { text, tags, postId, title } = await this.jsonParse(changePostSchema);

    await PostModel.updateOne(
      { postId },
      {
        $push: {
          text,
          tags,
          title
        }
      }
    );
    return this.res.status(200).json({ message: 'post data changed' });
  }

  @useMiddleware(authMiddleware(['user', 'admin']))
  @M.post('/createPost')
  async createPost() {
    const { text, title, tags } = await this.jsonParse(createPostSchema);

    const userId = this.req.user?.userId;

    const postId = Date.now().toString();

    await PostModel.create({
      userId,
      text,
      tags,
      title,
      postId
    });

    await ProfileModel.updateOne({ userId }, { $addToSet: { postsId: postId } });

    return this.res.status(200).json({
      message: 'post succeses create'
    });
  }

  @useMiddleware(authMiddleware(['user', 'admin']))
  @M.delete('/deletePost')
  async deletePost() {
    const { postId } = await this.jsonParse(deletePostSchema);

    const userId = this.req.user?.userId;

    await PostModel.deleteOne({
      userId: userId,
      postId: postId
    });

    await ProfileModel.updateOne({ userId }, { $pull: { postsId: postId } });

    return this.res.status(200).json({ message: 'post deleted' });
  }
}

export default PostController;
