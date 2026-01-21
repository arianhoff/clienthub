-- =============================================
-- ClientHub Database Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ORGANIZATIONS TABLE
-- The agency/provider account
-- =============================================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    plan VARCHAR(50) DEFAULT 'freelance' CHECK (plan IN ('freelance', 'business', 'agency')),
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PROFILES TABLE
-- Extended user information (linked to auth.users)
-- =============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'team', 'client')),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    client_id UUID, -- Will reference clients table
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CLIENTS TABLE
-- Companies that hire the organization
-- =============================================
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    logo_url TEXT,
    color VARCHAR(7) DEFAULT '#6366f1', -- Hex color for UI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key for profiles.client_id
ALTER TABLE profiles 
ADD CONSTRAINT fk_profiles_client 
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;

-- =============================================
-- REQUESTS TABLE
-- Service requests from clients
-- =============================================
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    type VARCHAR(100) NOT NULL, -- 'design', 'email', 'social', 'landing', 'video', 'other'
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'review', 'changes_requested', 'approved', 'completed')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date DATE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- COMMENTS TABLE
-- Conversation within a request
-- =============================================
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    is_internal BOOLEAN DEFAULT FALSE, -- Internal notes not visible to client
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ATTACHMENTS TABLE
-- Files attached to requests or comments
-- =============================================
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name VARCHAR(500) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER NOT NULL, -- In bytes
    file_type VARCHAR(100) NOT NULL, -- MIME type
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- At least one of request_id or comment_id must be set
    CONSTRAINT attachment_parent CHECK (request_id IS NOT NULL OR comment_id IS NOT NULL)
);

-- =============================================
-- INDEXES for better performance
-- =============================================
CREATE INDEX idx_profiles_organization ON profiles(organization_id);
CREATE INDEX idx_profiles_client ON profiles(client_id);
CREATE INDEX idx_clients_organization ON clients(organization_id);
CREATE INDEX idx_requests_client ON requests(client_id);
CREATE INDEX idx_requests_organization ON requests(organization_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_assigned ON requests(assigned_to);
CREATE INDEX idx_comments_request ON comments(request_id);
CREATE INDEX idx_attachments_request ON attachments(request_id);
CREATE INDEX idx_attachments_comment ON attachments(comment_id);

-- =============================================
-- UPDATED_AT TRIGGER
-- Automatically update updated_at column
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES - Organizations
-- =============================================
CREATE POLICY "Users can view their own organization"
    ON organizations FOR SELECT
    USING (
        id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can update their organization"
    ON organizations FOR UPDATE
    USING (
        id IN (
            SELECT organization_id FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================
-- RLS POLICIES - Profiles
-- =============================================
CREATE POLICY "Users can view profiles in their organization"
    ON profiles FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
        OR
        client_id IN (
            SELECT id FROM clients WHERE organization_id IN (
                SELECT organization_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid());

-- =============================================
-- RLS POLICIES - Clients
-- =============================================
CREATE POLICY "Organization members can view their clients"
    ON clients FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can create clients"
    ON clients FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'team')
        )
    );

CREATE POLICY "Admins can update clients"
    ON clients FOR UPDATE
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'team')
        )
    );

CREATE POLICY "Admins can delete clients"
    ON clients FOR DELETE
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================
-- RLS POLICIES - Requests
-- =============================================
CREATE POLICY "Organization members can view all requests"
    ON requests FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
        OR
        client_id IN (
            SELECT client_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can create requests"
    ON requests FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
        OR
        client_id IN (
            SELECT client_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Organization members can update requests"
    ON requests FOR UPDATE
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
        OR
        (
            client_id IN (
                SELECT client_id FROM profiles WHERE id = auth.uid()
            )
            AND status IN ('review', 'changes_requested')
        )
    );

-- =============================================
-- RLS POLICIES - Comments
-- =============================================
CREATE POLICY "Users can view non-internal comments on their requests"
    ON comments FOR SELECT
    USING (
        request_id IN (
            SELECT id FROM requests WHERE organization_id IN (
                SELECT organization_id FROM profiles WHERE id = auth.uid()
            )
        )
        OR
        (
            request_id IN (
                SELECT id FROM requests WHERE client_id IN (
                    SELECT client_id FROM profiles WHERE id = auth.uid()
                )
            )
            AND is_internal = FALSE
        )
    );

CREATE POLICY "Users can create comments"
    ON comments FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
    );

-- =============================================
-- RLS POLICIES - Attachments
-- =============================================
CREATE POLICY "Users can view attachments on accessible requests"
    ON attachments FOR SELECT
    USING (
        request_id IN (
            SELECT id FROM requests WHERE organization_id IN (
                SELECT organization_id FROM profiles WHERE id = auth.uid()
            )
        )
        OR
        request_id IN (
            SELECT id FROM requests WHERE client_id IN (
                SELECT client_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can upload attachments"
    ON attachments FOR INSERT
    WITH CHECK (
        uploaded_by = auth.uid()
    );

-- =============================================
-- FUNCTION: Create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- STORAGE BUCKET for attachments
-- Run this separately in Storage section or SQL
-- =============================================
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('attachments', 'attachments', false);
