import { randomUUID } from 'crypto';
import multer, { FileFilterCallback, StorageEngine, Options as MulterOptions } from 'multer';
import path from 'path';
import fs from 'fs';
import { Service } from 'typedi';

export interface FileUploadOptionsV2 {
	fieldName?: string;
	maxCount?: number;
	maxSizeMB?: number;
	allowedMimeTypes?: string[];
	storage?: 'disk' | 'memory';
	uploadPath?: string; // custom upload directory for disk storage
}

@Service()
export class MulterServiceV2 {
	private readonly DEFAULT_MAX_COUNT = 5;
	private readonly DEFAULT_MAX_SIZE_MB = 5;
	private readonly DEFAULT_STORAGE: 'disk' | 'memory' = 'memory';
	private readonly DEFAULT_UPLOAD_PATH = path.join(process.cwd(), '../uploads');

	uploader(options: FileUploadOptionsV2) {
		const storage = this.getStorage(options);

		const multerOptions: MulterOptions = {
			storage,
			limits: {
				fileSize: (options.maxSizeMB ?? this.DEFAULT_MAX_SIZE_MB) * 1024 * 1024,
				files: options.maxCount ?? this.DEFAULT_MAX_COUNT,
			},
			fileFilter: (_req, file: Express.Multer.File, acceptFile: FileFilterCallback) => {
				if (options.allowedMimeTypes && !options.allowedMimeTypes.includes(file.mimetype)) {
					return acceptFile(new Error(`❌ File type '${file.mimetype}' is not allowed.`));
				}
				acceptFile(null, true);
			},
		};

		return multer(multerOptions);
	}

	private getStorage(options: FileUploadOptionsV2): StorageEngine {
		switch (options.storage ?? this.DEFAULT_STORAGE) {
			case 'disk': {
				const uploadDir = options.uploadPath ?? this.DEFAULT_UPLOAD_PATH;
				this.ensureDirExists(uploadDir);

				return multer.diskStorage({
					destination: uploadDir,
					filename: (_req, file, cb) => {
						const safeName = this.sanitizeFileName(file.originalname);
						cb(null, `${randomUUID()}-${new Date().toISOString()}-${safeName}`);
					},
				});
			}
			case 'memory':
			default:
				return multer.memoryStorage();
		}
	}

	private ensureDirExists(dir: string) {
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
	}

	private sanitizeFileName(originalName: string): string {
		return originalName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_]/g, '');
	}
}
