import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router
} from 'express';
import { Schema } from 'joi';

const SRoutes = Symbol();

type TPathParams = string | RegExp | Array<string | RegExp>;
type TMethod = 'get' | 'post' | 'put' | 'delete' | 'use';
type TMethodName = string | symbol;
type TRoute = {
  method: TMethod;
  path: TPathParams;
  methodName: TMethodName;
  middlewares?: RequestHandler[];
};
type TRoutes = { [SRoutes]: TRoute[] };

export class Controller {
  req!: Request;
  res!: Response;
  next!: NextFunction;

  async jsonParse(schema: Schema) {
    const parsedBody = this.req.body;

    const { error, value } = schema.validate(parsedBody);
    if (error)
      return this.res.status(400).send('not correct data');

    return value;
  }
}


export function useMiddleware(...middlewares: RequestHandler[]) {
  return <T extends typeof Controller>(
    target: T['prototype'],
    methodName: TMethodName,
    desc: TypedPropertyDescriptor<() => any>
  ) => {
    const Contstructor: Controller & TRoutes =
      target.constructor as any;
    const routes =
      Contstructor[SRoutes] ??
      (Contstructor[SRoutes] = [] as any);

    const route = routes.find(
      (route) => route.methodName === methodName
    );

    if (route) {
      route.middlewares = middlewares;
    } else {
      routes.push({
        method: 'use', // This will apply the middleware regardless of the method type
        path: '', // We can adjust this if needed
        methodName,
        middlewares,
      } as any);
    }
  };
}


export function method(method: TMethod, path: TPathParams) {
  return <T extends typeof Controller>(
    target: T['prototype'],
    methodName: TMethodName,
    desc: TypedPropertyDescriptor<() => any>
  ) => {
    const Contstructor: Controller & TRoutes =
      target.constructor as any;
    const routes =
      Contstructor[SRoutes] ??
      (Contstructor[SRoutes] = [] as any);

    routes.push({
      method,
      path,
      methodName
    });
  };
}

export const M = {
  get(path: TPathParams) {
    return method('get', path);
  },
  post(path: TPathParams) {
    return method('post', path);
  },
  put(path: TPathParams) {
    return method('put', path);
  },
  delete(path: TPathParams) {
    return method('delete', path);
  }
};

export function makeRouter<T extends Controller>(
  Controller: new () => T
) {
  const controller = Symbol();
  const router = Router();
  const routes = (Controller as any as TRoutes)[SRoutes];

  if (!routes) throw new Error('This is not controller');

  router.use((req, _, next) => {
    (req as any)[controller] = new Controller();
    next();
  });

  for (const route of routes) {
    const routeMiddlewares = route.middlewares || [];
    router[route.method](
      route.path,
      ...routeMiddlewares, // Apply the middlewares before the route handler
      async (req, res, next) => {
        try {
          const ctrl: T = (req as any)[controller];
          const method = (ctrl as any)[route.methodName] as Function;
          const result = await method.call(
            Object.assign(ctrl, { req, res, next })
          );
          if (result) res.send(result);
        } catch (e) {
          next(e);
        }
      }
    );
  }

  return router;
}
