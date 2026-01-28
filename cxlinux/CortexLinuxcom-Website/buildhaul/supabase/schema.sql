-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create enum types
CREATE TYPE user_role AS ENUM ('poster', 'driver', 'admin');
CREATE TYPE business_type AS ENUM ('general_contractor', 'material_supplier', 'mining', 'developer', 'other');
CREATE TYPE truck_type AS ENUM ('lowboy', 'end_dump', 'belly_dump', 'side_dump', 'flatbed', 'water_truck', 'other');
CREATE TYPE material_type AS ENUM ('aggregate', 'sand', 'gravel', 'asphalt', 'concrete', 'dirt', 'rock', 'topsoil', 'base_course', 'rip_rap', 'other');
CREATE TYPE load_status AS ENUM ('draft', 'posted', 'assigned', 'in_progress', 'completed', 'cancelled');
CREATE TYPE assignment_status AS ENUM ('pending', 'accepted', 'rejected', 'en_route_pickup', 'at_pickup', 'loaded', 'en_route_delivery', 'at_delivery', 'completed', 'cancelled');
CREATE TYPE bid_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE pricing_type AS ENUM ('fixed', 'hourly', 'per_ton', 'bid');
CREATE TYPE notification_type AS ENUM ('load_posted', 'bid_received', 'bid_accepted', 'assignment', 'status_update', 'payment', 'review', 'system');

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL,
  company_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies table (load posters)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  business_type business_type NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  logo_url TEXT,
  stripe_account_id TEXT,
  verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 5.0,
  total_loads_posted INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drivers table
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  cdl_number TEXT NOT NULL,
  cdl_state TEXT NOT NULL,
  cdl_expiry DATE NOT NULL,
  years_experience INTEGER NOT NULL,
  stripe_account_id TEXT,
  verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 5.0,
  completed_loads INTEGER DEFAULT 0,
  on_time_percentage DECIMAL(5,2) DEFAULT 100.0,
  available BOOLEAN DEFAULT TRUE,
  current_location GEOGRAPHY(POINT),
  service_radius_miles INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trucks table
CREATE TABLE trucks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  truck_type truck_type NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  license_plate TEXT NOT NULL,
  capacity_tons DECIMAL(10,2) NOT NULL,
  insurance_verified BOOLEAN DEFAULT FALSE,
  insurance_expiry DATE,
  dot_number TEXT,
  mc_number TEXT,
  photos TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loads table
CREATE TABLE loads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  posted_by UUID NOT NULL REFERENCES profiles(id),
  status load_status DEFAULT 'draft',
  material_type material_type NOT NULL,
  material_description TEXT,
  weight_tons DECIMAL(10,2) NOT NULL,
  truck_type_required truck_type NOT NULL,
  trucks_needed INTEGER DEFAULT 1,
  pickup_location_name TEXT NOT NULL,
  pickup_address TEXT NOT NULL,
  pickup_city TEXT NOT NULL,
  pickup_state TEXT NOT NULL,
  pickup_zip TEXT NOT NULL,
  pickup_coordinates GEOGRAPHY(POINT) NOT NULL,
  pickup_instructions TEXT,
  delivery_location_name TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_city TEXT NOT NULL,
  delivery_state TEXT NOT NULL,
  delivery_zip TEXT NOT NULL,
  delivery_coordinates GEOGRAPHY(POINT) NOT NULL,
  delivery_instructions TEXT,
  distance_miles DECIMAL(10,2) NOT NULL,
  scheduled_date DATE NOT NULL,
  pickup_time_start TIME NOT NULL,
  pickup_time_end TIME NOT NULL,
  pricing_type pricing_type NOT NULL,
  rate_amount DECIMAL(10,2) NOT NULL,
  estimated_total DECIMAL(10,2) NOT NULL,
  round_trips INTEGER DEFAULT 1,
  urgent BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Load assignments table
CREATE TABLE load_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  load_id UUID NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES drivers(id),
  truck_id UUID NOT NULL REFERENCES trucks(id),
  status assignment_status DEFAULT 'pending',
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  pickup_arrived_at TIMESTAMPTZ,
  loaded_at TIMESTAMPTZ,
  delivery_arrived_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  actual_weight_tons DECIMAL(10,2),
  driver_notes TEXT,
  poster_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bids table
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  load_id UUID NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES drivers(id),
  amount DECIMAL(10,2) NOT NULL,
  message TEXT,
  status bid_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  load_id UUID NOT NULL REFERENCES loads(id),
  assignment_id UUID NOT NULL REFERENCES load_assignments(id),
  company_id UUID NOT NULL REFERENCES companies(id),
  driver_id UUID NOT NULL REFERENCES drivers(id),
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  driver_payout DECIMAL(10,2) NOT NULL,
  status payment_status DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  load_id UUID NOT NULL REFERENCES loads(id),
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  reviewee_id UUID NOT NULL REFERENCES profiles(id),
  reviewer_role user_role NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_companies_owner_id ON companies(owner_id);
CREATE INDEX idx_companies_verified ON companies(verified);
CREATE INDEX idx_drivers_profile_id ON drivers(profile_id);
CREATE INDEX idx_drivers_available ON drivers(available);
CREATE INDEX idx_drivers_location ON drivers USING GIST(current_location);
CREATE INDEX idx_trucks_driver_id ON trucks(driver_id);
CREATE INDEX idx_trucks_active ON trucks(active);
CREATE INDEX idx_loads_company_id ON loads(company_id);
CREATE INDEX idx_loads_status ON loads(status);
CREATE INDEX idx_loads_scheduled_date ON loads(scheduled_date);
CREATE INDEX idx_loads_pickup_coords ON loads USING GIST(pickup_coordinates);
CREATE INDEX idx_loads_delivery_coords ON loads USING GIST(delivery_coordinates);
CREATE INDEX idx_load_assignments_load_id ON load_assignments(load_id);
CREATE INDEX idx_load_assignments_driver_id ON load_assignments(driver_id);
CREATE INDEX idx_load_assignments_status ON load_assignments(status);
CREATE INDEX idx_bids_load_id ON bids(load_id);
CREATE INDEX idx_bids_driver_id ON bids(driver_id);
CREATE INDEX idx_bids_status ON bids(status);
CREATE INDEX idx_payments_load_id ON payments(load_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Companies policies
CREATE POLICY "Anyone can view verified companies" ON companies FOR SELECT USING (verified = true);
CREATE POLICY "Owners can view own company" ON companies FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Owners can update own company" ON companies FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Poster users can create companies" ON companies FOR INSERT WITH CHECK (
  auth.uid() = owner_id AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'poster')
);

-- Drivers policies
CREATE POLICY "Anyone can view verified drivers" ON drivers FOR SELECT USING (verified = true);
CREATE POLICY "Drivers can view own profile" ON drivers FOR SELECT USING (
  profile_id IN (SELECT id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "Drivers can update own profile" ON drivers FOR UPDATE USING (
  profile_id IN (SELECT id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "Driver users can create driver profile" ON drivers FOR INSERT WITH CHECK (
  profile_id = auth.uid() AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'driver')
);

-- Trucks policies
CREATE POLICY "Anyone can view active trucks" ON trucks FOR SELECT USING (active = true);
CREATE POLICY "Drivers can view own trucks" ON trucks FOR SELECT USING (
  driver_id IN (SELECT id FROM drivers WHERE profile_id = auth.uid())
);
CREATE POLICY "Drivers can manage own trucks" ON trucks FOR ALL USING (
  driver_id IN (SELECT id FROM drivers WHERE profile_id = auth.uid())
);

-- Loads policies
CREATE POLICY "Anyone can view posted loads" ON loads FOR SELECT USING (status IN ('posted', 'assigned', 'in_progress'));
CREATE POLICY "Posters can view own loads" ON loads FOR SELECT USING (posted_by = auth.uid());
CREATE POLICY "Assigned drivers can view their loads" ON loads FOR SELECT USING (
  id IN (SELECT load_id FROM load_assignments WHERE driver_id IN (SELECT id FROM drivers WHERE profile_id = auth.uid()))
);
CREATE POLICY "Posters can create loads" ON loads FOR INSERT WITH CHECK (
  posted_by = auth.uid() AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'poster')
);
CREATE POLICY "Posters can update own loads" ON loads FOR UPDATE USING (posted_by = auth.uid());
CREATE POLICY "Posters can delete own draft loads" ON loads FOR DELETE USING (
  posted_by = auth.uid() AND status = 'draft'
);

-- Load assignments policies
CREATE POLICY "Posters can view assignments for their loads" ON load_assignments FOR SELECT USING (
  load_id IN (SELECT id FROM loads WHERE posted_by = auth.uid())
);
CREATE POLICY "Drivers can view own assignments" ON load_assignments FOR SELECT USING (
  driver_id IN (SELECT id FROM drivers WHERE profile_id = auth.uid())
);
CREATE POLICY "Posters can create assignments" ON load_assignments FOR INSERT WITH CHECK (
  load_id IN (SELECT id FROM loads WHERE posted_by = auth.uid())
);
CREATE POLICY "Drivers can update own assignments" ON load_assignments FOR UPDATE USING (
  driver_id IN (SELECT id FROM drivers WHERE profile_id = auth.uid())
);
CREATE POLICY "Posters can update assignments for their loads" ON load_assignments FOR UPDATE USING (
  load_id IN (SELECT id FROM loads WHERE posted_by = auth.uid())
);

-- Bids policies
CREATE POLICY "Posters can view bids on their loads" ON bids FOR SELECT USING (
  load_id IN (SELECT id FROM loads WHERE posted_by = auth.uid())
);
CREATE POLICY "Drivers can view own bids" ON bids FOR SELECT USING (
  driver_id IN (SELECT id FROM drivers WHERE profile_id = auth.uid())
);
CREATE POLICY "Drivers can create bids" ON bids FOR INSERT WITH CHECK (
  driver_id IN (SELECT id FROM drivers WHERE profile_id = auth.uid())
);
CREATE POLICY "Drivers can update own bids" ON bids FOR UPDATE USING (
  driver_id IN (SELECT id FROM drivers WHERE profile_id = auth.uid())
);
CREATE POLICY "Posters can update bids on their loads" ON bids FOR UPDATE USING (
  load_id IN (SELECT id FROM loads WHERE posted_by = auth.uid())
);

-- Payments policies
CREATE POLICY "Companies can view their payments" ON payments FOR SELECT USING (
  company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid())
);
CREATE POLICY "Drivers can view their payments" ON payments FOR SELECT USING (
  driver_id IN (SELECT id FROM drivers WHERE profile_id = auth.uid())
);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (reviewer_id = auth.uid());
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (reviewer_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loads_updated_at BEFORE UPDATE ON loads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
