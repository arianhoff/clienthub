-- =============================================
-- Migration: Add trial and subscription columns
-- Run this in your Supabase SQL Editor
-- =============================================

-- Add new columns to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'trial' 
  CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled'));

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;

-- Update existing organizations to have trial status
UPDATE organizations 
SET 
  subscription_status = 'trial',
  trial_ends_at = NOW() + INTERVAL '14 days'
WHERE subscription_status IS NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_organizations_subscription ON organizations(subscription_status);
CREATE INDEX IF NOT EXISTS idx_organizations_trial_ends ON organizations(trial_ends_at);
