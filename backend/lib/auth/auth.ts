import admin from "firebase-admin";
import { rateLimiter } from "../rate-limiter/rate-limiter";

class Auth {
  private auth: admin.auth.Auth;

  constructor(adminInstance: typeof admin) {
    this.auth = adminInstance.auth();
  }

  async authenticate(request: Request): Promise<admin.auth.DecodedIdToken> {
    const user = await this.verifyToken(request);
    await rateLimiter.enforce(user.uid);
    return user;
  }

  async verifyToken(request: Request): Promise<admin.auth.DecodedIdToken> {
    const header = request.headers.get("Authorization");

    if (!header?.startsWith("Bearer ")) {
      throw new Response("Unauthorized", { status: 401 });
    }

    const token = header.slice(7).trim();

    if (!token) {
      throw new Response("Unauthorized", { status: 401 });
    }

    try {
      return await this.verifyAndDecodeToken(token);
    } catch {
      throw new Response("Unauthorized", { status: 401 });
    }
  }

  private async verifyAndDecodeToken(token: string): Promise<admin.auth.DecodedIdToken> {
    return this.auth.verifyIdToken(token);
  }
}

export const auth = new Auth(admin);
