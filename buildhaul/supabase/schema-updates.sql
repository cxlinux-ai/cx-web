-- =============================================
-- BUILDHAUL SCHEMA UPDATES - STICKY FEATURES
-- Run this AFTER the initial schema.sql
-- Version: 2.0
-- =============================================

-- =============================================
-- 1. TRUSTED DRIVER NETWORK
-- =============================================
CREATE TABLE IF NOT EXISTS company_driver_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'neutral' CHECK (status IN ('preferred', 'approved', 'neutral', 'blocked')),
  notes TEXT,
  loads_completed INTEGER DEFAULT 0,
  total_paid DECIMAL(12,2) DEFAULT 0,
  avg_rating DECIMAL(3,2),
  last_load_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, driver_id)
);

CREATE INDEX idx_company_driver_company ON company_driver_relationships(company_id);
CREATE INDEX idx_company_driver_driver ON company_driver_relationships(driver_id);
CREATE INDEX idx_company_driver_status ON company_driver_relationships(status);

-- =============================================
-- 2. GPS TRACKING & LIVE LOCATION
-- =============================================
CREATE TABLE IF NOT EXISTS location_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES load_assignments(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  location GEOGRAPHY(POINT) NOT NULL,
  speed DECIMAL(5,2), -- mph
  heading INTEGER, -- degrees 0-359
  accuracy DECIMAL(10,2), -- meters
  battery_level INTEGER, -- percentage
  is_moving BOOLEAN DEFAULT TRUE,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_location_tracking_assignment ON location_tracking(assignment_id);
CREATE INDEX idx_location_tracking_driver ON location_tracking(driver_id);
CREATE INDEX idx_location_tracking_timestamp ON location_tracking(timestamp);
CREATE INDEX idx_location_tracking_location ON location_tracking USING GIST(location);

-- Geofence events for automatic status updates
CREATE TABLE IF NOT EXISTS geofence_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES load_assignments(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('entered_pickup', 'exited_pickup', 'entered_delivery', 'exited_delivery')),
  location GEOGRAPHY(POINT) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_geofence_assignment ON geofence_events(assignment_id);

-- =============================================
-- 3. IN-APP MESSAGING
-- =============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id UUID REFERENCES loads(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id),
  driver_id UUID REFERENCES drivers(id),
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  unread_company INTEGER DEFAULT 0,
  unread_driver INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_load ON conversations(load_id);
CREATE INDEX idx_conversations_company ON conversations(company_id);
CREATE INDEX idx_conversations_driver ON conversations(driver_id);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  sender_role user_role NOT NULL,
  message TEXT NOT NULL,
  attachments TEXT[], -- URLs to files in storage
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- =============================================
-- 4. INSTANT PAYOUT
-- =============================================
CREATE TABLE IF NOT EXISTS instant_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES drivers(id),
  amount DECIMAL(10,2) NOT NULL,
  fee DECIMAL(10,2) NOT NULL, -- 1.5% instant payout fee
  net_amount DECIMAL(10,2) NOT NULL,
  stripe_payout_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  initiated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

CREATE INDEX idx_instant_payouts_driver ON instant_payouts(driver_id);
CREATE INDEX idx_instant_payouts_status ON instant_payouts(status);

-- Track payout preferences
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS instant_payout_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS instant_payout_bank_verified BOOLEAN DEFAULT FALSE;

-- Location tracking columns
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS current_lat DECIMAL(10, 8);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS current_lng DECIMAL(11, 8);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS last_location_update TIMESTAMPTZ;

-- Notifications
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS push_token TEXT;

-- Loads table enhancements
ALTER TABLE loads ADD COLUMN IF NOT EXISTS pickup_lat DECIMAL(10, 8);
ALTER TABLE loads ADD COLUMN IF NOT EXISTS pickup_lng DECIMAL(11, 8);
ALTER TABLE loads ADD COLUMN IF NOT EXISTS delivery_lat DECIMAL(10, 8);
ALTER TABLE loads ADD COLUMN IF NOT EXISTS delivery_lng DECIMAL(11, 8);
ALTER TABLE loads ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'web' CHECK (source IN ('web', 'mobile', 'voice_call', 'api', 'recurring'));

-- Companies table enhancements
ALTER TABLE companies ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Profiles table enhancements
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_token TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"push": true, "sms": true, "email": true}'::jsonb;

-- =============================================
-- 5. EARNINGS DASHBOARD & ANALYTICS
-- =============================================
CREATE TABLE IF NOT EXISTS driver_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  loads_completed INTEGER DEFAULT 0,
  gross_earnings DECIMAL(10,2) DEFAULT 0,
  platform_fees DECIMAL(10,2) DEFAULT 0,
  instant_payout_fees DECIMAL(10,2) DEFAULT 0,
  net_earnings DECIMAL(10,2) DEFAULT 0,
  miles_driven DECIMAL(10,2) DEFAULT 0,
  hours_worked DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(driver_id, date)
);

CREATE INDEX idx_driver_earnings_driver ON driver_earnings(driver_id);
CREATE INDEX idx_driver_earnings_date ON driver_earnings(date);

CREATE TABLE IF NOT EXISTS company_spending (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  loads_posted INTEGER DEFAULT 0,
  loads_completed INTEGER DEFAULT 0,
  total_spent DECIMAL(12,2) DEFAULT 0,
  total_platform_fees DECIMAL(10,2) DEFAULT 0,
  drivers_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, date)
);

CREATE INDEX idx_company_spending_company ON company_spending(company_id);
CREATE INDEX idx_company_spending_date ON company_spending(date);

-- =============================================
-- 6. RECURRING LOADS
-- =============================================
CREATE TABLE IF NOT EXISTS recurring_load_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
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
  pickup_time_start TIME NOT NULL,
  pickup_time_end TIME NOT NULL,
  pricing_type pricing_type NOT NULL,
  rate_amount DECIMAL(10,2) NOT NULL,
  round_trips INTEGER DEFAULT 1,
  notes TEXT,
  -- Recurrence settings
  recurrence_pattern TEXT NOT NULL CHECK (recurrence_pattern IN ('daily', 'weekly', 'biweekly', 'monthly')),
  recurrence_days INTEGER[], -- Days of week (0=Sunday, 6=Saturday) or days of month
  auto_post BOOLEAN DEFAULT FALSE,
  preferred_driver_id UUID REFERENCES drivers(id),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recurring_templates_company ON recurring_load_templates(company_id);
CREATE INDEX idx_recurring_templates_active ON recurring_load_templates(active);

CREATE TABLE IF NOT EXISTS recurring_load_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES recurring_load_templates(id) ON DELETE CASCADE,
  load_id UUID REFERENCES loads(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  posted BOOLEAN DEFAULT FALSE,
  skipped BOOLEAN DEFAULT FALSE,
  skip_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recurring_instances_template ON recurring_load_instances(template_id);
CREATE INDEX idx_recurring_instances_scheduled ON recurring_load_instances(scheduled_date);

-- =============================================
-- 7. DIRECT HIRE / PREFERRED DRIVERS
-- =============================================
CREATE TABLE IF NOT EXISTS direct_hire_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id UUID REFERENCES loads(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id),
  driver_id UUID REFERENCES drivers(id),
  amount DECIMAL(10,2) NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

CREATE INDEX idx_direct_hire_load ON direct_hire_requests(load_id);
CREATE INDEX idx_direct_hire_driver ON direct_hire_requests(driver_id);
CREATE INDEX idx_direct_hire_status ON direct_hire_requests(status);

-- =============================================
-- 8. VOICE AGENT INTEGRATION
-- =============================================
CREATE TABLE IF NOT EXISTS voice_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  phone_number TEXT NOT NULL,
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  call_sid TEXT, -- Twilio Call SID
  status TEXT CHECK (status IN ('initiated', 'ringing', 'answered', 'completed', 'failed')),
  duration_seconds INTEGER,
  recording_url TEXT,
  transcript TEXT,
  intent TEXT, -- What the user wanted (post_load, check_status, etc)
  context_data JSONB, -- Load IDs, etc
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

CREATE INDEX idx_voice_calls_user ON voice_calls(user_id);
CREATE INDEX idx_voice_calls_status ON voice_calls(status);

CREATE TABLE IF NOT EXISTS voice_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES voice_calls(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- post_load, accept_load, update_status, etc
  entity_type TEXT, -- load, assignment, etc
  entity_id UUID,
  success BOOLEAN,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_voice_actions_call ON voice_actions(call_id);

-- =============================================
-- 9. ADDITIONAL INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_loads_status ON loads(status);
CREATE INDEX IF NOT EXISTS idx_loads_scheduled_date ON loads(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_loads_company ON loads(company_id);
CREATE INDEX IF NOT EXISTS idx_loads_coordinates ON loads USING GIST(pickup_coordinates);

CREATE INDEX IF NOT EXISTS idx_assignments_status ON load_assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_driver ON load_assignments(driver_id);
CREATE INDEX IF NOT EXISTS idx_assignments_load ON load_assignments(load_id);

CREATE INDEX IF NOT EXISTS idx_drivers_available ON drivers(available);
CREATE INDEX IF NOT EXISTS idx_drivers_location ON drivers USING GIST(current_location);

CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_driver ON payments(driver_id);

-- =============================================
-- 10. REALTIME SUBSCRIPTIONS SETUP
-- =============================================
-- Enable realtime for critical tables
ALTER PUBLICATION supabase_realtime ADD TABLE location_tracking;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE load_assignments;

-- =============================================
-- 11. UTILITY FUNCTIONS
-- =============================================

-- Function to calculate distance between points
CREATE OR REPLACE FUNCTION calculate_distance_meters(
  lat1 DOUBLE PRECISION,
  lon1 DOUBLE PRECISION,
  point2 GEOGRAPHY
)
RETURNS DOUBLE PRECISION AS $$
BEGIN
  RETURN ST_Distance(
    ST_MakePoint(lon1, lat1)::geography,
    point2
  );
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 12. TRIGGERS & FUNCTIONS FOR AUTOMATION
-- =============================================

-- Update company_driver_relationships automatically
CREATE OR REPLACE FUNCTION update_company_driver_relationship()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    INSERT INTO company_driver_relationships (company_id, driver_id, loads_completed, last_load_date)
    SELECT
      l.company_id,
      NEW.driver_id,
      1,
      NOW()
    FROM loads l
    WHERE l.id = NEW.load_id
    ON CONFLICT (company_id, driver_id)
    DO UPDATE SET
      loads_completed = company_driver_relationships.loads_completed + 1,
      last_load_date = NOW(),
      updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_company_driver_relationship
  AFTER UPDATE ON load_assignments
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status <> 'completed')
  EXECUTE FUNCTION update_company_driver_relationship();

-- Update earnings on payment completion
CREATE OR REPLACE FUNCTION update_driver_earnings()
RETURNS TRIGGER AS $$
DECLARE
  v_date DATE;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status <> 'completed') THEN
    v_date := DATE(NEW.paid_at);

    INSERT INTO driver_earnings (driver_id, date, loads_completed, gross_earnings, platform_fees, net_earnings)
    VALUES (
      NEW.driver_id,
      v_date,
      1,
      NEW.amount,
      NEW.platform_fee,
      NEW.driver_payout
    )
    ON CONFLICT (driver_id, date)
    DO UPDATE SET
      loads_completed = driver_earnings.loads_completed + 1,
      gross_earnings = driver_earnings.gross_earnings + NEW.amount,
      platform_fees = driver_earnings.platform_fees + NEW.platform_fee,
      net_earnings = driver_earnings.net_earnings + NEW.driver_payout;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_driver_earnings
  AFTER UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_driver_earnings();

-- Update company spending
CREATE OR REPLACE FUNCTION update_company_spending()
RETURNS TRIGGER AS $$
DECLARE
  v_date DATE;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status <> 'completed') THEN
    v_date := DATE(NEW.paid_at);

    INSERT INTO company_spending (company_id, date, loads_completed, total_spent, total_platform_fees, drivers_used)
    VALUES (
      NEW.company_id,
      v_date,
      1,
      NEW.amount,
      NEW.platform_fee,
      1
    )
    ON CONFLICT (company_id, date)
    DO UPDATE SET
      loads_completed = company_spending.loads_completed + 1,
      total_spent = company_spending.total_spent + NEW.amount,
      total_platform_fees = company_spending.total_platform_fees + NEW.platform_fee;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_company_spending
  AFTER UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_company_spending();

-- Auto-update conversation on new message
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.message, 100),
    unread_company = CASE WHEN NEW.sender_role = 'driver' THEN unread_company + 1 ELSE unread_company END,
    unread_driver = CASE WHEN NEW.sender_role = 'poster' THEN unread_driver + 1 ELSE unread_driver END
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- =============================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all new tables
ALTER TABLE company_driver_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE geofence_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE instant_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_spending ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_load_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_load_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_hire_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_actions ENABLE ROW LEVEL SECURITY;

-- Company driver relationships policies
CREATE POLICY "Companies can view their driver relationships"
  ON company_driver_relationships FOR SELECT
  USING (
    company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid())
  );

CREATE POLICY "Companies can manage their driver relationships"
  ON company_driver_relationships FOR ALL
  USING (
    company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid())
  );

-- Location tracking policies
CREATE POLICY "Drivers can insert their own location"
  ON location_tracking FOR INSERT
  WITH CHECK (
    driver_id IN (SELECT id FROM drivers WHERE profile_id = auth.uid())
  );

CREATE POLICY "Companies can view location of their active loads"
  ON location_tracking FOR SELECT
  USING (
    assignment_id IN (
      SELECT la.id FROM load_assignments la
      JOIN loads l ON l.id = la.load_id
      WHERE l.company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid())
    )
  );

-- Messaging policies
CREATE POLICY "Users can view conversations they're part of"
  ON conversations FOR SELECT
  USING (
    company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid())
    OR driver_id IN (SELECT id FROM drivers WHERE profile_id = auth.uid())
  );

CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid())
         OR driver_id IN (SELECT id FROM drivers WHERE profile_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations
      WHERE company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid())
         OR driver_id IN (SELECT id FROM drivers WHERE profile_id = auth.uid())
    )
  );

-- Instant payout policies
CREATE POLICY "Drivers can view their own payouts"
  ON instant_payouts FOR SELECT
  USING (
    driver_id IN (SELECT id FROM drivers WHERE profile_id = auth.uid())
  );

CREATE POLICY "Drivers can request instant payouts"
  ON instant_payouts FOR INSERT
  WITH CHECK (
    driver_id IN (SELECT id FROM drivers WHERE profile_id = auth.uid())
  );

-- Earnings policies
CREATE POLICY "Drivers can view their own earnings"
  ON driver_earnings FOR SELECT
  USING (
    driver_id IN (SELECT id FROM drivers WHERE profile_id = auth.uid())
  );

CREATE POLICY "Companies can view their own spending"
  ON company_spending FOR SELECT
  USING (
    company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid())
  );

-- Recurring loads policies
CREATE POLICY "Companies can manage their recurring loads"
  ON recurring_load_templates FOR ALL
  USING (
    company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid())
  );

-- Direct hire policies
CREATE POLICY "Companies can create direct hire requests"
  ON direct_hire_requests FOR INSERT
  WITH CHECK (
    company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid())
  );

CREATE POLICY "Drivers can view direct hire requests for them"
  ON direct_hire_requests FOR SELECT
  USING (
    driver_id IN (SELECT id FROM drivers WHERE profile_id = auth.uid())
    OR company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid())
  );

CREATE POLICY "Drivers can respond to direct hire requests"
  ON direct_hire_requests FOR UPDATE
  USING (
    driver_id IN (SELECT id FROM drivers WHERE profile_id = auth.uid())
  );

-- Voice calls policies
CREATE POLICY "Users can view their own voice calls"
  ON voice_calls FOR ALL
  USING (user_id = auth.uid());

-- =============================================
-- 9. COMPLIANCE DOCUMENTS
-- =============================================
CREATE TABLE IF NOT EXISTS compliance_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'cdl', 'medical_card', 'insurance_certificate',
    'w9', 'vehicle_registration', 'dot_inspection', 'other'
  )),
  document_name TEXT,
  file_url TEXT,
  expiry_date DATE,
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_compliance_docs_driver ON compliance_documents(driver_id);
CREATE INDEX idx_compliance_docs_expiry ON compliance_documents(expiry_date);

ALTER TABLE compliance_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view their own compliance docs"
  ON compliance_documents FOR SELECT
  USING (driver_id IN (SELECT id FROM drivers WHERE profile_id = auth.uid()));

CREATE POLICY "Drivers can upload their own compliance docs"
  ON compliance_documents FOR INSERT
  WITH CHECK (driver_id IN (SELECT id FROM drivers WHERE profile_id = auth.uid()));

CREATE POLICY "Companies can view driver compliance docs"
  ON compliance_documents FOR SELECT
  USING (
    driver_id IN (
      SELECT DISTINCT la.driver_id
      FROM load_assignments la
      JOIN loads l ON l.id = la.load_id
      WHERE l.company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid())
    )
  );

-- =============================================
-- 10. LOAD DOCUMENTS (Weight Tickets, BOLs)
-- =============================================
CREATE TABLE IF NOT EXISTS load_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id UUID REFERENCES loads(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES load_assignments(id),
  document_type TEXT NOT NULL CHECK (document_type IN (
    'weight_ticket', 'bol', 'photo', 'signature', 'receipt'
  )),
  file_url TEXT,
  weight_gross DECIMAL(10,2),
  weight_tare DECIMAL(10,2),
  weight_net DECIMAL(10,2),
  extracted_data JSONB,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_load_documents_load ON load_documents(load_id);
CREATE INDEX idx_load_documents_assignment ON load_documents(assignment_id);

ALTER TABLE load_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view load documents for their loads"
  ON load_documents FOR SELECT
  USING (
    load_id IN (
      SELECT id FROM loads
      WHERE company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid())
    )
    OR assignment_id IN (
      SELECT id FROM load_assignments
      WHERE driver_id IN (SELECT id FROM drivers WHERE profile_id = auth.uid())
    )
  );

CREATE POLICY "Drivers can upload documents for their assignments"
  ON load_documents FOR INSERT
  WITH CHECK (
    assignment_id IN (
      SELECT id FROM load_assignments
      WHERE driver_id IN (SELECT id FROM drivers WHERE profile_id = auth.uid())
    )
  );

-- =============================================
-- COMPLETE - RUN MIGRATIONS
-- =============================================

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'BuildHaul Sticky Features Schema Update Complete!';
  RAISE NOTICE 'Added: GPS Tracking, Instant Payouts, Messaging, Earnings Dashboard';
  RAISE NOTICE 'Added: Recurring Loads, Direct Hire, Voice Integration, Trusted Network';
END $$;
