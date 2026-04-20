-- Configuration script for GenBI Analytics Database
-- Run this script in the SQL Editor of your Supabase project

-- 1. Create the transactions table
CREATE TABLE IF NOT EXISTS fact_transactions (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_id TEXT,
    source_platform TEXT DEFAULT 'Portfolio Demo',
    business_unit TEXT,
    customer_email TEXT,
    first_name TEXT,
    last_name TEXT,
    total_amount DECIMAL(12,2),
    currency TEXT DEFAULT 'EUR',
    status TEXT,
    payment_method TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    items_summary TEXT,
    gravity_forms_data JSONB DEFAULT '{}'::jsonb,
    raw_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE fact_transactions ENABLE ROW LEVEL SECURITY;

-- 3. Create a public read policy for demonstration (ideal for portfolio demo)
-- Note: In production, you would restrict this.
CREATE POLICY "Allow public read for demonstration" 
ON fact_transactions FOR SELECT 
USING (true);

-- 4. Insert mock data for the portfolio
INSERT INTO fact_transactions 
(original_id, business_unit, customer_email, first_name, last_name, total_amount, status, payment_method, items_summary, created_at)
VALUES 
('ORD-001', 'Tech Conference 2024', 'john.doe@email.com', 'John', 'Doe', 150.00, 'Completed', 'Credit Card', 'VIP Ticket + React Workshop', NOW() - INTERVAL '2 days'),
('ORD-002', 'Tech Conference 2024', 'jane.smith@email.com', 'Jane', 'Smith', 75.00, 'Completed', 'PayPal', 'Standard Ticket', NOW() - INTERVAL '3 days'),
('ORD-003', 'Generative AI Workshop', 'carla.oliveira@email.com', 'Carla', 'Oliveira', 200.00, 'Pending', 'Bank Transfer', 'Intensive LLM Course', NOW() - INTERVAL '1 day'),
('ORD-004', 'Product Management Camp', 'david.souza@email.com', 'David', 'Souza', 350.00, 'Completed', 'Credit Card', 'Full Pass Package (Hotel Included)', NOW() - INTERVAL '5 days'),
('ORD-005', 'Generative AI Workshop', 'elena.costa@email.com', 'Elena', 'Costa', 200.00, 'Completed', 'Credit Card', 'Intensive LLM Course', NOW() - INTERVAL '12 hours'),
('ORD-006', 'Tech Conference 2024', 'frank.lima@email.com', 'Frank', 'Lima', 75.00, 'Cancelled', 'PayPal', 'Standard Ticket', NOW() - INTERVAL '4 days'),
('ORD-007', 'Product Management Camp', 'giselle.almeida@email.com', 'Giselle', 'Almeida', 120.00, 'Completed', 'Credit Card', 'Metrics Workshop (Saturday)', NOW() - INTERVAL '6 days'),
('ORD-008', 'Web Design Summit', 'hugo.ferreira@email.com', 'Hugo', 'Ferreira', 90.00, 'Completed', 'Stripe', 'Online Access Early Bird', NOW() - INTERVAL '8 days'),
('ORD-009', 'Tech Conference 2024', 'igor.mendes@email.com', 'Igor', 'Mendes', 150.00, 'Completed', 'Credit Card', 'VIP Ticket', NOW() - INTERVAL '10 days'),
('ORD-010', 'Generative AI Workshop', 'julia.rocha@email.com', 'Julia', 'Rocha', 200.00, 'Completed', 'PayPal', 'Intensive LLM Course', NOW() - INTERVAL '2 hours');
