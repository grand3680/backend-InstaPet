import { Controller, M, useMiddleware, TUser } from '@/lib/makeRouter';
import { authMiddleware } from '@/middleware/authMiddleware';
import TokenService from '@/services/TokenService';
import ErrorHandler from '@/services/ErrorHandler';

class RefreshController extends Controller {
  @useMiddleware(authMiddleware(['user', 'admin']))
  @M.get('/')
  async refreshToken() {
    const token = '';

    const userData = TokenService.validateRefreshToken<TUser>(token);

    if (!userData) {
      return ErrorHandler.NotFoundError('User not found');
    }

    const access_token = TokenService.generateAccestoken({
      userId: userData.userId,
      roles: userData.role
    });

    return this.res.status(200).json({
      typeToken: 'Bearer',
      access_token: access_token
    });
  }
}

export default RefreshController;
