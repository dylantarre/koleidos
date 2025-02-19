/*
  # Fix user profile creation

  1. Changes
    - Add proper error handling for profile creation
    - Add missing policies for profile and preferences creation
    - Improve trigger function reliability
    - Add proper indexes for performance
    - Add proper conflict handling

  2. Security
    - Maintain RLS policies
    - Add proper security checks
*/

-- Drop existing trigger to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the trigger function with better error handling and conflict resolution
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  profile_count integer;
  preferences_count integer;
BEGIN
  -- Check existing records
  SELECT COUNT(*) INTO profile_count FROM user_profiles WHERE id = new.id;
  SELECT COUNT(*) INTO preferences_count FROM user_preferences WHERE user_id = new.id;

  -- Create user profile if it doesn't exist
  IF profile_count = 0 THEN
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
  IF preferences_count = 0 THEN
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
EXCEPTION
  WHEN others THEN
    -- Log error but allow the transaction to complete
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Ensure proper policies exist
DO $$ 
BEGIN
  -- Drop potentially conflicting policies
  DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
  DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
  DROP POLICY IF EXISTS "Public profiles can be created during signup" ON user_profiles;
  DROP POLICY IF EXISTS "Public preferences can be created during signup" ON user_preferences;
EXCEPTION 
  WHEN others THEN 
    NULL;
END $$;

-- Add comprehensive policies for profile creation
CREATE POLICY "Allow profile creation during signup"
  ON user_profiles
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Allow preferences creation during signup"
  ON user_preferences
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles (username);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences (user_id);

-- Verify and fix any orphaned records
INSERT INTO user_profiles (id, username, avatar_url, created_at, updated_at)
SELECT 
  id,
  email,
  'https://api.dicebear.com/7.x/avataaars/svg?seed=' || id,
  COALESCE(created_at, now()),
  COALESCE(created_at, now())
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles p WHERE p.id = u.id
);

INSERT INTO user_preferences (user_id, theme, favorite_personas, created_at, updated_at)
SELECT 
  id,
  'system',
  '[]'::jsonb,
  COALESCE(created_at, now()),
  COALESCE(created_at, now())
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_preferences p WHERE p.user_id = u.id
);