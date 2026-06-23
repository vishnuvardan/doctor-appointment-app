import { Request, Response, NextFunction } from 'express';

export class AdminController {
  static login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;

      const adminUser = process.env.ADMIN_USERNAME || 'admin';
      const adminPass = process.env.ADMIN_PASSWORD || 'admin';

      if (username === adminUser && password === adminPass) {
        res.json({ success: true, message: 'Logged in successfully' });
      } else {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
      }
    } catch (error) {
      next(error);
    }
  }
}
