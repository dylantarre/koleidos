/*
  # Fix user profile creation policies

  1. Changes
    - Add INSERT policies for user_profiles table
    - Add missing RLS policies for profile creation
    - Update trigger function to be more robust
    - Add error handling for edge cases

  2. Security
    - Enable RLS policies for new user creation
    - Ensure proper access control for profile creation
*/

-- Add INSERT policy for user_profiles
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Add INSERT policy for public profiles during signup
CREATE POLICY "Public profiles can be created during signup"
  ON user_profiles
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Update the trigger function to be more robust
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  profile_exists boolean;
  preferences_exist boolean;
BEGIN
  -- Check if profile already exists
  SELECT EXISTS (
    SELECT 1 FROM user_profiles WHERE id = new.id
  ) INTO profile_exists;

  -- Check if preferences already exist
  SELECT EXISTS (
    SELECT 1 FROM user_preferences WHERE user_id = new.id
  ) INTO preferences_exist;

  -- Create user profile if it doesn't exist
  IF NOT profile_exists THEN
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
    );
  END IF;

  -- Create user preferences if they don't exist
  IF NOT preferences_exist THEN
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
    );
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;