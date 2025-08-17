import { NextFunction, Request, Response } from 'express';
import { ExpressMiddlewareInterface, Middleware, UseBefore } from 'routing-controllers';
import Container, { Service } from 'typedi';
import { FileUploadOptionsV2, MulterServiceV2 } from '../services/multer-v2.service';

@Service()
@Middleware({ type: 'before' })
export class MulterMiddlewareV2 implements ExpressMiddlewareInterface {
	private readonly multerService: MulterServiceV2 = Container.get(MulterServiceV2);
	private readonly upload = this.multerService.uploader(this.options);

	constructor(private options: FileUploadOptionsV2) {}

	use(request: Request, response: Response, next: NextFunction) {
		const handler =
			this.options.maxCount && this.options.maxCount > 1
				? this.upload.array(this.options.fieldName ?? 'file', this.options.maxCount)
				: this.upload.single(this.options.fieldName ?? 'files');

		handler(request, response, next);
	}
}

// factory
export function MulterMiddlewareFactoryV2(options: FileUploadOptionsV2) {
	const instance = new MulterMiddlewareV2(options);
	return instance.use.bind(instance);
}

// decorator
export function MulterMiddlewareFactoryV2Decorator(options: FileUploadOptionsV2) {
	return UseBefore(MulterMiddlewareFactoryV2(options));
}
