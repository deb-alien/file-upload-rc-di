# 📌 Code Explanation: MulterMiddleware V3

```ts
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Service } from 'typedi';
import { FileUploadOptions, MulterService } from '../services/multer-v1.service';
import { MulterServiceV2 } from '../services/multer-v2.service';
```

-   **Imports**:

    -   `Express` types (`Request`, `Response`, `NextFunction`) for typing.
    -   `ExpressMiddlewareInterface` & `Middleware` from `routing-controllers` to define **controller middleware**.
    -   `typedi` `Service` decorator for **dependency injection**.
    -   `FileUploadOptions` defines **config for max size, allowed types, etc.**
    -   `MulterServiceV2` contains the actual **Multer configuration** (memory or disk storage, file filters, limits).

---

```ts
@Service()
@Middleware({ type: 'before' })
export class MulterMiddleware implements ExpressMiddlewareInterface {
	private uploadHandler: RequestHandler;

	constructor(private readonly options: FileUploadOptions, private readonly multerService: MulterServiceV2) {
		// Lazy init upload handler based on options
		this.uploadHandler = this.createHandler(options);
	}
```

-   **`@Service()`**: Allows `typedi` to inject this middleware if needed elsewhere.
-   **`@Middleware({ type: 'before' })`**: Executes before the controller action (pre-route).
-   **`uploadHandler`**: Stores the actual Multer handler (`.single()` or `.array()`) for the route.
-   **Constructor**:

    -   Accepts **options** for file uploads.
    -   Accepts `MulterServiceV2` instance.
    -   Calls `createHandler()` to generate the actual Multer handler.

---

```ts
	/**
	 * Create upload handler dynamically based on provided options
	 */
	private createHandler(options: FileUploadOptions) {
		const uploader = this.multerService.uploader(options);

		return options.maxCount && options.maxCount > 1
			? uploader.array(options.fieldName ?? 'file', options.maxCount)
			: uploader.single(options.fieldName ?? 'file'); // unified default key
	}
```

-   **`createHandler()`**:

    -   Uses the `MulterServiceV2` to get a **configured Multer instance**.
    -   If `maxCount > 1` → uses `.array()` for multiple files.
    -   Otherwise → `.single()` for single file uploads.
    -   Ensures a **default field name** (`file`) if none is provided.

---

```ts
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
```

-   **`use()`** is the main **middleware function** executed by Express / routing-controllers.
-   Calls the **prebuilt Multer handler** (`uploadHandler`) with request, response, and a callback.
-   **Error handling**:

    -   Catches **Multer errors** (file size, type, unexpected field) and responds with **400**.
    -   Catches unexpected errors and responds with **500**.

---

```ts
/**
 * Factory function to create middleware dynamically
 */
export function MulterMiddlewareFactoryV3(options: FileUploadOptions) {
	const multerService = new MulterServiceV2();
	return new MulterMiddleware(options, multerService).use.bind(new MulterMiddleware(options, multerService));
}
```

-   **Factory function**:

    -   Creates a new `MulterServiceV2` instance.
    -   Instantiates the `MulterMiddleware` with **custom options**.
    -   Returns a bound `use` function to be passed to `@UseBefore(...)` in controllers.

---

# 📌 How It Works (Flow)

1. Controller route calls `@UseBefore(MulterMiddlewareFactoryV3({ ... }))`.
2. `MulterMiddlewareFactoryV3` creates a middleware instance with the configured options.
3. Middleware executes **before the controller action**.
4. Multer validates the file(s):

    - Checks file type
    - Checks file size
    - Stores in memory or disk

5. If error → Middleware sends **400 JSON response** (handled by `use()`).
6. If success → Multer adds `req.file` or `req.files` → controller receives the uploaded files.

---


# MulterMiddleware V3 for Express & Routing-Controllers

This project demonstrates a **modular, fully typed Multer middleware** for Express + `routing-controllers` using TypeScript and dependency injection with `typedi`.

---

## Features

-   Single & multiple file upload support
-   Dynamic configuration per route
-   Max file size and allowed MIME type validation
-   Memory or disk storage support
-   Error handling for file size/type issues
-   Works with `routing-controllers` and decorators

---

## Installation

```bash
npm install express routing-controllers typedi multer
```
````

---

## Usage

### 1. Create a Controller

```ts
import { Request } from 'express';
import { Controller, Post, Req, UseBefore } from 'routing-controllers';
import { MulterMiddlewareFactoryV3 } from '../middlewares/multer-v3.middleware';

@Controller('/upload')
export class UploadController {
	@Post('/avatar')
	@UseBefore(
		MulterMiddlewareFactoryV3({
			fieldName: 'avatar',
			maxSizeMB: 2,
			allowedMimeTypes: ['image/png', 'image/jpeg'],
		})
	)
	uploadAvatar(@Req() req: Request) {
		return { success: true, filename: req.file?.filename };
	}
}
```

### 2. File Upload Options

```ts
interface FileUploadOptions {
	fieldName?: string; // Name of the form field
	maxCount?: number; // Max files allowed (for multiple uploads)
	maxSizeMB?: number; // Max file size in MB
	allowedMimeTypes?: string[]; // Allowed MIME types
	storage?: 'disk' | 'memory'; // Storage type
}
```

### 3. Example cURL Request

#### Upload Single Avatar

```bash
curl -X POST http://localhost:3000/upload/avatar \
  -F "avatar=@/path/to/avatar.png"
```

#### Upload Multiple Files

```bash
curl -X POST http://localhost:3000/upload/gallery \
  -F "photos=@/path/to/photo1.jpg" \
  -F "photos=@/path/to/photo2.png"
```

---

## Error Handling

-   **File too large** → `400 Bad Request`
-   **Invalid file type** → `400 Bad Request`
-   **Unexpected error** → `500 Internal Server Error`

All errors return JSON:

```json
{
	"status": "error",
	"message": "File upload failed"
}
```

---

## Advantages

-   Fully typed and production-ready
-   Granular per-route configuration
-   Works with dependency injection (`typedi`)
-   Integrates seamlessly with `routing-controllers` middleware & decorators
-   Supports v1 → v3 progressive middleware refactoring

---
