import { Request } from 'express';
import { Controller, Post, Req, UseBefore } from 'routing-controllers';
import { Service } from 'typedi';
import { multerMiddleware } from '../middlewares/multer-v1.middleware';
import { MulterMiddlewareFactory, UploadedFiles } from '../middlewares/multer-v2.middleware';

@Service()
@Controller('/upload')
export class UploadController {
	@Post('/multer-v1/avatar')
	@UseBefore(
		multerMiddleware({
			// single file upload
			fieldName: 'avatar',
			maxSizeMB: 2, // max 2MB
			allowedMimeTypes: ['image/jpeg', 'image/png'],
		})
	)
	public multerV1Single(@Req() req: Request) {
		const avatar = req.file;
		return { success: true, avatar };
	}

	@Post('/multer-v1/gallery')
	@UseBefore(
		multerMiddleware({
			// multiple file upload
			fieldName: 'photos',
			maxCount: 5,
			maxSizeMB: 5, // max 5MB
			allowedMimeTypes: ['image/jpeg', 'image/png'],
		})
	)
	public multerV1Multiple(@Req() req: Request) {
		const photos = req.files;
		console.log(photos);
		return { success: true, photos };
	}

	@Post('/multer-v2/avatar')
	@UseBefore(
		MulterMiddlewareFactory({
			// single file upload
			fieldName: 'avatar',
			maxSizeMB: 2,
			allowedMimeTypes: ['image/jpeg', 'image/png'],
		})
	)
	// @UploadedFiles({ fieldName: 'avatar', maxSizeMB: 2, allowedMimeTypes: ['image/jpeg', 'image/png'] })
	public multerV2Single(@Req() req: Request) {
		const avatar = req.file;
		return { success: true, avatar };
	}

	@Post('/multer-v2/gallery')
	// @UseBefore(
	// 	MulterMiddlewareFactory({
	// 		fieldName: 'photos',
	// 		maxSizeMB: 5,
	// 		maxCount: 5,
	// 		allowedMimeTypes: ['image/jpeg', 'image/png'],
	// 	})
	// )
	@UploadedFiles({ fieldName: 'avatar', maxSizeMB: 5, allowedMimeTypes: ['image/jpeg', 'image/png'] })
	public multerV2Multiple(@Req() req: Request) {
		const avatar = req.file;
		return { success: true, avatar: { filename: avatar?.originalname } };
	}
}
