# SarkariDoc – Bank & Govt PDF Fixer

A production-ready web application for fixing and validating Indian documents (PAN, Aadhaar, Passport, Bank KYC, Income Tax) to meet official upload requirements.

## 🎯 Overview

SarkariDoc is a smart document processing SaaS that automatically:
- Validates document size, DPI, format, and quality
- Compresses files to meet size requirements
- Whitens backgrounds and removes shadows
- Auto-crops and aligns documents
- Ensures compliance with Indian document standards

## ✨ Features

- **Purpose-Aware Processing**: Different presets for PAN, Aadhaar, Passport, Bank KYC, and Income Tax documents
- **Automatic Validation**: Checks file size, DPI, format, background color, and image clarity
- **Smart Processing**: Background whitening, shadow removal, auto-crop, and compression
- **Real-Time Progress**: Live updates during document processing
- **Validation Results**: Detailed checklist showing what passed and what needs attention
- **Mobile-First UI**: Beautiful, responsive design that works on all devices
- **Local Processing**: All processing happens on your server - no cloud dependencies

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Image Processing**: Sharp
- **PDF Processing**: pdf-lib
- **State Management**: React Hooks only

### Project Structure

```
sarkaridoc/
├── app/
│   ├── api/
│   │   ├── upload/route.ts          # File upload endpoint
│   │   ├── process/route.ts         # Document processing endpoint
│   │   ├── validate/route.ts        # Validation endpoint
│   │   └── download/[fileId]/route.ts  # File download endpoint
│   ├── processing/
│   │   └── page.tsx                 # Processing status page
│   ├── result/
│   │   └── page.tsx                 # Results and validation page
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Home page
│   └── globals.css                  # Global styles
├── components/
│   ├── UploadBox.tsx               # Drag & drop file upload
│   └── PurposeSelector.tsx         # Document purpose selector
├── lib/
│   ├── presets.ts                  # Document presets (PAN, Aadhaar, etc.)
│   ├── processor.ts                # Document processing logic
│   ├── validator.ts                 # Validation engine
│   └── storage.ts                  # File storage utilities
├── types/
│   └── index.ts                     # TypeScript type definitions
├── uploads/                         # Uploaded files (gitignored)
├── processed/                       # Processed files (gitignored)
├── temp/                            # Temporary files (gitignored)
└── package.json
```

## 📋 Document Presets

### PAN Card
- **Max Size**: 200 KB
- **Min DPI**: 300
- **Background**: Pure white
- **Orientation**: Portrait
- **Formats**: PDF, JPG, JPEG, PNG
- **Features**: Shadow removal, background whitening

### Aadhaar Card
- **Max Size**: 200 KB
- **Min DPI**: 300
- **Background**: Pure white
- **Orientation**: Portrait
- **Formats**: PDF, JPG, JPEG, PNG
- **Features**: Shadow removal, background whitening

### Passport
- **Max Size**: 100 KB
- **Min DPI**: 300
- **Background**: Pure white
- **Aspect Ratio**: 35mm x 45mm (standard passport photo)
- **Orientation**: Portrait
- **Formats**: PDF, JPG, JPEG, PNG
- **Features**: Face-centered cropping, aspect ratio correction

### Bank KYC
- **Max Size**: 500 KB
- **Min DPI**: 200
- **Background**: Pure white
- **Orientation**: Any
- **Formats**: PDF only
- **Features**: Signature extraction, PDF optimization

### Income Tax
- **Max Size**: 200 KB
- **Min DPI**: 300
- **Background**: Pure white
- **Orientation**: Portrait
- **Formats**: PDF, JPG, JPEG, PNG
- **Features**: Shadow removal, background whitening

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- macOS, Linux, or Windows
- **Optional - For enhanced PDF compression**: System libraries for `canvas` package:
  - **macOS**: `brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman`
  - **Ubuntu/Debian**: `sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev`
  - **Windows**: Pre-built binaries are included, no additional setup needed

### Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd sarkaridoc
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```
   
   **Note**: The `canvas` package is **optional**. The app works without it, but PDF compression will be limited. For best results:
   - **Local development**: Install system libraries (see Prerequisites) then `npm install`
   - **Hosting**: Most platforms (Vercel, Railway, etc.) don't support canvas. The app will use alternative compression methods automatically.

3. **Create required directories** (they'll be created automatically, but you can create them manually):
   ```bash
   mkdir -p uploads processed temp
   ```

### Running the Application

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

3. **Test the application**:
   - Select a document purpose (e.g., PAN Card)
   - Upload a document (PDF or image)
   - Click "Fix My Document"
   - Wait for processing to complete
   - Review validation results
   - Download the fixed document

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Hosting Considerations

**✅ Works on all platforms without canvas:**
- The app works without `canvas` - it will use embedded image extraction for PDF compression
- Image compression works perfectly (JPEG/PNG)
- PDF compression is limited but functional

**🚀 Recommended Hosting Platforms:**
- **Vercel**: Works out of the box (canvas optional)
- **Railway**: Works out of the box (canvas optional)
- **Render**: Works out of the box (canvas optional)
- **AWS Lambda/EC2**: Install system dependencies if you want canvas support
- **Docker**: Add canvas dependencies to Dockerfile if needed

**📝 For platforms that support canvas (optional):**
If your hosting platform supports native modules, you can install canvas for enhanced PDF compression:
1. Install system dependencies (see Prerequisites)
2. Canvas will be installed automatically as an optional dependency
3. PDF compression will use canvas rendering when available

**💡 Best Practice:**
- For production: Upload images (JPEG/PNG) instead of PDFs for best compression
- PDF compression works best when PDFs contain embedded images (scanned documents)

## 🔧 How It Works

### 1. Upload Flow

1. User selects document purpose (PAN, Aadhaar, etc.)
2. User uploads a file (drag & drop or click to browse)
3. File is uploaded to `/api/upload` and stored with a unique ID
4. User is redirected to processing page

### 2. Processing Flow

1. Processing page calls `/api/process` with file ID and purpose
2. Server processes the document:
   - Validates file format and size
   - For images: resizes to meet DPI requirements, whitens background, removes shadows, auto-crops
   - For PDFs: optimizes and compresses
   - Saves processed file
3. Real-time progress updates via Server-Sent Events (SSE)
4. User is redirected to results page when complete

### 3. Validation Flow

1. Results page calls `/api/validate` to get validation results
2. Validator checks:
   - File size (within limits)
   - File format (allowed formats)
   - DPI/Resolution (meets minimum)
   - Orientation (matches requirements)
   - Background color (mostly white)
   - Image clarity (not blurry)
   - Aspect ratio (for passport)
3. Results displayed with pass/fail status and suggestions

### 4. Download Flow

1. User clicks "Download Fixed Document"
2. Browser requests `/api/download/[fileId]`
3. Server returns the processed file with appropriate headers
4. File downloads to user's device

## 🛠️ Adding New Document Types

To add a new document type:

1. **Add the preset** in `lib/presets.ts`:
   ```typescript
   export const documentPresets: Record<DocumentPurpose, DocumentPreset> = {
     // ... existing presets
     new_document_type: {
       maxSizeKB: 200,
       minDPI: 300,
       backgroundColor: '#FFFFFF',
       orientation: 'portrait',
       allowedFormats: ['.pdf', '.jpg', '.jpeg', '.png'],
       removeShadows: true,
     },
   }
   ```

2. **Update the type** in `types/index.ts`:
   ```typescript
   export type DocumentPurpose = 
     | 'pan'
     | 'aadhaar'
     | 'passport'
     | 'bank_kyc'
     | 'income_tax'
     | 'new_document_type'  // Add here
   ```

3. **Add to the selector** in `components/PurposeSelector.tsx`:
   ```typescript
   const purposes = [
     // ... existing purposes
     {
       value: 'new_document_type',
       label: 'New Document Type',
       description: 'Max 200 KB, White background, 300+ DPI',
     },
   ]
   ```

## 🎨 Customization

### Styling

The app uses Tailwind CSS. Customize colors, fonts, and spacing in:
- `tailwind.config.js` - Theme configuration
- `app/globals.css` - Global styles

### Processing Logic

Modify document processing in:
- `lib/processor.ts` - Main processing logic
- `lib/validator.ts` - Validation rules
- `lib/presets.ts` - Document requirements

## 🔒 Security Considerations

- **File Upload Limits**: Maximum 10MB upload size (configurable in `next.config.js`)
- **File Cleanup**: Old files are automatically cleaned up after 24 hours
- **Local Storage**: All files are stored locally (no cloud dependencies)
- **Input Validation**: File types and sizes are validated before processing

## 🐛 Troubleshooting

### Common Issues

1. **"File not found" error**:
   - Ensure `uploads/` and `processed/` directories exist
   - Check file permissions

2. **Processing fails**:
   - Verify Sharp and pdf-lib are installed correctly
   - Check Node.js version (requires 18+)
   - Review server logs for detailed error messages

3. **DPI validation fails**:
   - Ensure source images have sufficient resolution
   - The processor will upscale if needed, but quality may be affected

4. **File size still too large after processing**:
   - The processor uses aggressive compression
   - For PDFs, consider using a dedicated PDF compression library

## 📝 API Reference

### POST `/api/upload`

Upload a document file.

**Request**:
- `file`: File (multipart/form-data)
- `purpose`: DocumentPurpose (multipart/form-data)

**Response**:
```json
{
  "fileId": "uuid",
  "filename": "document.pdf",
  "purpose": "pan",
  "size": 123456
}
```

### POST `/api/process`

Process a document.

**Request**:
```json
{
  "fileId": "uuid",
  "purpose": "pan"
}
```

**Response**: Server-Sent Events stream with progress updates

### GET `/api/validate?fileId=uuid&purpose=pan`

Get validation results for a processed document.

**Response**:
```json
{
  "passed": true,
  "checks": [
    {
      "name": "File Size",
      "passed": true,
      "message": "File size is 150.23 KB (max: 200 KB)",
      "severity": "info"
    }
  ],
  "suggestions": []
}
```

### GET `/api/download/[fileId]?preview=true`

Download or preview a processed document.

**Query Parameters**:
- `preview`: If `true`, returns file for preview (no download prompt)

**Response**: File stream with appropriate content-type headers

## 🚧 Future Enhancements

- [ ] Drag & drop upload (partially implemented)
- [ ] Hindi language toggle
- [ ] Dark mode
- [ ] Batch processing (multiple files)
- [ ] Advanced PDF compression
- [ ] OCR for text extraction
- [ ] Signature detection and validation
- [ ] Cloud storage integration (optional)

## 📄 License

This project is provided as-is for demonstration purposes.

## 🤝 Contributing

This is a production-ready MVP. Feel free to extend it with additional features as needed.

---

**Built with ❤️ for India**

