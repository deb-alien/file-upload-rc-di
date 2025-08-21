
import { Request } from 'express';
import { Action, createParamDecorator, UseBefore } from 'routing-controllers';
import { MulterMiddlewareFactoryV3 } from '../middlewares/multer-v3.middleware';
import { FileUploadOptionsV2 } from '../services/multer-v2.service';

/**
 * Decorator function that generates a middleware before function
 * for handling file uploads.
 *
 * @param {IFileUploadOptions} options - Options for file upload
 * @returns {Function} - The middleware before function
 */
export function UploadedFilesMiddleware(options: FileUploadOptionsV2): Function {
	return UseBefore(MulterMiddlewareFactoryV3(options));
}

export function GetUploadFile(fieldName?: string) {
	return createParamDecorator({
		required: false,
		value: (action: Action) => {
			const req = action.request as Request;

			if (fieldName && req.files) {
				const filesForField = (req.files as Record<string, Express.Multer.File[]>)[fieldName];
				if (Array.isArray(filesForField)) {
					return filesForField[0] || null;
				}
			}

			return req.file || null;
		},
	});
}

export function GetUploadFiles(fieldName?: string) {
	return createParamDecorator({
		required: false,
		value: (action: Action) => {
			const req = action.request as Request;

			// Case 1: multer.array(fieldName) → req.files is an array
			if (Array.isArray(req.files)) {
				return req.files as Express.Multer.File[];
			}

			// Case 2: multer.fields([{ name: fieldName }]) → req.files[fieldName]
			if (fieldName && req.files && typeof req.files === 'object') {
				const filesForField = (req.files as Record<string, Express.Multer.File[]>)[fieldName];
				return Array.isArray(filesForField) ? filesForField : [];
			}

			// Case 3: no fieldName, multiple fields → flatten into one array
			if (req.files && typeof req.files === 'object') {
				return Object.values(req.files).flat() as Express.Multer.File[];
			}

			return [];
		},
	});
}

/**

 */
