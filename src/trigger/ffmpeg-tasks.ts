import { task } from "@trigger.dev/sdk/v3";
import { exec } from "child_process";
import fs from "fs/promises";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import path from "path";
import os from "os";
import { promisify } from "util";

const execAsync = promisify(exec);

// Helper: Upload to Transloadit (Server-Side)
async function uploadToTransloaditServer(filePath: string, fileName: string, contentType: string): Promise<string> {
    const authKey = process.env.NEXT_PUBLIC_TRANSLOADIT_AUTH_KEY;
    const templateId = process.env.NEXT_PUBLIC_TRANSLOADIT_TEMPLATE_ID;

    if (!authKey || !templateId) {
        throw new Error("Transloadit configuration missing (NEXT_PUBLIC_TRANSLOADIT_AUTH_KEY or TEMPLATE_ID)");
    }

    const fileBuffer = await fs.readFile(filePath);
    const formData = new FormData();

    formData.append("params", JSON.stringify({
        auth: { key: authKey },
        template_id: templateId,
    }));

    const blob = new Blob([fileBuffer], { type: contentType });
    formData.append("file", blob, fileName);

    console.log(`[Transloadit] Uploading ${fileName}...`);
    const response = await fetch("https://api2.transloadit.com/assemblies", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Transloadit API failed: ${response.status} ${text}`);
    }

    const result: any = await response.json();

    // Check for immediate result
    if (result.results && result.results[':original'] && result.results[':original'][0]) {
        return result.results[':original'][0].ssl_url;
    }

    // Check for uploads array
    if (result.uploads && result.uploads.length > 0) {
        return result.uploads[0].ssl_url;
    }

    // If assembly is executing, we might get an assembly_url but not the file yet.
    // For this assignment, we assume the template is synchronous enough or returns the upload URL immediately.
    // If not, we'd need to poll via assembly_url. 
    // Most simple store-only templates return immediately.
    if (result.assembly_url) {
        console.warn("[Transloadit] Assembly still executing. Returning assembly URL as fallback (might not be the file).");
        // We can't return the file URL if it's not ready. 
        // But throwing here blocks the flow.
        // Let's try to check 'uploads' again deeply.
    }

    console.error("[Transloadit] Unexpected response:", JSON.stringify(result).substring(0, 200));
    throw new Error("No URL returned from Transloadit assembly");
}

// FFmpeg Task: Crop Image
export const cropImageTask = task({
    id: "crop-image",
    run: async (payload: { imageUrl: string; x: number; y: number; width: number; height: number }) => {
        const { imageUrl, x, y, width, height } = payload;
        console.log(`[Crop Task] Starting for ${imageUrl}`);

        // 1. Download
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const tempDir = os.tmpdir();
        const inputPath = path.join(tempDir, `input-${Date.now()}.png`);
        const outputPath = path.join(tempDir, `output-${Date.now()}.png`);

        await fs.writeFile(inputPath, buffer);

        // 2. Crop
        // crop=iw*w_percent:ih*h_percent:iw*x_percent:ih*y_percent
        const cropFilter = `crop=iw*${width / 100}:ih*${height / 100}:iw*${x / 100}:ih*${y / 100}`;
        const ffmpegPath = process.env.FFMPEG_PATH || "ffmpeg";

        await execAsync(`"${ffmpegPath}" -y -i "${inputPath}" -vf "${cropFilter}" "${outputPath}"`);

        // 3. Upload
        try {
            const url = await uploadToTransloaditServer(outputPath, "cropped.png", "image/png");

            // Cleanup
            await fs.unlink(inputPath).catch(() => { });
            await fs.unlink(outputPath).catch(() => { });

            return { success: true, url };
        } catch (error) {
            console.error("[Crop Task] Upload failed:", error);
            // Cleanup
            await fs.unlink(inputPath).catch(() => { });
            await fs.unlink(outputPath).catch(() => { });
            throw error;
        }
    },
});

// FFmpeg Task: Extract Frame
export const extractFrameTask = task({
    id: "extract-frame",
    run: async (payload: { videoUrl: string; timestamp: number | string }) => {
        const { videoUrl, timestamp } = payload;
        console.log(`[Extract Task] Starting for ${videoUrl} at ${timestamp}`);

        const tempDir = os.tmpdir();
        const inputPath = path.join(tempDir, `input-video-${Date.now()}.mp4`);
        const outputPath = path.join(tempDir, `frame-${Date.now()}.jpg`);
        const ffmpegPath = process.env.FFMPEG_PATH || "ffmpeg";

        console.log(`[Extract Task] Downloading video ${videoUrl}`);
        const response = await fetch(videoUrl);
        if (!response.ok) throw new Error(`Failed to fetch video: ${response.statusText}`);

        // Download to local disk to avoid ffmpeg-static network segmentation faults
        const arrayBuffer = await response.arrayBuffer();
        await fs.writeFile(inputPath, Buffer.from(arrayBuffer));

        try {
            // Assignment Requirements specify timestamp is optional, defaults to 0
            let finalTimestamp = 0;

            if (timestamp === undefined || timestamp === null || timestamp === "") {
                finalTimestamp = 0;
            } else if (typeof timestamp === "number") {
                finalTimestamp = timestamp;
            } else if (typeof timestamp === "string") {
                if (timestamp.includes("%")) {
                    console.log("[Extract Task] Percentage detected. Fetching video duration...");
                    let stderrOutput = "";
                    // The ffmpeg extension provides FFPROBE_PATH
                    const ffprobePath = process.env.FFPROBE_PATH || "ffprobe";
                    try {
                        // With FFmpeg native installed, we can just run a quick ffmpeg probe here instead of downloading if needed
                        // but we already downloaded the clip so let's probe the local file
                        await execAsync(`"${ffprobePath}" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputPath}"`);
                    } catch (error: any) {
                        stderrOutput = error.stderr || error.stdout || "";
                    }

                    // If using ffprobe, the stdout is literally just the duration in seconds (e.g. "12.000000")
                    let totalSeconds = 0;

                    try {
                        console.log(`[Extract Task] Running ffprobe at path: ${ffprobePath}`);
                        const probeResult = await execAsync(`"${ffprobePath}" -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputPath}"`);
                        console.log(`[Extract Task] ffprobe stdout: ${probeResult.stdout}`);
                        const val = parseFloat(probeResult.stdout.trim());
                        if (!isNaN(val) && val > 0) {
                            totalSeconds = val;
                        } else {
                            throw new Error("ffprobe returned invalid time");
                        }
                    } catch (err: any) {
                        console.error("[Extract Task] ffprobe execution failed:", err.message, err.stderr);
                        // Fallback to ffmpeg output parsing if ffprobe fails
                        try {
                            console.log(`[Extract Task] Running ffmpeg as fallback at path: ${ffmpegPath}`);
                            // ffmpeg outputs duration to stderr
                            const { stderr } = await execAsync(`"${ffmpegPath}" -i "${inputPath}"`).catch(e => e);
                            console.log(`[Extract Task] ffmpeg fallback raw stderr: `, stderr?.substring(0, 300));

                            // Handle potential undefined stderr
                            if (stderr) {
                                const match = stderr.match(/Duration: (\d{2}):(\d{2}):(\d{2})\.(\d{2})/);
                                if (match) {
                                    const hours = parseInt(match[1]);
                                    const minutes = parseInt(match[2]);
                                    const seconds = parseInt(match[3]);
                                    const centiseconds = parseInt(match[4]);
                                    totalSeconds = (hours * 3600) + (minutes * 60) + seconds + (centiseconds / 100);
                                }
                            }
                        } catch (e: any) {
                            console.log(`[Extract Task] Fallback parsing entirely failed: `, e.message);
                        }
                    }

                    console.log(`[Extract Task] Parsed totalSeconds: ${totalSeconds}`);

                    if (isNaN(totalSeconds) || totalSeconds === 0) {
                        throw new Error("Could not determine video duration for percentage calculation.");
                    }
                    const percentage = parseFloat(timestamp.replace("%", ""));
                    if (isNaN(percentage)) throw new Error("Invalid percentage format");

                    finalTimestamp = totalSeconds * (percentage / 100);
                } else {
                    const parsed = parseFloat(timestamp);
                    if (!isNaN(parsed)) finalTimestamp = parsed;
                }
            }

            console.log(`[Extract Task] Final timestamp: ${finalTimestamp}s`);

            // Extract using local file. Put -ss BEFORE -i for fast seeking.
            await execAsync(`"${ffmpegPath}" -y -ss ${finalTimestamp} -i "${inputPath}" -frames:v 1 -q:v 2 "${outputPath}"`);

            // Check if output file was created and is not empty
            try {
                const stat = await fs.stat(outputPath);
                if (stat.size === 0) {
                    throw new Error(`FFmpeg created an empty file. The timestamp ${timestamp} might be outside the video's actual length.`);
                }
            } catch (err: any) {
                if (err.code === 'ENOENT') {
                    throw new Error(`Failed to extract frame at timestamp: ${timestamp}. This usually means the timestamp is outside the video's actual duration.`);
                }
                throw err;
            }

            // Upload
            const url = await uploadToTransloaditServer(outputPath, "frame.jpg", "image/jpeg");

            // Cleanup
            await fs.unlink(inputPath).catch(() => { });
            await fs.unlink(outputPath).catch(() => { });

            return { success: true, url };
        } catch (error) {
            console.error("[Extract Task] Failed:", error);
            // Cleanup on error
            await fs.unlink(inputPath).catch(() => { });
            await fs.unlink(outputPath).catch(() => { });
            throw error;
        }
    },
});
