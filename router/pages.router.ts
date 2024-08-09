import { Controller, M } from '@/lib/makeRouter';
import { PostModel } from '@/model/post.model';

import Joi from 'joi';

const pageSchema = Joi.object({ page: Joi.number().required() });
const postsPerPage = 5;

class PagesController extends Controller {
  @M.get('/count')
  async getPagesCount() {
    const totalPosts = await PostModel.countDocuments();

    const totalPages = Math.ceil(totalPosts / postsPerPage);
    return { totalPages: totalPages };
  }

  @M.get('/page')
  async getPage() {
    const { page } = await this.jsonParse(pageSchema);

    const skip = (page - 1) * postsPerPage;
    return await PostModel.find().skip(skip).limit(postsPerPage);
  }
}

export default PagesController;
