import { Request } from 'express';
import { Body, Controller, HttpCode, Post, Req, UseBefore } from 'routing-controllers';
import { Service } from 'typedi';
import { multerMiddlewareV1 } from '../middlewares/multer-v1.middleware';
import { MulterMiddlewareFactoryV2, MulterMiddlewareFactoryV2Decorator } from '../middlewares/multer-v2.middleware';
import { MulterMiddlewareFactoryV3, MulterMiddlewareFactoryV3Decorator } from '../middlewares/multer-v3.middleware';
import { GetUploadFile, GetUploadFiles, UploadedFilesMiddleware } from '../decorators/upload-file.decorators';

@Service()
@Controller('/upload')
export class UploadController {
	// ================================
	// V1: Basic Multer Middleware
	// ================================

	/**
	 * Single file upload (avatar) using v1 middleware
	 * Max size: 2MB, Allowed types: JPEG, PNG
	 */
	@Post('/multer-v1/avatar')
	@UseBefore(
		multerMiddlewareV1({
			fieldName: 'avatar',
			maxSizeMB: 2,
			allowedMimeTypes: ['image/jpeg', 'image/png'],
		}),
	)
	public multerV1Single(@Req() req: Request) {
		const avatar = req.file;
		return { success: true, avatar };
	}

	/**
	 * Multiple files upload (photos) using v1 middleware
	 * Max count: 5, Max size per file: 5MB, Allowed types: JPEG, PNG
	 */
	@Post('/multer-v1/gallery')
	@UseBefore(
		multerMiddlewareV1({
			fieldName: 'photos',
			maxCount: 5,
			maxSizeMB: 5,
			allowedMimeTypes: ['image/jpeg', 'image/png'],
		}),
	)
	public multerV1Multiple(@Req() req: Request) {
		const photos = req.files;
		return { success: true, photos };
	}

	// ================================
	// V2: Middleware Factory + Decorator
	// ================================

	/**
	 * Single file upload (avatar) using v2 decorator
	 * Max size: 2MB, Allowed types: JPEG, PNG
	 */
	@Post('/multer-v2/avatar')
	@MulterMiddlewareFactoryV2Decorator({
		fieldName: 'avatar',
		maxSizeMB: 2,
		allowedMimeTypes: ['image/jpeg', 'image/png'],
	})
	public multerV2Single(@Req() req: Request) {
		const avatar = req.file?.filename;
		return { success: true, avatar };
	}

	/**
	 * Multiple files upload (photos) using v2 factory
	 * Max count: 5, Max size per file: 5MB, Allowed types: JPEG, PNG
	 */
	@Post('/multer-v2/gallery')
	@UseBefore(
		MulterMiddlewareFactoryV2({
			fieldName: 'photos',
			maxSizeMB: 5,
			maxCount: 5,
			allowedMimeTypes: ['image/jpeg', 'image/png'],
		}),
	)
	public multerV2Multiple(@Req() req: Request) {
		const avatar = req.files;
		return { success: true, avatar };
	}

	// ================================
	// V3: Latest Middleware Factory + Decorator
	// ================================

	/**
	 * Single file upload using v3 middleware
	 * Max size: 2MB, Allowed types: JPEG, PNG
	 */
	@Post('/multer-v3/avatar')
	@UseBefore(
		MulterMiddlewareFactoryV3Decorator({
			fieldName: 'avatar',
			maxSizeMB: 2,
			allowedMimeTypes: ['image/png', 'image/jpeg'],
		}),
	)
	upload(@Req() req: Request) {
		const avatar = req.file;
		console.log(avatar);
		return {
			success: true,
			avatar,
		};
	}

	/**
	 * Multiple files upload (photos) using v2 factory
	 * Max count: 5, Max size per file: 5MB, Allowed types: JPEG, PNG
	 */
	@Post('/multer-v3/gallery')
	@UseBefore(
		MulterMiddlewareFactoryV2({
			fieldName: 'photos',
			maxSizeMB: 5,
			maxCount: 5,
			allowedMimeTypes: ['image/jpeg', 'image/png'],
		}),
	)
	public multerV3Multiple(@Req() req: Request) {
		const avatar = req.files;
		return { success: true, avatar };
	}

	// ================================
	// Decorators Usage Example
	// ================================

	@Post('/upload-avatar')
	@HttpCode(200)
	@UploadedFilesMiddleware({
		allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'],
		fieldName: 'avatar',
	})
	public async uploadAvatar(@Body() body: any, @GetUploadFile('avatar') file: Express.Multer.File) {
		console.log(body);
		console.log(file);

		return {};
	}

	@Post('/upload-gallery')
	@HttpCode(200)
	@UploadedFilesMiddleware({
		allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'],
		fieldName: 'gallery',
		maxCount: 10,
		maxSizeMB: 5,
	})
	public async uploadGallery(@GetUploadFiles('gallery') files: Express.Multer.File[]) {
		console.log(files);
		return {};
	}
}
