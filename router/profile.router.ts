import { Controller, M } from 'lib/makeRouter';
import { ProfileModel } from 'model/profile.model';

import admin from 'firebase-admin';
import { app } from 'firebase';

import Joi from 'joi';

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

export class ProfileController extends Controller {
  auth = admin.auth(app);

  @M.get('/profile')
  async getProfile() {
    const { userId } = await this.jsonParse(profileSchema);

    return await ProfileModel.find({ userId });
  }

  @M.post('/changeProfile')
  async changeProfile() {
    const { userId, username, img, postsId } =
      await this.jsonParse(changeProfileSchema);

    return await ProfileModel.updateOne(
      { userId },
      {
        $push: {
          username: username,
          img: img,
          postsId: postsId
        }
      }
    );
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
    return user;
  }
}
