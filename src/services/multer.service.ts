import { randomUUID } from 'crypto';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Service } from 'typedi';

export interface FileUploadOptions {
	fieldName?: string;
	maxCount?: number;
	maxSizeMB?: number;
	allowedMimeTypes?: string[];
	storage?: 'disk' | 'memory';
}

@Service()
export class MulterService {
	uploader(options: FileUploadOptions) {
		let storage: multer.StorageEngine;
		switch (options.storage) {
			case 'disk':
				storage = multer.diskStorage({
					destination: path.join(__dirname, '..', 'uploads'),
					filename: (_req, file: Express.Multer.File, cb) => {
						cb(
							null,
							`${randomUUID()}-${new Date().toUTCString()}-${file.originalname.replace(/\s/g, '-')}`
						);
					},
				});
				break;
			case 'memory':
				storage = multer.memoryStorage();
				break;
			default:
				storage = multer.memoryStorage();
		}

		return multer({
			storage,
			limits: {
				fileSize: (options.maxSizeMB ?? 5) * 1024 * 1024,
				files: options.maxCount ?? 5, // 5 files at a time.
			},
			fileFilter: (_req, file: Express.Multer.File, acceptFile: FileFilterCallback) => {
				if (options.allowedMimeTypes && !options.allowedMimeTypes.includes(file.mimetype)) {
					return acceptFile(new Error(`File type ${file.mimetype} is not allowed.`));
				}

				return acceptFile(null, true);
			},
		});
	}
}

// @Service()
// @Middleware({ type: 'before' })
// export class MulterMiddleware implements ExpressMiddlewareInterface {
// 	private readonly MulterService: MulterService = Container.get(MulterService);
// 	private readonly upload = this.MulterService.uploader(this.options);

// 	constructor(private options: FileUploadOptions) {}

// 	use(request: Request, response: Response, next: NextFunction) {
// 		const handler =
// 			this.options.maxCount && this.options.maxCount > 1
// 				? this.upload.array(this.options.fieldName ?? 'file', this.options.maxCount)
// 				: this.upload.single(this.options.fieldName ?? 'files');

// 		handler(request, response, next);
// 	}
// }

// export function MulterMiddlewareFactory(options: FileUploadOptions) {
// 	const middleware = new MulterMiddleware(options);
// 	return middleware.use.bind(middleware);
// }
