import { NextFunction, Request, Response } from 'express';
import { ExpressMiddlewareInterface, Middleware, UseBefore } from 'routing-controllers';
import Container, { Service } from 'typedi';
import { FileUploadOptions, MulterService } from '../services/multer.service';

@Service()
@Middleware({ type: 'before' })
export class MulterMiddleware implements ExpressMiddlewareInterface {
	private readonly MulterService: MulterService = Container.get(MulterService);
	private readonly upload = this.MulterService.uploader(this.options);

	constructor(private options: FileUploadOptions) {}

	use(request: Request, response: Response, next: NextFunction) {
		const handler =
			this.options.maxCount && this.options.maxCount > 1
				? this.upload.array(this.options.fieldName ?? 'file', this.options.maxCount)
				: this.upload.single(this.options.fieldName ?? 'files');

		handler(request, response, next);
	}
}

// factory
export function MulterMiddlewareFactory(options: FileUploadOptions) {
	const instance = new MulterMiddleware(options);
	return instance.use.bind(instance);
}

// decorator
export function UploadedFiles(options: FileUploadOptions) {
	return UseBefore(MulterMiddlewareFactory(options));
}