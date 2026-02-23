-- 1. Create Users Table
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- 2. Create Workflows Table
CREATE TABLE "workflows" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "data" JSONB NOT NULL,
    "user_id" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflows_pkey" PRIMARY KEY ("id")
);

-- 3. Create Workflow Runs Table
CREATE TABLE "workflow_runs" (
    "id" TEXT NOT NULL,
    "workflow_id" INTEGER NOT NULL,
    "triggerType" TEXT NOT NULL DEFAULT 'MANUAL',
    "status" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "workflow_runs_pkey" PRIMARY KEY ("id")
);

-- 4. Create Node Executions Table
CREATE TABLE "node_executions" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "nodeType" TEXT NOT NULL,
    "nodeLabel" TEXT,
    "status" TEXT NOT NULL,
    "input_data" JSONB,
    "output_data" JSONB,
    "error" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),
    "duration" INTEGER,

    CONSTRAINT "node_executions_pkey" PRIMARY KEY ("id")
);

-- 5. Create Indexes
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "workflows_user_id_idx" ON "workflows"("user_id");
CREATE INDEX "node_executions_run_id_idx" ON "node_executions"("run_id");

-- 6. Add Foreign Keys
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "workflow_runs" ADD CONSTRAINT "workflow_runs_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "node_executions" ADD CONSTRAINT "node_executions_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "workflow_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
