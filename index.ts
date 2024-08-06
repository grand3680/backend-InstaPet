import cors from 'cors';
import express, {
  Express,
  Request,
  Response,
  NextFunction
} from 'express';
import { Server } from 'http';
import { makeRouter } from 'lib/makeRouter';
import mongoose from 'mongoose';
import { ProfileController } from 'router/profile.router';
import { PostController } from 'router/post.router';
import { PagesController } from 'router/pages.router';

const app: Express = express();
const port = process.env.PORT || 8000;

const server = new Server(app);

app.use(cors());
app.use(express.json());

app.use('/profile', makeRouter(ProfileController));
app.use('/post', makeRouter(PostController));
app.use('/page', makeRouter(PagesController));

// Add this error handling middleware
app.use(
  (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong');
  }
);

server.prependListener(
  'request',
  (req: Request, res: Response) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
);

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL!);
    console.log('Connected to MongoDB');
    server.listen(port, () =>
      console.log(`http://localhost:${port}`)
    );
  } catch (e) {
    console.error(e);
  }
};

start();
