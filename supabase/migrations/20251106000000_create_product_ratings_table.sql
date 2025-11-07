-- Create product_ratings table
CREATE TABLE IF NOT EXISTS product_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved BOOLEAN DEFAULT FALSE
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_product_ratings_product_id ON product_ratings(product_id);
CREATE INDEX IF NOT EXISTS idx_product_ratings_user_id ON product_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_product_ratings_approved ON product_ratings(approved);

-- Enable Row Level Security
ALTER TABLE product_ratings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view approved ratings
CREATE POLICY "Users can view approved ratings" ON product_ratings
    FOR SELECT USING (approved = true);

-- Policy: Users can insert their own ratings
CREATE POLICY "Users can insert their own ratings" ON product_ratings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own unapproved ratings
CREATE POLICY "Users can update their own unapproved ratings" ON product_ratings
    FOR UPDATE USING (auth.uid() = user_id AND approved = false);

-- Policy: Admins can view all ratings
CREATE POLICY "Admins can view all ratings" ON product_ratings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

-- Policy: Admins can update all ratings (for approval/removal)
CREATE POLICY "Admins can update all ratings" ON product_ratings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

-- Policy: Admins can delete ratings
CREATE POLICY "Admins can delete ratings" ON product_ratings
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );
