import { NextFunction, Request, Response } from 'express';
import Container from 'typedi';
import { FileUploadOptions, MulterService } from '../services/multer.service';

export function multerMiddleware(options: FileUploadOptions) {
	const multerService = Container.get(MulterService);
	const uploader = multerService.uploader(options);

	return (req: Request, res: Response, next: NextFunction) => {
		const handler =
			options.maxCount && options.maxCount > 1
				? uploader.array(options.fieldName ?? 'file', options.maxCount)
				: uploader.single(options.fieldName ?? 'files');

		handler(req, res, next);
	};
}
