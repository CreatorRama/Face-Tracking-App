# Face Tracking App

A real-time face tracking application built with Next.js, React, and TensorFlow.js that detects facial landmarks and records videos with face tracking overlays.

## Features

- **Real-time Face Detection**: Uses TensorFlow.js FaceMesh model to detect and track facial landmarks in real-time
- **Video Recording**: Records the webcam feed with face tracking overlays
- **Local Storage**: Automatically saves recorded videos to browser's local storage
- **Download & Delete**: Manage your recorded videos with download and delete functionality
- **Performance Optimized**: Supports WebGL backend for better performance, with CPU fallback
- **Responsive Design**: Clean, modern UI built with Tailwind CSS

## Technology Stack

- **Frontend Framework**: Next.js 13+ (App Router)
- **UI Library**: React 18
- **Machine Learning**: TensorFlow.js, @tensorflow-models/facemesh
- **Styling**: Tailwind CSS
- **Video Processing**: MediaRecorder API, Canvas API

## Prerequisites

- Node.js 16+ installed
- A modern web browser with webcam access
- WebGL support (recommended for better performance)

## Installation

1. Clone the repository:
```bash
git clone  https://github.com/CreatorRama/Face-Tracking-App.git
cd ./
```

2. Install dependencies:
```bash
npm install
```

3. Initialize Tailwind CSS (if not already configured):
```bash
npx tailwindcss init -p
```

## Project Structure

```
face-tracking-app/
├── app/
│   ├── globals.css           # Global styles with Tailwind
│   ├── layout.js            # Root layout component
│   └── page.js              # Main page component
├── components/
│   └── FaceTrackingComponent.js  # Core face tracking component
├── public/                  # Static assets
├── package.json
└── README.md
```

## Usage

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to `http://localhost:3000`

3. Grant camera permissions when prompted

4. The app will automatically start detecting your face and displaying red dots on facial landmarks

5. Click "Start Recording" to begin recording the video with face tracking overlay

6. Click "Stop Recording" to end the recording

7. View your recorded videos in the "Recorded Videos" section below

8. Download or delete videos as needed

## Component Overview

### FaceTrackingComponent

The main component that handles:

- **Camera Initialization**: Accesses user's webcam with optimal settings
- **Face Detection**: Uses TensorFlow.js FaceMesh model to detect facial landmarks
- **Real-time Rendering**: Draws video feed and face landmarks on canvas
- **Video Recording**: Records canvas stream with face tracking overlays
- **Data Management**: Saves/loads videos from localStorage

### Key Features:

- **Performance Optimization**: 
  - Detects only one face for better performance
  - Uses 15fps recording to reduce lag
  - Configurable video bitrate (2.5 Mbps)

- **Error Handling**: 
  - WebGL fallback to CPU backend
  - Camera access error handling
  - Model loading error handling

- **Video Management**:
  - Base64 encoding for localStorage
  - Automatic cleanup of object URLs
  - Timestamped video entries

## Configuration Options

You can modify these settings in the `FaceTrackingComponent`:

```javascript
// Video quality settings
const canvasStream = canvasRef.current.captureStream(15); // FPS
videoBitsPerSecond: 2500000 // Bitrate in bps

// Camera settings
video: { 
  facingMode: 'user', 
  width: { ideal: 640 }, 
  height: { ideal: 480 } 
}

// Face detection settings
maxFaces: 1, // Number of faces to detect
refineLandmarks: false // Enable for higher accuracy (slower)
```

## Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Supported (may require WebGL enabling)
- **Edge**: Full support

**Note**: WebGL must be enabled for optimal performance. The app will fallback to CPU processing if WebGL is unavailable.

## Troubleshooting

### Camera Access Issues
- Ensure you've granted camera permissions
- Check if camera is being used by another application
- Try refreshing the page

### Performance Issues
- Enable WebGL in your browser settings
- Close other resource-intensive applications
- Lower the recording frame rate in the code

### WebGL Not Available
The app will automatically fallback to CPU processing, but performance may be reduced.

## Privacy & Security

- All video processing happens locally in your browser
- No data is sent to external servers
- Videos are stored in browser's local storage
- Camera access is only used for face tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source. Please check the LICENSE file for details.

## Acknowledgments

- TensorFlow.js team for the machine learning models
- MediaPipe for the FaceMesh model architecture
- Next.js team for the excellent React framework