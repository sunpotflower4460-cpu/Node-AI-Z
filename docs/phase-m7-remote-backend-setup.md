# Phase M7 - Remote Backend Setup

This document describes how to set up the remote backend for Node-AI-Z Phase M7.

## Environment Configuration

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase Configuration (optional - enables remote persistence)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

If these variables are not set, the system will default to **local-only** persistence mode.

## Supabase Database Schema

To enable remote persistence, create the following tables in your Supabase project:

### 1. Brain States Table

```sql
CREATE TABLE brain_states (
  "sessionId" text PRIMARY KEY,
  "updatedAt" bigint NOT NULL,
  "brainState" jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Index for faster queries
CREATE INDEX idx_brain_states_updated_at ON brain_states("updatedAt");
```

### 2. Snapshots Table

```sql
CREATE TABLE snapshots (
  "snapshotId" text PRIMARY KEY,
  "sessionId" text NOT NULL,
  "createdAt" bigint NOT NULL,
  metadata jsonb NOT NULL,
  "brainState" jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Indexes for faster queries
CREATE INDEX idx_snapshots_session_id ON snapshots("sessionId");
CREATE INDEX idx_snapshots_created_at ON snapshots("createdAt");
```

### 3. Journal Events Table

```sql
CREATE TABLE journal_events (
  id text PRIMARY KEY,
  "sessionId" text NOT NULL,
  type text NOT NULL,
  "createdAt" bigint NOT NULL,
  "turnCount" integer NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Indexes for faster queries
CREATE INDEX idx_journal_session_id ON journal_events("sessionId");
CREATE INDEX idx_journal_created_at ON journal_events("createdAt");
CREATE INDEX idx_journal_type ON journal_events(type);
```

## Row Level Security (RLS)

For production use, enable Row Level Security:

```sql
-- Enable RLS
ALTER TABLE brain_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_events ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for Phase M7 (adjust for your security needs)
CREATE POLICY "Allow anonymous access to brain_states"
  ON brain_states FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous access to snapshots"
  ON snapshots FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous access to journal_events"
  ON journal_events FOR ALL
  USING (true)
  WITH CHECK (true);
```

**Note**: The above policies allow anonymous access. For production, implement proper authentication and user-specific policies.

## Persistence Modes

The system supports three persistence modes:

1. **local**: Brain state saved only to browser localStorage
2. **remote**: Brain state saved only to Supabase (requires configuration)
3. **hybrid**: Brain state saved to both local and remote (recommended)

The mode is automatically determined based on environment configuration:
- If Supabase is configured: defaults to **hybrid** mode
- If Supabase is not configured: defaults to **local** mode

You can override the mode in the browser console:
```javascript
localStorage.setItem('nodeaiz:crystal:persistence-env', JSON.stringify({ mode: 'hybrid' }))
```

## Testing Remote Connection

To verify your Supabase connection is working:

1. Start the application in development mode:
   ```bash
   npm run dev
   ```

2. Open the browser console and check for Supabase connection logs

3. Create a crystallized thinking session and make a few turns

4. Check your Supabase dashboard to see if data is being saved to the tables

## Troubleshooting

### Connection Issues

If remote persistence fails:
1. Check that environment variables are correctly set
2. Verify Supabase URL and anon key are valid
3. Check browser console for error messages
4. Ensure database tables are created with correct schema

### Data Not Syncing

If data isn't syncing to remote:
1. Check the `nodeaiz:crystal:save-status` localStorage key for error details
2. Verify Row Level Security policies allow writes
3. Check network tab for failed requests
4. Enable debug mode: `localStorage.setItem('nodeaiz:crystal:persistence-env', JSON.stringify({ debug: true }))`

## Phase M7 Features

With remote persistence enabled, Node-AI-Z gains:

- **Cross-device sync**: Continue sessions on different devices
- **Post-deletion recovery**: Restore brain states even after clearing local storage
- **Snapshot history**: Access historical snapshots stored remotely
- **Journal replay**: Reconstruct state from journal events
- **Hybrid resilience**: Continue working even if remote is unavailable

## Security Considerations

For production deployment:

1. Implement proper authentication (Supabase Auth)
2. Add user-specific RLS policies
3. Encrypt sensitive brain state data
4. Set up backup and retention policies
5. Monitor storage usage and costs
6. Implement rate limiting on writes
