# Weaave.ai Clone — Full Assignment Requirements

> **Reference file** — All 13 pages of the assignment consolidated here.

---

## 1. Project Overview

Develop a pixel-perfect UI/UX clone of [Weaave.ai](https://weaave.ai) workflow builder, focused exclusively on LLM workflows. Must use:
- **React Flow** for visual workflow canvas
- **Google Gemini API** for LLM execution via **Trigger.dev**
- Type-safe APIs, proper state management, authentication, seamless UX

---

## 2. Core Workflow Interface (UI/UX)

| Requirement | Description |
|---|---|
| **Pixel-Perfect UI** | Match Weaave's UI exactly — background, layout, spacing, fonts, node designs, animations, scrolling |
| **Left Sidebar** | Collapsible sidebar with search and quick access section for node types |
| **Right Sidebar** | Workflow History Panel — shows list of all workflow runs with timestamps |
| **Workflow Canvas** | React Flow with dot grid background, smooth panning/zooming, and MiniMap |
| **Responsive Design** | Full responsiveness with proper overflow handling |
| **Running Node Effect** | Nodes currently executing must have a pulsating glow effect |

---

## 3. Node Types (Sidebar Buttons)

The left sidebar must contain exactly **6 buttons** under Quick Access:

### 3.1 Text Node
- Simple text input with textarea
- Output handle for text data

### 3.2 Upload Image Node
- File upload via **Transloadit**
- Accepts: jpg, jpeg, png, webp, gif
- Image preview after upload
- Output handle for image URL

### 3.3 Upload Video Node
- File upload via **Transloadit**
- Accepts: mp4, mov, webm, m4v
- Video player preview after upload
- Output handle for video URL

### 3.4 Run Any LLM Node
- Model selector dropdown
- Accepts system prompt, user message, and images (supports multiple) as inputs
- Executes via **Trigger.dev task**
- **Input Handles (3):**
  1. `system_prompt` — Accepts connection from Text Node (optional)
  2. `user_message` — Accepts connection from Text Node (required)
  3. `images` — Accepts connections from Image Node(s) (optional, supports multiple)
- **Output Handle (1):** `output` — Text response from LLM
- **Result Display:** Results must be displayed **directly on the LLM node itself** — do NOT create a separate output node. The LLM node should expand or show the response inline after execution.

### 3.5 Crop Image Node
- Accepts image input
- Configurable crop parameters (x%, y%, width%, height%)
- Executes via **FFmpeg on Trigger.dev**
- **Input Handles (5):** `image_url`, `x_percent`, `y_percent`, `width_percent`, `height_percent`
- **Output Handle (1):** `output` — Cropped image URL (uploaded via Transloadit)

### 3.6 Extract Frame from Video Node
- Accepts video URL input
- Configurable timestamp parameter (seconds or percentage)
- Executes via **FFmpeg on Trigger.dev**
- **Input Handles (2):** `video_url`, `timestamp` (optional, accepts text/number or "50%" for percentage, default: 0)
- **Output Handle (1):** `output` — Extracted frame image URL (jpg/png)

---

## 4. Authentication (Clerk)

| Requirement | Description |
|---|---|
| Auth Provider | Clerk for all authentication |
| Sign In/Sign Up | Clerk-hosted UI or embedded components |
| Protected Routes | All workflow routes require authentication |
| User Association | Workflows and history must be scoped to authenticated user |

---

## 5. LLM Integration (Google Gemini API via Trigger.dev)

| Requirement | Description |
|---|---|
| API Provider | Google Generative AI (Gemini) — Free tier via Google AI Studio |
| Execution | **All LLM calls MUST run as Trigger.dev tasks** |
| Supported Models | See https://ai.google.dev/gemini-api/docs/models |
| Vision Support | Accept images for multimodal prompts |
| System Prompts | Support optional system instructions per request |
| Input Chaining | Aggregate text/image inputs from connected nodes into the prompt |
| Error Handling | Graceful error display with user-friendly messages |
| Loading States | Visual feedback during API calls (spinner, disabled button) |

---

## 6. Workflow History (Right Sidebar)

| Requirement | Description |
|---|---|
| History Panel | Right sidebar showing list of all workflow runs |
| Execution Scope | History tracks all execution types: full workflow runs, single node runs, and selected node group runs |
| Run Entry | Each entry shows: timestamp, status (success/failed/partial), duration, and scope (full/partial/single) |
| Click to Expand | Clicking a run shows **node-level execution details** |
| Node-Level History | For each node: status, inputs used, outputs generated, execution time |
| Partial Runs | Show which nodes ran successfully even if workflow failed |
| Visual Indicators | Color-coded status badges (green=success, red=failed, yellow=running) |
| Persistence | All history must persist to PostgreSQL database |

### Node-Level History View Example

When clicking on a workflow run, display:
```
Run #123 - Jan 14, 2026 3:45 PM (Full Workflow)

├── Text Node (node-1) ✅ 0.1s
│   └── Output: "Generate a product description..."
│
├── Image Node (node-2) ✅ 2.3s
│   └── Output: https://cdn.transloadit.com/...
│
├── Crop Image (node-3) ✅ 1.8s
│   └── Output: https://cdn.transloadit.com/...
│
├── LLM Node (node-4) ✅ 4.2s
│   └── Output: "Introducing our premium..."
│
└── Extract Frame (node-5) ❌ Failed
    └── Error: "Invalid timestamp parameter"
```

---

## 7. Workflow Features

| Feature | Description |
|---|---|
| Drag & Drop Nodes | Add nodes from sidebar to canvas via click or drag |
| Node Connections | Connect output handles to input handles with animated edges |
| Configurable Inputs | All node parameters must be configurable via input handles OR manual entry |
| Connected Input State | When an input handle has a connection, disable the corresponding manual input field (greyed out) — value comes from connected node |
| Type-Safe Connections | Enforce type-safe connections: image nodes cannot connect to prompt/system prompt inputs, text outputs cannot connect to file inputs — invalid connections must be visually disallowed |
| DAG Validation | Workflows must be DAG (Directed Acyclic Graph); circular loops/cycles should not be allowed |
| Node Deletion | Delete nodes via menu button or keyboard (Delete/Backspace) |
| Canvas Navigation | Pan (drag background), zoom (scroll wheel), fit view |
| MiniMap | Bottom-right corner navigation minimap |
| Undo/Redo | Implement undo/redo for node operations |
| Selective Execution | Allow users to run a single node, select multiple nodes, or run the entire workflow — each creates a history entry |
| Parallel Execution | Independent branches in the workflow DAG must execute concurrently — nodes only wait for their direct dependencies, not unrelated nodes |
| Workflow Persistence | Save/load workflows to PostgreSQL database |
| Export/Import | Workflow export/import as JSON |

---

## 8. Required Sample Workflow: "Product Marketing Kit Generator"

This workflow demonstrates all 6 node types with **parallel execution** and a **convergence point**. Two independent branches run simultaneously, then merge at a final node.

### Branch A: Image Processing + Product Description
**Nodes:** Upload Image, Crop Image, Text (×2), LLM Node #1

1. **Upload Image Node** — User uploads a product photo (jpg/png/webp)
2. **Crop Image Node** — Receives uploaded image, crops to focus on product (e.g., center crop at 80% width/height)
3. **Text Node #1 (System Prompt)** — Contains: *"You are a professional marketing copywriter. Generate a compelling one-paragraph product description."*
4. **Text Node #2 (Product Details)** — Contains: *"Product: Wireless Bluetooth Headphones. Features: Noise cancellation, 30-hour battery, foldable design."*
5. **LLM Node #1** — Receives:
   - `system_prompt` ← Text Node #1
   - `user_message` ← Text Node #2
   - `images` ← Crop Image Node (cropped photo)
   - Outputs: AI-generated product description

### Branch B: Video Frame Extraction
**Nodes:** Upload Video, Extract Frame

1. **Upload Video Node** — User uploads a product demo video (mp4/mov/webm)
2. **Extract Frame from Video Node** — Receives:
   - `video_url` ← Upload Video Node
   - `timestamp` ← "50%" (extracts frame from middle of video)
   - Outputs: Extracted frame image URL

### Convergence Point: Final Marketing Summary
**Node:** LLM Node #2 (waits for BOTH branches)

- `system_prompt` ← Text Node #3: *"You are a social media manager. Create a tweet-length marketing post based on the product image and video frame."*
- `user_message` ← **LLM Node #1 output** (product description from Branch A)
- `images` ← Cropped product image (Branch A) + Extracted video frame (Branch B)
- Output: Final marketing tweet/post displayed inline on the node

### Execution Timeline

| Phase | Branch A | Branch B | Convergence |
|---|---|---|---|
| Phase 1 | Upload Image + Text Nodes | Upload Video | — |
| Phase 2 | Crop Image Node | Extract Frame Node | — |
| Phase 3 | LLM Node #1 (waits for crop + texts) | *(complete)* | — |
| Phase 4 | *(complete)* | *(complete)* | LLM Node #2 (waits for both) |

---

## 9. Technical Specifications

### Project Stack (Required)

| Technology | Purpose |
|---|---|
| Next.js+ | React framework with App Router |
| TypeScript | Type safety throughout the codebase |
| PostgreSQL | Database (Supabase, Neon, or similar) |
| Prisma | ORM for database access |
| Clerk | Authentication |
| React Flow | Visual workflow/node graph library |
| Trigger.dev | ALL node execution MUST use Trigger.dev |
| Transloadit | File uploads and media processing |
| FFmpeg | Image/video processing (via Trigger.dev) |
| Tailwind CSS | Styling (match Weaave's theme exactly) |
| Zustand | State management |
| Zod | Schema validation |
| Google Generative AI | `@google/generative-ai` package |
| Lucide React | Icon library |

### Trigger.dev Requirements

**Every node execution MUST be a Trigger.dev task.** This is non-negotiable.

| Node Type | Trigger.dev Task |
|---|---|
| LLM Node | Task that calls Gemini API |
| Crop Image | Task that runs FFmpeg crop operation |
| Extract Frame | Task that runs FFmpeg frame extraction |

### Parallel Task Execution
- Independent nodes (no dependencies between them) must be triggered concurrently
- Tasks should only await completion of their direct upstream dependencies
- Example: If Node A and Node B have no connection, trigger both tasks simultaneously rather than sequentially

---

## 10. Submission Requirements

1. **GitHub Repository** — Public or private with access granted
2. **Vercel Deployment** — Live demo URL
3. **Demo Video** — 3-5 minute walkthrough covering:
   - User authentication flow
   - Creating a workflow with all 6 node types
   - Uploading files (image, video) via Transloadit
   - Running the full workflow and viewing real-time status (pulsating glow on running nodes)
   - Running a single node and running selected nodes
   - Viewing workflow history in right sidebar (showing all run types)
   - Clicking a run to see node-level execution details
   - Export/import workflow as JSON

---

## 11. Deliverables Checklist

- [ ] Pixel-perfect Weaave clone UI (exact spacing/colors)
- [ ] **Clerk authentication** with protected routes
- [ ] Left sidebar with **6 buttons** (Text, Upload Image, Upload Video, LLM, Crop Image, Extract Frame)
- [ ] **Right sidebar** with workflow history panel
- [ ] **Node-level execution history** when clicking a run
- [ ] React Flow canvas with dot grid background
- [ ] Functional Text Node with textarea and output handle
- [ ] Functional **Upload Image Node** with Transloadit upload and image preview
- [ ] Functional **Upload Video Node** with Transloadit upload and video player preview
- [ ] Functional LLM Node with model selector, prompts, and run capability
- [ ] Functional **Crop Image Node** (FFmpeg via Trigger.dev)
- [ ] Functional **Extract Frame from Video Node** (FFmpeg via Trigger.dev)
- [ ] **All node executions via Trigger.dev tasks**
- [ ] **Pulsating glow effect** on nodes during execution
- [ ] Pre-built sample workflow (demonstrates all features)
- [ ] Node connections with animated purple edges
- [ ] API routes with Zod validation
- [ ] Google Gemini integration with vision support
- [ ] TypeScript throughout with strict mode
- [ ] **PostgreSQL database** with Prisma ORM
- [ ] Workflow save/load to database
- [ ] Workflow history persistence to database
- [ ] Workflow export/import as JSON
- [ ] Deployed on Vercel with environment variables

---

## 12. Getting API Keys

1. **Google AI**: Go to [Google AI Studio](https://aistudio.google.com)
2. **Clerk**: Sign up at [clerk.com](https://clerk.com)
3. **Trigger.dev**: Sign up at [trigger.dev](https://trigger.dev)
4. **Transloadit**: Sign up at [transloadit.com](https://transloadit.com)
5. **PostgreSQL**: Use [Supabase](https://supabase.com) or [Neon](https://neon.tech)
