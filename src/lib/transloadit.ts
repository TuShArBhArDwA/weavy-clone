export async function uploadToTransloadit(file: File): Promise<string> {
    const authKey = process.env.NEXT_PUBLIC_TRANSLOADIT_AUTH_KEY;
    const templateId = process.env.NEXT_PUBLIC_TRANSLOADIT_TEMPLATE_ID;

    if (!authKey || !templateId) {
        throw new Error("Transloadit configuration missing");
    }

    const formData = new FormData();
    formData.append("params", JSON.stringify({
        auth: { key: authKey },
        template_id: templateId,
    }));
    formData.append("file", file);

    const response = await fetch("https://api2.transloadit.com/assemblies", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Transloadit upload failed");
    }

    const result = await response.json();

    // Check if assembly is still executing (it might be async)
    if (result.ok === "ASSEMBLY_EXECUTING") {
        // For simplicity in this demo, we'll return the initial file URL if available, 
        // or the assembly status URL. In a prod app, we'd poll.
        // But Transloadit standard templates usually return results quickly or provide a temporary URL.
        // Let's try to get the ssl_url of the uploaded file from 'uploads'
        if (result.uploads && result.uploads.length > 0) {
            return result.uploads[0].ssl_url;
        }
    }

    // If completed immediately
    if (result.results && result.results[':original'] && result.results[':original'].length > 0) {
        return result.results[':original'][0].ssl_url;
    }

    // Fallback: if we can't find the result immediately, return the execution URL 
    // (In a real app, you'd handle async status)
    if (result.uploads && result.uploads.length > 0) {
        return result.uploads[0].ssl_url;
    }

    throw new Error("No URL returned from Transloadit");
}
