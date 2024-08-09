import jwt from 'jsonwebtoken';

class TokenService {
  static generateAccestoken(payload: Object): string {
    const access_token = jwt.sign(
      payload,
      process.env.SECRET_ACCESS!,
      {
        expiresIn: '1h'
      }
    );

    return access_token;
  }

  static generateRefreshtoken(payload: Object): string {
    const refresh_token = jwt.sign(
      payload,
      process.env.SECRET_REFRESH!,
      {
        expiresIn: '20h'
      }
    );

    return refresh_token;
  }

  static validateAccessToken(token: string): jwt.JwtPayload {
    return jwt.verify(
      token,
      process.env.SECRET_ACCESS!
    ) as jwt.JwtPayload;
  }

  static validateRefreshToken(token: string): jwt.JwtPayload {
    return jwt.verify(
      token,
      process.env.SECRET_REFRESH!
    ) as jwt.JwtPayload;
  }
}

export default TokenService;
