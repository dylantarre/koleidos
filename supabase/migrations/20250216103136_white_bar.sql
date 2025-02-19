/*
  # Fix user profile creation

  1. Changes
    - Add ON CONFLICT clause to user_profiles insert to handle duplicate entries
    - Add ON CONFLICT clause to user_preferences insert to handle duplicate entries
    - Update trigger function to handle errors gracefully
    - Add missing INSERT policy for user_preferences

  2. Security
    - Add INSERT policy for user_preferences table
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create updated function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create user profile with conflict handling
  INSERT INTO user_profiles (id, username, avatar_url)
  VALUES (
    new.id,
    new.email,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.id
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Create default preferences with conflict handling
  INSERT INTO user_preferences (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Add missing INSERT policy for user_preferences
CREATE POLICY "Users can insert own preferences"
  ON user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);