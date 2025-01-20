# Canny Edge Detection Web App

A web application that performs Canny edge detection on uploaded images and provides downloadable SVG results. Built with Next.js, Python, and shadcn/ui.

## Demo
Check out this video: [https://youtu.be/9q085C0NcjY](url)

## Features

- Upload images via drag-and-drop or file selection
- Real-time image preview
- Two levels of edge detection (σ=1 and σ=2)
- SVG output for scalable results
- Downloadable SVG files
- Modern, responsive UI with dark mode support

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- Python (v3.7 or higher)
- pip (Python package manager)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cannyEdge
```

2. Install Python dependencies:
```bash
pip install numpy matplotlib scipy scikit-image svgwrite
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

## Running the Application

1. Start the frontend development server:
```bash
cd frontend
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

```
cannyEdge/
├── canny.py              # Python script for edge detection
├── frontend/            # Next.js frontend application
│   ├── app/            # Next.js app directory
│   │   ├── api/       # API routes
│   │   └── page.tsx   # Main page component
│   ├── components/    # UI components
│   └── public/        # Static files
├── temp/              # Temporary directory for uploaded images
└── README.md
```

## How It Works

1. Upload an image through the web interface
2. The image is sent to the backend API
3. The Python script processes the image using the Canny edge detection algorithm
4. Two SVGs are generated with different sigma values:
   - σ=1: More detailed edges
   - σ=2: Smoother, more prominent edges
5. The SVGs are displayed and available for download
6. Then you can drag and drop the SVGs into Figma, select all the lines, and change the stroke thickness to 1.

## API Endpoints

### POST `/api/process-image`
- Accepts multipart form data with an image file
- Returns JSON containing two SVG strings:
  ```json
  {
    "sigma1": "...(SVG content)...",
    "sigma2": "...(SVG content)..."
  }
  ```

## Development

### Frontend
The frontend is built with:
- Next.js 14
- TypeScript
- Tailwind CSS
- shadcn/ui components

### Backend
The image processing backend uses:
- scikit-image for edge detection
- svgwrite for SVG generation
- NumPy and SciPy for numerical operations

## Troubleshooting

1. If you encounter memory issues with large images:
   - The API route has a 50MB buffer limit
   - Adjust `MAX_BUFFER` in `frontend/app/api/process-image/route.ts` if needed

2. If Python dependencies fail to install:
   - Ensure you have Python development tools installed
   - On Ubuntu/Debian: `sudo apt-get install python3-dev`
   - On Windows: Install Visual C++ build tools

3. If the application fails to start:
   - Check if all ports are available (3000 for Next.js)
   - Ensure all dependencies are installed
   - Check console for error messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
