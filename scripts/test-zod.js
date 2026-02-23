
const { saveWorkflowSchema } = require("../src/lib/schemas");
const { z } = require("zod");

console.log("Zod version:", require("package.json").dependencies.zod);

try {
    const schema = z.object({ foo: z.string() });
    console.log("Basic Zod schema created.");

    const result = schema.safeParse({ foo: "bar" });
    console.log("Basic Zod parse result:", result.success);
} catch (e) {
    console.error("Basic Zod failed:", e);
}

try {
    if (saveWorkflowSchema) {
        console.log("saveWorkflowSchema imported successfully.");
        const dummy = { name: "Test", nodes: [], edges: [] };
        const res = saveWorkflowSchema.safeParse(dummy);
        console.log("saveWorkflowSchema parse result:", res.success);
    } else {
        console.error("saveWorkflowSchema is undefined!");
    }
} catch (e) {
    console.error("saveWorkflowSchema failed:", e);
}
