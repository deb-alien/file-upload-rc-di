```pgsql

                       ┌───────────────────────────────┐
                       │         Client Upload         │
                       │  (via form-data POST request) │
                       └─────────────┬─────────────────┘
                                     │
                                     ▼
                    ┌──────────────────────────────────┐
                    │         Routing-Controllers       │
                    │      Matches route & executes    │
                    │       @UseBefore middleware      │
                    └─────────────┬────────────────────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
        ▼                            ▼                            ▼
 ┌───────────────┐           ┌───────────────┐           ┌───────────────┐
 │  Multer V1    │           │  Multer V2    │           │  Multer V3    │
 │ - Basic       │           │ - Factory +   │           │ - Factory +   │
 │   middleware  │           │   DI service  │           │   DI service  │
 │ - Single/     │           │ - Decorator   │           │ - Lazy init   │
 │   Multiple    │           │   support     │           │ - Dynamic     │
 │ - MaxSize     │           │ - MaxCount    │           │   handler     │
 │ - MIME check  │           │ - MIME check  │           │ - Error safe  │
 └───────┬───────┘           └───────┬───────┘           └───────┬───────┘
         │                           │                           │
         ▼                           ▼                           ▼
 ┌────────────────┐          ┌────────────────┐          ┌────────────────┐
 │  Multer Engine │          │  Multer Engine │          │  Multer Engine │
 │  (memory/disk) │          │  (memory/disk) │          │  (memory/disk) │
 └───────┬────────┘          └───────┬────────┘          └───────┬────────┘
         │                           │                           │
         ▼                           ▼                           ▼
 ┌───────────────────────────────────────────────────────────────┐
 │          Upload Success → req.file / req.files populated       │
 └───────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
                          ┌────────────────────┐
                          │  Controller Action │
                          │  Accesses files via│
                          │  req.file / req.files│
                          └─────────┬──────────┘
                                    │
                                    ▼
                         ┌────────────────────┐
                         │ Response returned  │
                         │   JSON success     │
                         └─────────┬──────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
 ┌───────────────────┐                           ┌───────────────────┐
 │ GlobalErrorHandler│                           │ NotFoundMiddleware│
 │ - Handles Multer  │                           │ - 404 fallback    │
 │   errors          │                           │   for unknown     │
 │ - Validation fail │                           │   routes          │
 │ - Unexpected      │                           │                   │
 │   exceptions      │                           │                   │
 └───────────────────┘                           └───────────────────┘


``
```
