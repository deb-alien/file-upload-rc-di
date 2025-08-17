import { Response } from 'express';
import { ExpressMiddlewareInterface, Middleware, NotFoundError } from 'routing-controllers';
import { Service } from 'typedi';

@Service()
@Middleware({ type: 'after' })
export class NotFoundMiddleware implements ExpressMiddlewareInterface {
	use(_request: any, response: Response, _next: any) {
		return response.status(400).json(new NotFoundError());
	}
}
