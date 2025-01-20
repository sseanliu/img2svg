"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Download } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [svgs, setSvgs] = useState<{ sigma1: string; sigma2: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/process-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to process image");

      const data = await response.json();
      setSvgs(data);
    } catch (error) {
      console.error("Error processing image:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (svg: string, filename: string) => {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="container mx-auto p-4 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Canny Edge Detection</h1>
          <p className="text-muted-foreground">
            Upload an image to detect edges using the Canny algorithm
          </p>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-muted-foreground"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG or JPEG</p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {preview && (
              <div className="relative w-full h-64">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!file || loading}
              className="w-full"
            >
              {loading ? "Processing..." : "Process Image"}
            </Button>
          </div>
        </Card>

        {svgs && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Sigma = 1</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(svgs.sigma1, "edges_sigma1.svg")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download SVG
                </Button>
              </div>
              <div
                className="w-full aspect-square border rounded-lg flex items-center justify-center bg-white"
                dangerouslySetInnerHTML={{ __html: svgs.sigma1 }}
              />
            </Card>
            <Card className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Sigma = 2</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(svgs.sigma2, "edges_sigma2.svg")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download SVG
                </Button>
              </div>
              <div
                className="w-full aspect-square border rounded-lg flex items-center justify-center bg-white"
                dangerouslySetInnerHTML={{ __html: svgs.sigma2 }}
              />
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
