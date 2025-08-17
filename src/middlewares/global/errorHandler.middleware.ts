import { Request, Response } from 'express';
import { ExpressErrorMiddlewareInterface, Middleware } from 'routing-controllers';
import { Service } from 'typedi';

@Service()
@Middleware({ type: 'after' })
export class GlobalErrorHandler implements ExpressErrorMiddlewareInterface {
	error(error: any, request: Request, response: Response, next: (err?: any) => any) {
		// Prevent double send
		if (response.headersSent) {
			return next(error);
		}

		const status = error.httpCode || 500;
		const message = error.message || 'Internal Server Error';

		return response.status(status).json({
			status: 'error',
			message,
			stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
		});
	}
}
