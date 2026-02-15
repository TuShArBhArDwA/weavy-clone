# 🧪 Testing & Verification Guide

Use this guide to verify that **every assignment requirement** is met. Run through each section systematically.

---

## Prerequisites

Open **two terminals** in the project root:

```bash
# Terminal 1 — Next.js dev server
npm run dev

# Terminal 2 — Trigger.dev worker
npx trigger.dev@latest dev
```

Make sure your `.env` has all keys configured:
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_TRANSLOADIT_AUTH_KEY`, `NEXT_PUBLIC_TRANSLOADIT_TEMPLATE_ID`
- `TRIGGER_SECRET_KEY`
- `DATABASE_URL`

---

## 1. Authentication (Clerk)

| # | Test | How to Verify | Expected |
|---|------|---------------|----------|
| 1.1 | Sign In/Sign Up | Go to `http://localhost:3000`. You should be redirected to Clerk sign-in. | Clerk auth page appears |
| 1.2 | Protected Routes | Sign out and try accessing `/workflow` directly | Redirects to sign-in |
| 1.3 | User Association | Sign in with two different accounts and create a workflow each | Each user sees only their own workflows |

**File**: `src/middleware.ts` — Clerk middleware protecting routes

---

## 2. Core Workflow Interface (UI/UX)

| # | Test | How to Verify | Expected |
|---|------|---------------|----------|
| 2.1 | Dot Grid Background | Open `/workflow` — look at the canvas | Dark canvas with dot grid pattern |
| 2.2 | Left Sidebar | Check left side of screen | Collapsible sidebar with search bar and node buttons |
| 2.3 | Right Sidebar | Check right side of screen | Workflow History panel shows past runs |
| 2.4 | MiniMap | Check bottom-right of canvas | Small navigation minimap visible |
| 2.5 | Canvas Pan/Zoom | Drag canvas background, scroll to zoom | Smooth panning and zooming |
| 2.6 | Responsive Design | Resize browser window | No overflow issues, layout adjusts |

**Files**: `src/components/workflow/FlowEditor.tsx`, `Sidebar.tsx`, `HistorySidebar.tsx`

---

## 3. Node Types (6 Buttons in Left Sidebar)

| # | Test | How to Verify | Expected |
|---|------|---------------|----------|
| 3.1 | Text Node | Click "Text" in sidebar or drag onto canvas | Text node with textarea appears on canvas |
| 3.2 | Upload Image Node | Click "Image" in sidebar | Image node with file upload appears |
| 3.3 | Upload Video Node | Click "Video" in sidebar | Video node with file upload appears |
| 3.4 | LLM Node | Click "LLM" in sidebar | LLM node with model dropdown appears |
| 3.5 | Crop Image Node | Click "Crop Image" in sidebar | Crop node with x%, y%, width%, height% fields |
| 3.6 | Extract Frame Node | Click "Extract Frame" in sidebar | Extract frame node with video_url and timestamp fields |

**Files**: `src/components/workflow/nodes/TextNode.tsx`, `ImageNode.tsx`, `VideoNode.tsx`, `LLMNode.tsx`, `CropImageNode.tsx`, `ExtractFrameNode.tsx`

---

## 4. Node Handle Verification

### LLM Node Handles
| Handle | Type | ID | Color |
|--------|------|-----|-------|
| System Prompt | Target (left) | `system-prompt` | Emerald |
| User Message | Target (left) | `prompt` | Pink |
| Image(s) | Target (left) | `image-0`, `image-1`... | Purple |
| Output | Source (right) | `response` | Yellow-green |

**Verify**: Hover over each handle on an LLM node — tooltip shows the label.

### Crop Image Node Handles
- `image_url` (target), `x_percent`, `y_percent`, `width_percent`, `height_percent` (targets), `output` (source)

### Extract Frame Node Handles
- `video_url` (target), `timestamp` (target), `output` (source)

---

## 5. Upload Tests (Transloadit)

| # | Test | How to Verify | Expected |
|---|------|---------------|----------|
| 5.1 | Image Upload | Drop an image (jpg/png/webp) onto Image Node | Image preview appears, URL stored |
| 5.2 | Video Upload | Drop a video (mp4/mov/webm) onto Video Node | Video player preview appears, URL stored |

> ⚠️ **Requires**: A valid Transloadit template ID and auth key in `.env`

**File**: `src/lib/transloadit.ts`

---

## 6. LLM Execution (via Trigger.dev)

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 6.1 | Basic Generation | Add Text node → connect to LLM `prompt` → click "Run Model" | LLM response appears **inline on the node** |
| 6.2 | With System Prompt | Add 2 Text nodes → connect one to `system-prompt`, one to `prompt` → Run | Response follows system instructions |
| 6.3 | With Image (Vision) | Add Image node → upload image → connect to LLM `image-0` → add prompt → Run | LLM describes the image |
| 6.4 | Model Selector | Change model dropdown (e.g., to Gemini 2.5 Flash) → Run | Uses selected model |
| 6.5 | Loading State | Click "Run Model" and observe | Pulsating glow border, spinner, button disabled |
| 6.6 | Error Handling | Run LLM with no prompt connected | Graceful error message shown |

> ⚠️ **Requires**: Trigger.dev dev worker running in Terminal 2

**Files**: `src/trigger/workflow-nodes.ts` (task `generate-text`), `src/app/actions/workflowActions.ts`

---

## 7. FFmpeg Tasks (Crop Image & Extract Frame)

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 7.1 | Crop Image | Upload image → connect to Crop → configure x/y/w/h% → Run workflow | Cropped image URL in output |
| 7.2 | Extract Frame | Upload video → connect to Extract Frame → set timestamp to "50%" → Run | Frame from middle of video appears in output |
| 7.3 | Extract Frame (Seconds) | Same as above, but set timestamp to "5.5" | Frame from 5.5s mark appears |

**File**: `src/trigger/ffmpeg-tasks.ts` (tasks `crop-image`, `extract-frame`)

---

## 8. Workflow Features

| # | Feature | How to Verify | Expected |
|---|---------|---------------|----------|
| 8.1 | Drag & Drop | Click or drag nodes from sidebar to canvas | Nodes appear on canvas |
| 8.2 | Node Connections | Drag from output handle (right) to input handle (left) | Animated purple edge connects them |
| 8.3 | Connected Input State | Connect a text node output to an LLM prompt input | Manual input field for that handle is **greyed out/disabled** |
| 8.4 | Type-Safe Connections | Try connecting Image node output to LLM's system-prompt | Connection should be **visually disallowed** |
| 8.5 | DAG Validation | Try creating a circular connection (A→B→A) | Connection rejected, no cycles |
| 8.6 | Node Deletion | Select a node, press Delete/Backspace, OR use node menu → Delete | Node removed from canvas |
| 8.7 | Undo/Redo | Add a node, press Ctrl+Z, then Ctrl+Shift+Z | Node removed, then restored |
| 8.8 | Fit View | Click the fit-view button in canvas controls (bottom-left area) | Canvas zooms to fit all nodes |
| 8.9 | Selective Execution | Right-click a single node → Run | Only that node executes, history entry created |
| 8.10 | Parallel Execution | Build a workflow with 2 independent branches → Run | Both branches execute simultaneously |
| 8.11 | Workflow Persistence | Click SAVE, refresh page, click OPEN → select saved workflow | Workflow restored with all nodes and edges |
| 8.12 | Failure Handling | Create workflow with 2 nodes A->B. Force A to fail (e.g., bad input). Run. | Node A fails (Red). Node B stays IDLE (not skipped/running). Workflow fails. |

**Files**: `FlowEditor.tsx`, `UndoRedoControls.tsx`, `CanvasControls.tsx`

---

## 9. Workflow History (Right Sidebar)

| # | Test | How to Verify | Expected |
|---|------|---------------|----------|
| 9.1 | History Panel | Run a workflow → check right sidebar | New run entry with timestamp & status |
| 9.2 | Status Badges | Run workflows that succeed and fail | Green ✅ = success, Red ❌ = failed, Yellow = running |
| 9.3 | Execution Scope | Run full workflow, single node, selected nodes | Each shows correct scope label (full/single/partial) |
| 9.4 | Click to Expand | Click on a run entry | Expands to show node-level execution details |
| 9.5 | Node-Level Details | Expand a run | Each node shows: status, output, execution time |
| 9.6 | Partial Runs | Run a workflow where one node fails | Succeeded nodes show green, failed shows red |
| 9.7 | Persistence | Refresh page | Run history still present (loaded from DB) |

**File**: `src/components/workflow/HistorySidebar.tsx`

---

## 10. Export/Import JSON

| # | Test | How to Verify | Expected |
|---|------|---------------|----------|
| 10.1 | Export | Click SHARE button in header | Downloads `workflow_name.json` file |
| 10.2 | Import | *(See note below)* | — |

> ⚠️ **Note**: JSON import (uploading a `.json` file to restore a workflow) may not have a dedicated UI button. The current implementation only has JSON **export** via the Share button. If the evaluator tests import, you may need to add an import button to the Header.

---

## 11. Sample Workflow — "Product Marketing Kit Generator"

| # | Test | How to Verify | Expected |
|---|------|---------------|----------|
| 11.1 | Sample Exists | Check if the app has a way to load the sample workflow (e.g., from dashboard or demo button) | Sample workflow loads with all 9 nodes |
| 11.2 | All 6 Node Types | Count node types in the sample | Text ×3, Image ×1, Video ×1, LLM ×2, Crop ×1, Extract Frame ×1 |
| 11.3 | Parallel Branches | Observe layout | Branch A (top) and Branch B (bottom) are independent |
| 11.4 | Convergence | Check final LLM node connections | LLM #2 receives from both branches |
| 11.5 | Run Sample | Upload image + video files, then click RUN | Both branches execute in parallel, final LLM waits for both |

**File**: `src/lib/sampleWorkflowData.ts`

---

## 12. Technical Stack Checklist

| Requirement | Status | Evidence |
|---|---|---|
| **Next.js App Router** | ✅ | `src/app/` directory structure |
| **TypeScript** | ✅ | All files are `.ts`/`.tsx` |
| **PostgreSQL + Prisma** | ✅ | `prisma/schema.prisma`, `src/lib/prisma.ts` |
| **Clerk Auth** | ✅ | `src/middleware.ts`, `@clerk/nextjs` |
| **React Flow** | ✅ | `FlowEditor.tsx` uses `@xyflow/react` |
| **Trigger.dev** | ✅ | `src/trigger/` tasks, `trigger.config.ts` |
| **Transloadit** | ✅ | `src/lib/transloadit.ts`, used in ImageNode/VideoNode |
| **FFmpeg** | ✅ | `src/trigger/ffmpeg-tasks.ts` |
| **Tailwind CSS** | ✅ | `tailwind.config.ts`, className usage everywhere |
| **Zustand** | ✅ | `src/store/workflowStore.ts` |
| **Zod** | ⚠️ | Not found in API routes — may need to add |
| **Google Generative AI** | ✅ | `@google/generative-ai` in `workflow-nodes.ts` |
| **Lucide React** | ✅ | Icons throughout all components |

---

## 13. Submission Requirements Checklist

| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 1 | GitHub Repository | 🔲 | Push to GitHub (public or private) |
| 2 | Vercel Deployment | 🔲 | Deploy to Vercel with env vars |
| 3 | Demo Video (3-5 min) | 🔲 | Record walkthrough covering all items below |

### Demo Video Must Cover:
- [ ] User authentication flow (sign in/sign up)
- [ ] Creating a workflow with all 6 node types
- [ ] Uploading files (image, video) via Transloadit
- [ ] Running full workflow + real-time status (pulsating glow)
- [ ] Running a single node and selected nodes
- [ ] Viewing workflow history in right sidebar
- [ ] Clicking a run to see node-level execution details
- [ ] Export/import workflow as JSON

---

## 14. Pulsating Glow Effect

| Node | Has Glow? | Triggered By |
|------|-----------|-------------|
| LLM Node | ✅ | `data.status === "loading"` |
| Crop Image | ✅ | `data.status === "loading"` |
| Extract Frame | ✅ | `data.status === "loading"` |
| Text Node | N/A | (instant, no async processing) |
| Image Node | N/A | (upload is synchronous) |
| Video Node | N/A | (upload is synchronous) |

**CSS**: `animate-pulse` with `border-[#dfff4f] shadow-[0_0_30px_rgba(223,255,79,0.3)]`

---

## ⚠️ Known Gaps to Address

1. **JSON Import** — Only export (Share) is implemented. Consider adding a file upload button in the Header to import `.json` workflow files.
2. **Zod Validation** — Not found in API routes or server actions. Add Zod schemas for workflow save/run payloads if time permits.
3. **Trigger.dev Worker** — Must be running (`npx trigger.dev@latest dev`) for ANY node execution to work. Without it, workflows will get stuck.
4. **Transloadit Template** — Must be manually created at [transloadit.com](https://transloadit.com) with a file upload step. Without it, image/video uploads will fail.
