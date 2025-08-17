# MulterMiddleware V3 for Express & Routing-Controllers

A modular, fully-typed Multer middleware for Express + `routing-controllers` using TypeScript and dependency injection (`typedi`).

---

## Features

-   Single & multiple file upload support
-   Dynamic configuration per route
-   Max file size and allowed MIME type validation
-   Memory or disk storage support
-   Error handling for file size/type issues
-   Integrates with `routing-controllers` middleware & decorators

---

## Installation

```bash
npm install express routing-controllers typedi multer
```

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

## Flow Diagram (Mermaid)

```mermaid
flowchart TD
    Client[Client Upload (form-data POST)] --> Routing[Routing-Controllers Route Match]
    Routing --> MulterV1[Multer V1: Basic middleware]
    Routing --> MulterV2[Multer V2: Factory + DI + Decorator]
    Routing --> MulterV3[Multer V3: Lazy init + Dynamic handler]
    MulterV1 --> EngineV1[Multer Engine (memory/disk)]
    MulterV2 --> EngineV2[Multer Engine (memory/disk)]
    MulterV3 --> EngineV3[Multer Engine (memory/disk)]
    EngineV1 --> Controller[Controller Action: req.file / req.files]
    EngineV2 --> Controller
    EngineV3 --> Controller
    Controller --> Response[Return JSON Success]
    Controller --> GlobalError[GlobalErrorHandler]
    Routing --> NotFound[NotFoundMiddleware: 404]
```

---

## Advantages

-   Fully typed and production-ready
-   Granular per-route configuration
-   Works with dependency injection (`typedi`)
-   Supports single/multiple file uploads
-   Seamlessly integrates with `routing-controllers` middleware & decorators
-   Supports v1 → v3 progressive middleware refactoring
