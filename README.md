# Advanced File Upload Backend with Express & TypeScript

This project is a well-structured and robust backend application built with **Express.js**, **TypeScript**, and `routing-controllers` to handle single and multiple file uploads. It demonstrates an evolutionary approach to creating configurable, secure, and reusable middleware for file processing using **Multer**.

## ✨ Features

-   **Single & Multiple File Uploads**: Endpoints designed to handle both single and multiple files in a single request.
-   **Configurable Middleware**: Easily configure file upload settings per-route, including max file size, file count, and allowed MIME types.
-   **Dependency Injection**: Utilizes **TypeDI** for a clean, decoupled, and testable architecture.
-   **Decorator-Based Routing**: Leverages **`routing-controllers`** for clean and declarative controller and route definitions.
-   **Centralized Error Handling**: Includes global middleware for handling 404 Not Found errors and other application-wide exceptions gracefully.
-   **Evolutionary Middleware Patterns**: Showcases three distinct versions of Multer middleware, from a basic functional approach to a highly reusable factory pattern with decorators.

## 🛠️ Tech Stack

-   [**Node.js**](https://nodejs.org/): JavaScript runtime environment.
-   [**Express.js**](https://expressjs.com/): Fast, unopinionated, minimalist web framework for Node.js.
-   [**TypeScript**](https://www.typescriptlang.org/): Statically typed superset of JavaScript.
-   [**Multer**](https://github.com/expressjs/multer): Middleware for handling `multipart/form-data`, used for file uploads.
-   [**routing-controllers**](https://github.com/typestack/routing-controllers): A framework that allows creating structured, decorator-based, and feature-rich controllers with Express.
-   [**TypeDI**](https://github.com/typestack/typedi): A dependency injection container for TypeScript.
-   [**Morgan**](https://github.com/expressjs/morgan): HTTP request logger middleware.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

You need to have [Node.js](https://nodejs.org/en/download/) (version 16 or higher) and [npm](https://www.npmjs.com/get-npm) installed.

### Installation & Setup

1.  **Clone the repository:**

    ```
    [https://github.com/deb-alien/file-upload-rc-di.git](https://github.com/deb-alien/file-upload-rc-di.git)
    cd file-upload-rc-di.git
    ```

    **Explanation:** This downloads the project code from the repository and navigates you into the project directory.

2.  **Install dependencies:**
    ```
    npm install
    ```
    **Explanation:** This command reads the `package.json` file and installs all the necessary libraries and packages (like Express, TypeScript, etc.) required for the project to run.

### Running the Application

To start the server, run the following command:

```

npm run dev

```

**Explanation:** This command (assuming it's configured in `package.json` to use a tool like `ts-node-dev` or `nodemon`) will compile the TypeScript code and start the Express server. The server will automatically restart when you make changes to the code.

The server will be running at `http://localhost:3000`.

## 🔌 API Endpoints

You can use a tool like `curl` or Postman to test the file upload endpoints.

### V1 Endpoints

-   **Single File Upload (`/upload/multer-v1/avatar`)**

    ```
    curl -X POST http://localhost:3000/upload/multer-v1/avatar \
      -F "avatar=@/path/to/your/image.png"
    ```

    **Explanation:** This command sends a `POST` request to the single file upload endpoint. The `-F` flag specifies a `multipart/form-data` field. Here, the field name is `avatar`, and it's being assigned the file from your local disk (`/path/to/your/image.png`).

-   **Multiple File Upload (`/upload/multer-v1/gallery`)**
    ```
    curl -X POST http://localhost:3000/upload/multer-v1/gallery \
      -F "photos=@/path/to/your/image1.png" \
      -F "photos=@/path/to/your/image2.jpeg"
    ```
    **Explanation:** Similar to the single upload, but here we provide multiple `-F` flags with the _same_ field name (`photos`). This is how Multer's `.array()` handler identifies and processes multiple files under a single field.

### V2 & V3 Endpoints

The V2 and V3 endpoints function identically from the client's perspective but use more advanced middleware patterns on the backend.

-   **Single File Upload (`/upload/multer-v3`)**

    ```
    curl -X POST http://localhost:3000/upload/multer-v3 \
      -F "avatar=@/path/to/your/image.jpeg"
    ```

-   **Multiple File Upload (`/upload/multer-v2/gallery`)**
    ```
    curl -X POST http://localhost:3000/upload/multer-v2/gallery \
      -F "photos=@/path/to/your/image1.png" \
      -F "photos=@/path/to/your/image2.jpeg" \
      -F "photos=@/path/to/your/image3.png"
    ```

## 🏛️ Code Architecture Deep Dive

This project is structured to be modular and scalable. Here’s a breakdown of the key components.

### 1. Server Entrypoint (`server.ts`)

This is the starting point of the application.

```ts
// server.ts
// server.ts
async function bootstrap() {
	// Tells routing-controllers to use TypeDI for dependency injection
	useContainer(Container);

	const app: Application = express();

	// ... standard middlewares (morgan, express.json) ...

	// The magic of routing-controllers:
	// It finds all controllers and middlewares and wires them up.
	useExpressServer(app, {
		controllers: [__dirname + '/controllers/*.ts'],
		middlewares: [__dirname + '/middlewares/global/*.middleware.ts'],
		defaultErrorHandler: false, // Use our custom error handler
	});

	app.listen(3000);
}
```

**Explanation:** The `bootstrap` function sets up the Express server. The most important part is `useExpressServer`, which automatically discovers and registers all controllers and global middlewares, significantly reducing boilerplate code. Setting `defaultErrorHandler: false` is critical for allowing our custom `GlobalErrorHandler` to function correctly.

### 2. The Multer Service (`services/multer.service.ts`)

This service is the core of the file-handling logic. It acts as a centralized configuration factory for Multer.

```ts
// services/multer.service.ts (V2)
@Service()
export class MulterService {
	// ... default options defined here ...

	uploader(options: FileUploadOptions) {
		const storage = this.getStorage(options); // Selects disk or memory storage

		return multer({
			storage,
			limits: {
				/* ... file size and count limits ... */
			},
			fileFilter: (/* ... validates file MIME type ... */) => {
				// ... logic to accept or reject the file ...
			},
		});
	}

	// Helper to ensure upload directory exists
	private ensureDirExists(dir: string) {
		/* ... */
	}

	// Helper to sanitize filenames for security
	private sanitizeFileName(originalName: string): string {
		/* ... */
	}
}
```

**Explanation:** The `MulterService` abstracts away the complexities of configuring Multer. The `uploader` method returns a fully configured Multer instance based on the options provided. The V2 implementation is superior as it includes defaults, automatically creates the upload directory (`ensureDirExists`), and sanitizes filenames to prevent security vulnerabilities.

### 3. Global Middlewares (`middlewares/global/`)

These middlewares apply to all routes.

-   `errorHandler.middleware.ts`: A catch-all for any errors that occur during a request. It standardizes the error response format and ensures that sensitive information like stack traces is not leaked in production.
-   `notFound.middleware.ts`: If a request does not match any defined route in the controllers, this middleware runs last and returns a clean `404 Not Found` JSON response.

### 4. Route-Specific Middlewares (The 3 Versions)

This is where the project's design evolution is most apparent.

-   **`multer-v1.middleware.ts`**:

    -   **Approach**: A simple factory function that returns a standard Express middleware.
    -   **How it works**: It directly calls the `MulterService` and determines whether to use `.single()` or `.array()` inside the returned function.
    -   **Pros**: Simple and straightforward.
    -   **Cons**: Less object-oriented, mixes concerns slightly.

-   **`multer-v2.middleware.ts`**:

    -   **Approach**: A class-based middleware with a factory function and a custom decorator.
    -   **How it works**: The `MulterMiddlewareFactoryV2` function creates an _instance_ of the `MulterMiddlewareV2` class, allowing us to pass route-specific options to it. The `MulterMiddlewareFactoryV2Decorator` wraps this in `UseBefore` for cleaner syntax in the controller.
    -   **Pros**: More structured, introduces a clean decorator pattern.
    -   **Cons**: A bit more complex to set up.

-   **`multer-v3.middleware.ts`**:
    -   **Approach**: A refined factory that focuses on robustness and error handling.
    -   **How it works**: It creates a class instance similar to V2 but adds a `try...catch` block and a custom callback within the `use` method. This allows it to catch errors thrown _by Multer itself_ (e.g., file too large) and format them into a proper JSON response, rather than letting them fall through to the global error handler.
    -   **Pros**: **Most robust solution.** Provides specific and immediate feedback for upload-related errors.

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

flowchart TD
    Client["Client Upload (form-data POST)"] --> Routing["Routing-Controllers Route Match"]
    Routing --> MulterV1["Multer V1: Basic middleware"]
    Routing --> MulterV2["Multer V2: Factory + DI + Decorator"]
    Routing --> MulterV3["Multer V3: Lazy init + Dynamic handler"]
    MulterV1 --> EngineV1["Multer Engine (memory/disk)"]
    MulterV2 --> EngineV2["Multer Engine (memory/disk)"]
    MulterV3 --> EngineV3["Multer Engine (memory/disk)"]
    EngineV1 --> Controller["Controller Action: req.file / req.files"]
    EngineV2 --> Controller
    EngineV3 --> Controller
    Controller --> Response["Return JSON Success"]
    Controller --> GlobalError["GlobalErrorHandler"]
    Routing --> NotFound["NotFoundMiddleware: 404"]


---

## Advantages

-   Fully typed and production-ready
-   Granular per-route configuration
-   Works with dependency injection (`typedi`)
-   Supports single/multiple file uploads
-   Seamlessly integrates with `routing-controllers` middleware & decorators
-   Supports v1 → v3 progressive middleware refactoring

