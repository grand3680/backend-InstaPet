import { Controller, M, useMiddleware } from 'lib/makeRouter';
import { authMiddleware } from 'middleware/authMiddleware';
import TokenService from 'services/TokenService';
import { ProfileModel } from 'model/profile.model';

import Joi from 'joi';

const profileSchema = Joi.object({
  userId: Joi.string().min(3).required()
});

class RefreshController extends Controller {
  @useMiddleware(authMiddleware)
  @M.get('/refresh')
  async refreshToken() {
    const { userId } = await this.jsonParse(profileSchema);

    const user = await ProfileModel.findOne({ userId });

    if (!user) {
      return this.res
        .status(404)
        .send({ message: 'User not found' });
    }

    const access_token = TokenService.generateAccestoken({
      userId: userId,
      roles: user.role
    });

    return this.res.status(200).send({
      access_token: access_token
    });
  }
}

export default RefreshController;
