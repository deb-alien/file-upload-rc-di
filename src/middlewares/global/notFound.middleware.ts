import { Response, Request, NextFunction } from 'express';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Service } from 'typedi';

@Service()
@Middleware({ type: 'after' })
export class NotFoundMiddleware implements ExpressMiddlewareInterface {
	use(request: Request, response: Response, next: NextFunction) {
		// prevent double send
		if (response.headersSent) {
			return next();
		}

		return response.status(404).json({
			status: 'error',
			message: `Route ${request.originalUrl} not found`,
		});
	}
}
