# High-Level Design (HLD)

## System Overview

Weave is a visual workflow builder that enables users to create AI-powered automation pipelines through a drag-and-drop interface. The system processes workflows by executing nodes in dependency order, with support for parallel execution of independent branches.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                          │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │   React Flow │  │   Zustand    │  │      Clerk Auth          │   │
│  │   Canvas     │  │   Store      │  │      Components          │   │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         NEXT.JS SERVER                              │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │  API Routes  │  │  Server      │  │     Clerk Middleware     │   │
│  │  /api/*      │  │  Actions     │  │     (Protected Routes)   │   │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
┌──────────────────────────┐  ┌──────────────────────────────────────┐
│      TRIGGER.DEV         │  │           POSTGRESQL                 │
│   Background Workers     │  │         (via Prisma)                 │
├──────────────────────────┤  ├──────────────────────────────────────┤
│  • LLM Execution Task    │  │  • Users                             │
│  • Image Crop Task       │  │  • Workflows                         │
│  • Frame Extract Task    │  │  • WorkflowRuns                      │
│  • Orchestrator          │  │  • NodeExecutions                    │
└──────────────────────────┘  └──────────────────────────────────────┘
          │
          ▼
┌──────────────────────────┐
│     EXTERNAL APIS        │
├──────────────────────────┤
│  • Google Gemini API     │   │     TRANSLOADIT          │
│  • FFmpeg (via Trigger)  │   │(Media Uploads/Processing)│
└──────────────────────────┘   └──────────────────────────┘
```

## Core Components

### 1. Frontend Layer
- **React Flow Canvas**: Visual workflow editor with node management
- **Zustand Store**: Centralized state for nodes, edges, and execution status
- **Clerk Components**: Authentication UI (sign-in, sign-up, user button)
- **Transloadit Integration**: Client-side media uploads

### 2. Backend Layer
- **Next.js API Routes**: RESTful endpoints for workflow CRUD operations
- **Server Actions**: Direct database operations for real-time updates
- **Clerk Middleware**: Route protection and user session management

### 3. Execution Layer
- **Trigger.dev Orchestrator**: Manages workflow execution order
- **Task Workers**: Individual tasks for LLM calls, image processing
- **Parallel Execution**: Independent branches execute concurrently
- **Failure Handling**: Strict propagation stops execution on any error

### 4. Data Layer
- **PostgreSQL**: Persistent storage for all application data
- **Prisma ORM**: Type-safe database queries and schema management

## Data Flow

1. **User Authentication**: Clerk handles sign-in → Session created → User synced to DB
2. **Workflow Creation**: User drags nodes → Canvas updates → Zustand state changes
3. **Workflow Execution**: 
   - User triggers run → API creates WorkflowRun record
   - Orchestrator analyzes DAG → Identifies executable nodes
   - Tasks execute in parallel where possible
   - Results stored in NodeExecution records
4. **History Display**: WorkflowRuns fetched → Displayed in right sidebar

## Security Considerations

- All API routes protected by Clerk middleware
- Environment variables for sensitive keys
- Database credentials never exposed to client
- User-scoped data access (users only see their workflows)
