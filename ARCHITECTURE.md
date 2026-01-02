# Architecture Overview

## System Design

DocFix India is built as a modern full-stack Next.js application with a focus on local processing and real-time feedback.

## Component Architecture

### Frontend (Next.js App Router)

```
app/
├── page.tsx              # Home page with upload form
├── processing/
│   └── page.tsx          # Real-time processing status
├── result/
│   └── page.tsx          # Validation results and download
└── api/                  # API routes (backend)
```

### Backend (Next.js API Routes)

```
app/api/
├── upload/route.ts       # File upload handler
├── process/route.ts      # Document processing (SSE stream)
├── validate/route.ts     # Validation results
└── download/[fileId]/    # File download handler
```

### Core Libraries

```
lib/
├── presets.ts           # Document type configurations
├── processor.ts          # Image/PDF processing engine
├── validator.ts          # Validation logic
└── storage.ts            # File storage utilities
```

## Data Flow

### 1. Upload Flow

```
User → Upload File → /api/upload → Store in uploads/ → Return fileId
```

### 2. Processing Flow

```
Client → /api/process → Find uploaded file → Process document → 
  → Stream progress updates (SSE) → Save to processed/ → Complete
```

### 3. Validation Flow

```
Client → /api/validate → Load processed file → Run validations → 
  → Return results with pass/fail status
```

### 4. Download Flow

```
Client → /api/download/[fileId] → Read processed file → 
  → Stream file with proper headers → Download
```

## Processing Pipeline

### Image Processing

1. **Load Image** (Sharp)
2. **Resize for DPI** (if needed)
3. **Whiten Background** (pixel-level processing)
4. **Remove Shadows** (brightness/contrast adjustment)
5. **Auto-Crop** (aspect ratio correction for passport)
6. **Compress** (quality adjustment to meet size)
7. **Save** (JPEG with metadata)

### PDF Processing

1. **Load PDF** (pdf-lib)
2. **Extract Pages**
3. **Optimize Structure**
4. **Compress** (if needed)
5. **Save**

## Validation Engine

The validator performs multiple checks:

1. **File Size**: Compare against preset maxSizeKB
2. **File Format**: Check against allowedFormats
3. **DPI/Resolution**: Verify minimum DPI (images only)
4. **Orientation**: Check portrait/landscape requirements
5. **Aspect Ratio**: Validate for passport photos
6. **Background Color**: Analyze white pixel percentage
7. **Image Clarity**: Basic blur detection using statistics
8. **PDF Structure**: Validate PDF integrity

## Storage Strategy

- **uploads/**: Original uploaded files (temporary)
- **processed/**: Processed documents (temporary)
- **temp/**: Temporary processing files

Files are automatically cleaned up after 24 hours (configurable).

## Real-Time Updates

Processing uses Server-Sent Events (SSE) for real-time progress:

```
Server → SSE Stream → Client → Update UI
```

Format: `data: {step, progress, message, complete}\n\n`

## Error Handling

- **Upload Errors**: Return 400/500 with error message
- **Processing Errors**: Stream error via SSE, show in UI
- **Validation Errors**: Return detailed validation results
- **Download Errors**: Return 404/500 with error message

## Security Considerations

1. **File Type Validation**: Check extensions and MIME types
2. **Size Limits**: Enforce maximum upload size (10MB)
3. **Path Traversal Protection**: Use path.join() and validate paths
4. **Temporary Files**: Auto-cleanup prevents disk fill
5. **No Cloud Dependencies**: All processing is local

## Performance Optimizations

1. **Streaming**: Large files processed in streams
2. **Progressive Compression**: Try multiple quality levels
3. **Efficient Image Processing**: Use Sharp's native performance
4. **Lazy Loading**: Components load on demand
5. **Caching**: Processed files cached until cleanup

## Scalability Considerations

For production deployment:

1. **File Storage**: Move to cloud storage (S3, GCS)
2. **Queue System**: Use job queue for heavy processing
3. **CDN**: Serve static assets via CDN
4. **Database**: Track file metadata and processing status
5. **Horizontal Scaling**: Stateless API routes enable scaling

## Technology Choices

### Why Next.js?

- **Full-Stack**: API routes + frontend in one framework
- **App Router**: Modern routing with server components
- **TypeScript**: Type safety throughout
- **Performance**: Built-in optimizations

### Why Sharp?

- **Native Performance**: C++ bindings for speed
- **Rich API**: Comprehensive image operations
- **Format Support**: Handles all common formats

### Why pdf-lib?

- **Pure JavaScript**: No native dependencies
- **Flexible**: Create and modify PDFs
- **Reliable**: Well-maintained library

### Why Tailwind CSS?

- **Utility-First**: Rapid UI development
- **Customizable**: Easy theme configuration
- **Production-Ready**: Optimized output

---

This architecture prioritizes simplicity, local processing, and real-time feedback while maintaining production-ready code quality.

