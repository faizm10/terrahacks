-- Create user_profiles table for storing user medical profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    age INTEGER CHECK (age > 0 AND age <= 150),
    gender VARCHAR(50),
    date_of_birth DATE,
    medical_history JSONB NOT NULL DEFAULT '{
        "conditions": [],
        "allergies": [],
        "medications": [],
        "family_history": [],
        "surgeries": [],
        "notes": ""
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Create index on created_at for listing profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on row updates
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) - optional for demo
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for demonstration
-- In production, you would want more restrictive policies
-- CREATE POLICY "Allow all operations on user_profiles" ON user_profiles
--     FOR ALL USING (true) WITH CHECK (true);

-- Grant necessary permissions
-- Make sure the service role can access the table
GRANT ALL ON user_profiles TO service_role;
GRANT ALL ON user_profiles TO postgres;

-- Grant usage on the sequence for the id column
GRANT USAGE, SELECT ON SEQUENCE user_profiles_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE user_profiles_id_seq TO postgres;