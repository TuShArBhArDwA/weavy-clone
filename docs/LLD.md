# Low-Level Design (LLD)

## 1. Database Schema

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,  -- Clerk user ID
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Workflows Table
```sql
CREATE TABLE workflows (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  data JSONB NOT NULL,           -- React Flow nodes & edges
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Workflow Runs Table
```sql
CREATE TABLE workflow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id INTEGER REFERENCES workflows(id) ON DELETE CASCADE,
  trigger_type VARCHAR(50) DEFAULT 'MANUAL',
  status VARCHAR(50) NOT NULL,   -- PENDING, RUNNING, COMPLETED, FAILED
  started_at TIMESTAMP DEFAULT NOW(),
  finished_at TIMESTAMP
);
```

### Node Executions Table
```sql
CREATE TABLE node_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES workflow_runs(id) ON DELETE CASCADE,
  node_id VARCHAR(255) NOT NULL,
  node_type VARCHAR(255) NOT NULL,
  node_label VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  input_data JSONB,
  output_data JSONB,
  error TEXT,
  started_at TIMESTAMP DEFAULT NOW(),
  finished_at TIMESTAMP,
  duration INTEGER               -- milliseconds
);
```

## 2. Node Types

### Text Node
```typescript
interface TextNodeData {
  label: string;
  text: string;
  status: 'idle' | 'success';
}
// Output Handle: "output" (text string)
```

### Image Node
```typescript
interface ImageNodeData {
  label: string;
  file?: { url: string; name: string; type: string };
  image?: string;  // Demo image URL
  status: 'idle' | 'loading' | 'success' | 'error';
  errorMessage?: string;
}
// Output Handle: "output" (image URL/base64)
```

### LLM Node
```typescript
interface LLMNodeData {
  label: string;
  model: string;         // e.g., "gemini-1.5-flash"
  systemPrompt?: string;
  userMessage?: string;
  response?: string;
  status: 'idle' | 'loading' | 'success' | 'error';
}
// Input Handles: "system_prompt", "user_message", "images"
// Output Handle: "output" (LLM response text)
```

### Crop Image Node
```typescript
interface CropNodeData {
  label: string;
  x_percent: number;      // 0-100
  y_percent: number;      // 0-100
  width_percent: number;  // 0-100
  height_percent: number; // 0-100
  status: 'idle' | 'loading' | 'success' | 'error';
}
// Input Handle: "image_url"
// Output Handle: "output" (cropped image URL)
```

### Extract Frame Node
```typescript
interface ExtractFrameNodeData {
  label: string;
  timestamp: string | number;  // seconds (e.g., 5.5) or percentage (e.g., "50%")
  status: 'idle' | 'loading' | 'success' | 'error';
}
// Input Handle: "video_url"
// Input Handle: "video_url"
// Output Handle: "output" (extracted frame URL)

### Video Upload Node
```typescript
interface VideoNodeData {
  label: string;
  file?: { url: string; name: string; type: string };
  status: 'idle' | 'uploading' | 'success' | 'error';
}
// Output Handle: "video_url"
```
```

## 3. Trigger.dev Tasks

### LLM Execution Task
```typescript
export const llmTask = task({
  id: "llm-execution",
  run: async (payload: {
    model: string;
    systemPrompt?: string;
    userMessage: string;
    images?: string[];
  }) => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: payload.model });
    
    const parts = [];
    if (payload.systemPrompt) parts.push({ text: payload.systemPrompt });
    parts.push({ text: payload.userMessage });
    
    if (payload.images) {
      for (const img of payload.images) {
        parts.push({ inlineData: { mimeType: "image/jpeg", data: img } });
      }
    }
    
    const result = await model.generateContent(parts);
    return { response: result.response.text() };
  }
});
```

### Workflow Orchestrator
```typescript
export const orchestratorTask = task({
  id: "workflow-orchestrator",
  run: async (payload: { workflowId: number; runId: string }) => {
    // 1. Load workflow from database
    // 2. Build dependency graph from edges
    // 3. Execute nodes in topological order
    // 4. Trigger parallel tasks for independent nodes
    // 5. Collect results and update database
    // 6. FAILURE HANDLING: If any node fails, stop workflow immediately. Do not retry.
  }
});
```

## 4. State Management (Zustand)

```typescript
interface WorkflowStore {
  // State
  nodes: Node[];
  edges: Edge[];
  selectedNodes: string[];
  
  // Actions
  addNode: (type: string, position: XYPosition) => void;
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
  deleteNode: (nodeId: string) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  
  // Execution
  runWorkflow: () => Promise<void>;
  runSelectedNodes: () => Promise<void>;
}
```

## 5. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workflows` | List user's workflows |
| POST | `/api/workflows` | Create new workflow |
| GET | `/api/workflows/[id]` | Get workflow by ID |
| PUT | `/api/workflows/[id]` | Update workflow |
| DELETE | `/api/workflows/[id]` | Delete workflow |
| POST | `/api/workflows/[id]/run` | Execute workflow |
| GET | `/api/workflows/[id]/runs` | Get execution history |
| POST | `/actions/executeNode` | Single Node Execution (Server Action) |

## 6. Execution Flow

```
User clicks "Run" 
    │
    ▼
┌─────────────────────────┐
│ Create WorkflowRun      │
│ Status: PENDING         │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Trigger Orchestrator    │
│ (Background Task)       │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Build DAG from Edges    │
│ Find Executable Nodes   │
└───────────┬─────────────┘
            │
    ┌───────┴───────┐
    ▼               ▼
┌─────────┐   ┌─────────┐
│ Node A  │   │ Node B  │  (Parallel)
└────┬────┘   └────┬────┘
     │             │
     └──────┬──────┘
            ▼
┌─────────────────────────┐
│ Convergence Node        │
│ (Waits for A & B)       │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Update WorkflowRun      │
│ Status: COMPLETED       │
└─────────────────────────┘
```
