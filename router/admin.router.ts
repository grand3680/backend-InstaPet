import { Controller, M, useMiddleware } from '@/lib/makeRouter';
import { authMiddleware } from '@/middleware/authMiddleware';
import { ProfileModel } from '@/model/profile.model';

import Joi from 'joi';

import admin from 'firebase-admin';
import { app } from '@/firebase';

const profileSchema = Joi.object({
  userId: Joi.string().min(3).required()
});

const profilePaginSchema = Joi.object({
  userPagin: Joi.number().required()
});

const usesrPerPage = 10;

class AdminController extends Controller {
  auth: admin.auth.Auth = admin.auth(app);

  @useMiddleware(authMiddleware(['admin']))
  @M.get('/users')
  async getUsers() {
    const { userPagin } = await this.jsonParse(profilePaginSchema);

    const skip = (userPagin - 1) * usesrPerPage;

    return await ProfileModel.find().skip(skip).limit(usesrPerPage);
  }

  @useMiddleware(authMiddleware(['admin']))
  @M.post('/deleteUser')
  async deleteUser() {
    const { userId } = await this.jsonParse(profileSchema);

    await this.auth.deleteUser(userId);
    await ProfileModel.deleteOne({ userId });

    return this.res.status(200).json({ message: 'user deleted' });
  }
}

export default AdminController;
