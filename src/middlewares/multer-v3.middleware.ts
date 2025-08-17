import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ExpressMiddlewareInterface, Middleware, UseBefore } from 'routing-controllers';
import { Service } from 'typedi';
import { FileUploadOptions } from '../services/multer-v1.service';
import { FileUploadOptionsV2, MulterServiceV2 } from '../services/multer-v2.service';

@Service()
@Middleware({ type: 'before' })
export class MulterMiddleware implements ExpressMiddlewareInterface {
	private uploadHandler: RequestHandler;

	constructor(private readonly options: FileUploadOptionsV2, private readonly multerService: MulterServiceV2) {
		// Lazy init upload handler based on options
		this.uploadHandler = this.createHandler(options);
	}

	/**
	 * Create upload handler dynamically based on provided options
	 */
	private createHandler(options: FileUploadOptionsV2) {
		const uploader = this.multerService.uploader(options);

		return options.maxCount && options.maxCount > 1
			? uploader.array(options.fieldName ?? 'file', options.maxCount)
			: uploader.single(options.fieldName ?? 'file'); // unified default key
	}

	/**
	 * Core middleware hook
	 */
	use(request: Request, response: Response, next: NextFunction) {
		try {
			this.uploadHandler(request, response, (err: unknown) => {
				if (err) {
					// Example: Multer error handling
					return response.status(400).json({
						status: 'error',
						message: (err as Error).message || 'File upload failed',
					});
				}
				next();
			});
		} catch (error) {
			return response.status(500).json({
				status: 'error',
				message: 'Unexpected file upload error',
				details: (error as Error).message,
			});
		}
	}
}

/**
 * Factory function to create middleware dynamically
 */
export function MulterMiddlewareFactoryV3(options: FileUploadOptionsV2) {
	const multerService = new MulterServiceV2();
	return new MulterMiddleware(options, multerService).use.bind(new MulterMiddleware(options, multerService));
}


export function MulterMiddlewareFactoryV3Decorator(options: FileUploadOptionsV2) {
	return UseBefore(MulterMiddlewareFactoryV3(options));
}