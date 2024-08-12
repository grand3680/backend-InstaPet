import { Controller, M, useMiddleware } from '@/lib/makeRouter';
import { authMiddleware } from '@/middleware/authMiddleware';
import { ProfileModel } from '@/model/profile.model';

import admin from 'firebase-admin';
import { app } from '@/firebase';

import TokenService from '@/services/TokenService';
import ErrorHandler from '@/services/ErrorHandler';

import Joi from 'joi';

const loginProfileSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(3).max(8).required()
});

const changeProfileSchema = Joi.object({
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

  @useMiddleware(authMiddleware(['user', 'admin']))
  @M.get('/me')
  async getProfile() {
    const userId = this.req.user?.userId;

    const CurrentUser = await ProfileModel.findOne({
      userId
    });

    if (!CurrentUser) {
      return ErrorHandler.NotFoundError('User not found');
    }

    return this.res.status(200).json({
      username: CurrentUser.username,
      img: CurrentUser.img,
      userId: CurrentUser.userId
    });
  }

  @M.get('/login')
  async login() {
    const { email, password } = await this.jsonParse(loginProfileSchema);

    const userId = (await this.auth.getUserByEmail(email)).uid;

    const user = await ProfileModel.findOne({
      userId
    });
    if (!user) {
      return ErrorHandler.NotFoundError('User not found');
    }

    const access_token = TokenService.generateAccestoken({
      userId: userId,
      roles: user.role
    });
    const refresh_token = TokenService.generateRefreshtoken({
      userId: userId,
      roles: user.role
    });

    return this.res.status(200).json({
      typeToken: 'Bearer',
      access_token: access_token,
      refresh_token: refresh_token
    });
  }

  @useMiddleware(authMiddleware(['user', 'admin']))
  @M.post('/changeProfile')
  async changeProfile() {
    const { username, img, postsId } = await this.jsonParse(changeProfileSchema);

    const userId = this.req.user?.userId;

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
    return this.res.status(200).json({ message: 'Profile updated' });
  }

  @M.post('/createProfile')
  async createProfile() {
    const {
      name: displayName,
      email,
      password
    } = await this.jsonParse(createProfileSchema);

    const haveUser = await this.auth.getUserByEmail(email);

    if (haveUser) {
      return ErrorHandler.BadRequestError('User already exists');
    }

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
    const refresh_token = TokenService.generateRefreshtoken({
      userId: user.uid,
      roles: 'user'
    });

    return this.res.status(200).json({
      typeToken: 'Bearer',
      access_token: access_token,
      refresh_token: refresh_token
    });
  }
}

export default ProfileController;
