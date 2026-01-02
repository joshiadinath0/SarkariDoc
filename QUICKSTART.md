# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14
- React 18
- Sharp (image processing)
- pdf-lib (PDF processing)
- TypeScript
- Tailwind CSS

### 2. Start Development Server

```bash
npm run dev
```

### 3. Open in Browser

Navigate to: **http://localhost:3000**

## 📝 First Use

1. **Select Document Purpose**: Choose from PAN, Aadhaar, Passport, Bank KYC, or Income Tax
2. **Upload Document**: Drag & drop or click to browse
3. **Click "Fix My Document"**: Processing will start automatically
4. **Review Results**: Check validation results and download the fixed document

## 🧪 Test with Sample Documents

You can test the application with:
- Any PDF file (for Bank KYC)
- Any image file (JPG, PNG) for other document types
- Documents that are too large or have dark backgrounds to see the processing in action

## ⚠️ Troubleshooting

### Port 3000 Already in Use

If port 3000 is busy, Next.js will automatically use the next available port (3001, 3002, etc.)

### Module Not Found Errors

Run `npm install` again to ensure all dependencies are installed.

### Processing Fails

- Ensure you have Node.js 18+ installed
- Check that Sharp is installed correctly (it requires native dependencies)
- Review the browser console and terminal for error messages

## 📦 Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔧 Environment Setup

No environment variables are required for local development. All processing happens locally on your machine.

---

**Need Help?** Check the main [README.md](./README.md) for detailed documentation.

