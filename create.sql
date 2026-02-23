CREATE TABLE IF NOT EXISTS workflows (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE workflows 
ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC',
ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC';


-- Add user_id column to workflows table
ALTER TABLE workflows 
ADD COLUMN user_id VARCHAR(255);

-- Create index for faster queries
CREATE INDEX idx_workflows_user_id ON workflows(user_id);

-- Optional: Add constraint to ensure user_id is not null for new records
-- (You can run this after migrating existing data)
-- ALTER TABLE workflows ALTER COLUMN user_id SET NOT NULL;