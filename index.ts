import cors from 'cors';
import express, { Express, Response, NextFunction } from 'express';
import { Server } from 'http';
import mongoose from 'mongoose';

import { makeRouter, TCustomRequest } from '@/lib/makeRouter';
import ProfileController from '@/router/profile.router';
import PostController from '@/router/post.router';
import PagesController from '@/router/pages.router';
import RefreshController from '@/router/refresh.routerr';

import ErrorHandler from '@/services/ErrorHandler';

const app: Express = express();
const port = process.env.PORT || 8000;

const server = new Server(app);

app.use(cors());
app.use(express.json());

app.use('/profile', makeRouter(ProfileController));
app.use('/feeds', makeRouter(PostController));
app.use('/page', makeRouter(PagesController));
app.use('/refresh', makeRouter(RefreshController));

// Error handling middleware
app.use(
  (
    err: Error | ErrorHandler,
    req: TCustomRequest,
    res: Response,
    next: NextFunction
  ) => {
    console.log(err);

    if (err instanceof ErrorHandler) {
      res.status(err.status).json({
        message: err.message,
        errors: err.errors
      });
    }

    res.status(500).json({
      message: 'Something went wrong'
    });
  }
);

server.prependListener('request', (req: TCustomRequest, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
});

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL!);
    console.log('--Connected to MongoDB--');
    server.listen(port, () => console.log(`http://localhost:${port}`));
  } catch (e) {
    console.error(e);
  }
};

start();
