import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { existsSync } from 'fs';

const execAsync = promisify(exec);

// 50MB buffer size
const MAX_BUFFER = 50 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;
    
    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Create temp directory
    const tempDir = path.join(process.cwd(), "..", "temp");
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    // Create a buffer from the file
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save the image temporarily with absolute path
    const tempImagePath = path.join(tempDir, "test.png");
    await writeFile(tempImagePath, buffer);

    // Run the Python script from its directory with increased buffer size
    const pythonScript = path.join(process.cwd(), "..", "canny.py");
    const cwd = path.dirname(pythonScript);
    const { stdout } = await execAsync(`python "${pythonScript}"`, { 
      cwd,
      maxBuffer: MAX_BUFFER 
    });

    // Parse the SVG content from stdout
    const startMarker = "SVG_CONTENT_START";
    const separator = "SVG_CONTENT_SEPARATOR";
    const endMarker = "SVG_CONTENT_END";

    const startIndex = stdout.indexOf(startMarker) + startMarker.length;
    const separatorIndex = stdout.indexOf(separator);
    const endIndex = stdout.indexOf(endMarker);

    if (startIndex === -1 || separatorIndex === -1 || endIndex === -1) {
      throw new Error("Failed to parse Python output");
    }

    const svg1 = stdout.slice(startIndex, separatorIndex).trim();
    const svg2 = stdout.slice(separatorIndex + separator.length, endIndex).trim();

    return NextResponse.json({
      sigma1: svg1,
      sigma2: svg2,
    });
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
} 