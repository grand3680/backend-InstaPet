import { Controller, M, useMiddleware } from '@/lib/makeRouter';
import { authMiddleware } from '@/middleware/authMiddleware';
import { ProfileModel } from '@/model/profile.model';
import TokenService from '@/services/TokenService';

import admin from 'firebase-admin';
import { app } from '@/firebase';

import Joi from 'joi';
import ErrorHandler from '@/services/ErrorHandler';

const profileSchema = Joi.object({
  userId: Joi.string().min(3).required()
});

const changeProfileSchema = Joi.object({
  userId: Joi.string().min(3).required(),
  username: Joi.string().min(3).max(10),
  img: Joi.string(),
  postsId: Joi.string().min(3)
});

const createProfileSchema = Joi.object({
  name: Joi.string().min(3).max(10).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(3).max(8).required()
});

class ProfileController extends Controller {
  auth: admin.auth.Auth = admin.auth(app);

  @useMiddleware(authMiddleware)
  @M.get('/Me')
  async getProfile() {
    const { userId } = await this.jsonParse(profileSchema);

    return await ProfileModel.find({ userId });
  }

  @M.get('/login')
  async login() {
    const { userId } = await this.jsonParse(profileSchema);

    const user = await ProfileModel.findOne({ userId });
    if (!user) {
      return ErrorHandler.NotFoundError('User not found');
    }

    const access_token = TokenService.generateAccestoken({
      userId: userId,
      roles: user.role
    });
    const refresh_token = TokenService.generateAccestoken({
      userId: userId,
      roles: user.role
    });

    return this.res.status(200).send({
      access_token: access_token,
      refresh_token: refresh_token
    });
  }

  @useMiddleware(authMiddleware)
  @M.post('/changeProfile')
  async changeProfile() {
    const { userId, username, img, postsId } =
      await this.jsonParse(changeProfileSchema);

    await ProfileModel.updateOne(
      { userId },
      {
        $push: {
          username: username,
          img: img,
          postsId: postsId
        }
      }
    );
    return this.res.status(200).send('Profile updated');
  }

  @M.post('/createProfile')
  async createProfile() {
    const {
      name: displayName,
      email,
      password
    } = await this.jsonParse(createProfileSchema);

    const user = await this.auth.createUser({
      email,
      password,
      displayName,
      emailVerified: false,
      disabled: false
    });

    await ProfileModel.create({
      userId: user.uid,
      username: displayName,
      img: '',
      postsId: ['']
    });

    const access_token = TokenService.generateAccestoken({
      userId: user.uid,
      roles: 'user'
    });
    const refresh_token = TokenService.generateAccestoken({
      userId: user.uid,
      roles: 'user'
    });

    return this.res.status(200).send({
      access_token: access_token,
      refresh_token: refresh_token
    });
  }
}

export default ProfileController;
