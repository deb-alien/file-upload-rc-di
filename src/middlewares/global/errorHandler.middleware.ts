import { Request, Response } from 'express';
import { ExpressErrorMiddlewareInterface, Middleware } from 'routing-controllers';
import { Service } from 'typedi';

@Service()
@Middleware({ type: 'after' })
export class GlobalErrorHandler implements ExpressErrorMiddlewareInterface {
	error(error: any, request: Request, response: Response, next: (err?: any) => any) {
		const statusCode = error.httpCode || 500;

		return response.status(statusCode).json({
			name: error.name,
			message: error.message,
			stack: error.stack,
		});
	}
}
