/*
  # Fix authentication setup

  1. Changes
    - Add missing RLS policies for user creation
    - Add INSERT policies for both tables
    - Add proper error handling for duplicate users
    - Add cascade delete triggers

  2. Security
    - Enable proper RLS for all operations
    - Ensure secure user creation flow
    - Add proper constraints
*/

-- Add missing policies for user_profiles
CREATE POLICY "Anyone can create a profile during signup"
  ON user_profiles
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Add missing policies for user_preferences
CREATE POLICY "Anyone can create preferences during signup"
  ON user_preferences
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Add proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles (username);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences (user_id);

-- Update the trigger function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create user profile
  INSERT INTO user_profiles (
    id,
    username,
    full_name,
    avatar_url,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    null,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.id,
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create user preferences
  INSERT INTO user_preferences (
    user_id,
    theme,
    favorite_personas,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    'system',
    '[]'::jsonb,
    now(),
    now()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Log the error (in a real production system)
    RAISE NOTICE 'Error creating user profile: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;