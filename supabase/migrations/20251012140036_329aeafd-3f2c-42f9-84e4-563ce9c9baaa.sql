-- Add constraint to limit favorites array size to prevent DoS
ALTER TABLE profiles ADD CONSTRAINT favorites_max_length 
  CHECK (array_length(favorites, 1) <= 100 OR favorites IS NULL OR array_length(favorites, 1) IS NULL);