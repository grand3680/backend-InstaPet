import jwt from 'jsonwebtoken';

class TokenService {
  static generateAccestoken<T extends Object>(payload: T): string {
    const access_token = jwt.sign(payload, process.env.SECRET_ACCESS!, {
      expiresIn: '1h'
    });

    return access_token;
  }

  static generateRefreshtoken<T extends Object>(payload: T): string {
    const refresh_token = jwt.sign(payload, process.env.SECRET_REFRESH!, {
      expiresIn: '20h'
    });

    return refresh_token;
  }

  static validateAccessToken<T extends object>(token: string): jwt.JwtPayload & T {
    return jwt.verify(token, process.env.SECRET_ACCESS!) as jwt.JwtPayload & T;
  }

  static validateRefreshToken<T extends object>(token: string): jwt.JwtPayload & T {
    return jwt.verify(token, process.env.SECRET_REFRESH!) as jwt.JwtPayload & T;
  }
}

export default TokenService;
