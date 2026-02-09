-- OpenGuard Database Schema
-- Migration: 00001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE organization_type AS ENUM (
  'nonprofit',
  'community_org',
  'religious',
  'educational',
  'healthcare',
  'advocacy',
  'other'
);

CREATE TYPE interview_status AS ENUM (
  'in_progress',
  'completed',
  'abandoned'
);

CREATE TYPE message_role AS ENUM (
  'user',
  'assistant',
  'system'
);

CREATE TYPE compliance_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'overdue'
);

CREATE TYPE compliance_category AS ENUM (
  'immediate',
  'short_term',
  'long_term',
  'ongoing'
);

-- Organizations table
-- Stores information about each organization using OpenGuard
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type organization_type NOT NULL DEFAULT 'nonprofit',
  profile JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups by user
CREATE INDEX idx_organizations_user_id ON organizations(user_id);

-- Interviews table
-- Stores each interview session
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status interview_status NOT NULL DEFAULT 'in_progress',
  extracted_data JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create index for faster lookups by organization
CREATE INDEX idx_interviews_organization_id ON interviews(organization_id);
CREATE INDEX idx_interviews_status ON interviews(status);

-- Messages table
-- Stores all chat messages for each interview
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  role message_role NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups and ordering
CREATE INDEX idx_messages_interview_id ON messages(interview_id);
CREATE INDEX idx_messages_created_at ON messages(interview_id, created_at);

-- Policies table
-- Stores generated security policies
CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content_markdown TEXT NOT NULL,
  pdf_url TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX idx_policies_interview_id ON policies(interview_id);
CREATE INDEX idx_policies_organization_id ON policies(organization_id);

-- Compliance items table
-- Stores actionable items derived from policies
CREATE TABLE compliance_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  policy_id UUID REFERENCES policies(id) ON DELETE SET NULL,
  category compliance_category NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status compliance_status NOT NULL DEFAULT 'pending',
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX idx_compliance_items_organization_id ON compliance_items(organization_id);
CREATE INDEX idx_compliance_items_policy_id ON compliance_items(policy_id);
CREATE INDEX idx_compliance_items_status ON compliance_items(status);
CREATE INDEX idx_compliance_items_due_date ON compliance_items(due_date);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view their own organizations"
  ON organizations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own organizations"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own organizations"
  ON organizations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own organizations"
  ON organizations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for interviews
CREATE POLICY "Users can view interviews for their organizations"
  ON interviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = interviews.organization_id
      AND organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert interviews for their organizations"
  ON interviews FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = interviews.organization_id
      AND organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update interviews for their organizations"
  ON interviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = interviews.organization_id
      AND organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete interviews for their organizations"
  ON interviews FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = interviews.organization_id
      AND organizations.user_id = auth.uid()
    )
  );

-- RLS Policies for messages
CREATE POLICY "Users can view messages for their interviews"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM interviews
      JOIN organizations ON organizations.id = interviews.organization_id
      WHERE interviews.id = messages.interview_id
      AND organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages for their interviews"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM interviews
      JOIN organizations ON organizations.id = interviews.organization_id
      WHERE interviews.id = messages.interview_id
      AND organizations.user_id = auth.uid()
    )
  );

-- RLS Policies for policies
CREATE POLICY "Users can view policies for their organizations"
  ON policies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = policies.organization_id
      AND organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert policies for their organizations"
  ON policies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = policies.organization_id
      AND organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update policies for their organizations"
  ON policies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = policies.organization_id
      AND organizations.user_id = auth.uid()
    )
  );

-- RLS Policies for compliance_items
CREATE POLICY "Users can view compliance items for their organizations"
  ON compliance_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = compliance_items.organization_id
      AND organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert compliance items for their organizations"
  ON compliance_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = compliance_items.organization_id
      AND organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update compliance items for their organizations"
  ON compliance_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = compliance_items.organization_id
      AND organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete compliance items for their organizations"
  ON compliance_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = compliance_items.organization_id
      AND organizations.user_id = auth.uid()
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for organizations updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for policy PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('policies', 'policies', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the policies bucket
CREATE POLICY "Users can upload policy PDFs for their organizations"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'policies' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can view their policy PDFs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'policies' AND
    auth.uid() IS NOT NULL
  );
