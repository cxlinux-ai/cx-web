-- Seed data for HaulHub
-- Run this after schema.sql to populate with sample data

-- Note: You'll need to create actual auth users first through Supabase Auth
-- Then use their UUIDs here. For now, we'll use placeholder UUIDs.

-- Sample Company Posters (replace with actual user IDs after creating auth users)
INSERT INTO profiles (id, email, full_name, phone, role, created_at, updated_at) VALUES
('10000000-0000-0000-0000-000000000001', 'john@granite.com', 'John Smith', '801-555-0101', 'poster', NOW(), NOW()),
('10000000-0000-0000-0000-000000000002', 'sarah@stakerparson.com', 'Sarah Johnson', '801-555-0102', 'poster', NOW(), NOW()),
('10000000-0000-0000-0000-000000000003', 'mike@genevarock.com', 'Mike Davis', '801-555-0103', 'poster', NOW(), NOW());

-- Sample Companies
INSERT INTO companies (id, owner_id, name, business_type, address, city, state, zip, phone, email, verified, rating, total_loads_posted) VALUES
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Granite Construction', 'general_contractor', '585 W 500 S', 'Salt Lake City', 'UT', '84101', '801-555-0101', 'contact@granite.com', true, 4.8, 45),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Staker Parson Companies', 'material_supplier', '5025 W 1820 S', 'Salt Lake City', 'UT', '84104', '801-555-0102', 'info@stakerparson.com', true, 4.9, 67),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Geneva Rock Products', 'mining', '50 W 2700 S', 'Salt Lake City', 'UT', '84115', '801-555-0103', 'contact@genevarock.com', true, 4.7, 89);

-- Sample Driver Profiles (replace with actual user IDs)
INSERT INTO profiles (id, email, full_name, phone, role, created_at, updated_at) VALUES
('30000000-0000-0000-0000-000000000001', 'driver1@email.com', 'Tom Wilson', '801-555-0201', 'driver', NOW(), NOW()),
('30000000-0000-0000-0000-000000000002', 'driver2@email.com', 'Lisa Martinez', '801-555-0202', 'driver', NOW(), NOW()),
('30000000-0000-0000-0000-000000000003', 'driver3@email.com', 'David Brown', '801-555-0203', 'driver', NOW(), NOW()),
('30000000-0000-0000-0000-000000000004', 'driver4@email.com', 'Jennifer Lee', '801-555-0204', 'driver', NOW(), NOW()),
('30000000-0000-0000-0000-000000000005', 'driver5@email.com', 'Robert Taylor', '801-555-0205', 'driver', NOW(), NOW());

-- Sample Drivers
INSERT INTO drivers (id, profile_id, address, city, state, zip, cdl_number, cdl_state, cdl_expiry, years_experience, verified, rating, completed_loads, on_time_percentage, available, service_radius_miles) VALUES
('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '123 Main St', 'Provo', 'UT', '84601', 'CDL123456', 'UT', '2026-12-31', 8, true, 4.9, 234, 98.5, true, 75),
('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '456 Oak Ave', 'Ogden', 'UT', '84401', 'CDL234567', 'UT', '2027-06-30', 5, true, 4.8, 156, 97.2, true, 50),
('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', '789 Pine Rd', 'Sandy', 'UT', '84070', 'CDL345678', 'UT', '2026-09-15', 12, true, 5.0, 412, 99.1, true, 100),
('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004', '321 Elm St', 'West Valley City', 'UT', '84119', 'CDL456789', 'UT', '2027-03-20', 6, true, 4.7, 189, 96.8, false, 60),
('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000005', '654 Maple Dr', 'Orem', 'UT', '84057', 'CDL567890', 'UT', '2026-11-10', 10, true, 4.9, 298, 98.9, true, 80);

-- Sample Trucks
INSERT INTO trucks (driver_id, truck_type, make, model, year, license_plate, capacity_tons, insurance_verified, insurance_expiry, dot_number, active) VALUES
('40000000-0000-0000-0000-000000000001', 'end_dump', 'Peterbilt', '389', 2019, 'UT-TD-1234', 25.0, true, '2026-12-31', 'DOT123456', true),
('40000000-0000-0000-0000-000000000002', 'belly_dump', 'Kenworth', 'T800', 2020, 'UT-TD-2345', 30.0, true, '2027-06-30', 'DOT234567', true),
('40000000-0000-0000-0000-000000000003', 'side_dump', 'Mack', 'Granite', 2018, 'UT-TD-3456', 28.0, true, '2026-09-15', 'DOT345678', true),
('40000000-0000-0000-0000-000000000003', 'end_dump', 'Freightliner', 'M2', 2021, 'UT-TD-3457', 26.0, true, '2026-09-15', 'DOT345678', true),
('40000000-0000-0000-0000-000000000004', 'flatbed', 'Volvo', 'VNL', 2017, 'UT-TD-4567', 24.0, true, '2027-03-20', 'DOT456789', true),
('40000000-0000-0000-0000-000000000005', 'end_dump', 'Western Star', '4900', 2022, 'UT-TD-5678', 27.0, true, '2026-11-10', 'DOT567890', true);

-- Sample Loads
INSERT INTO loads (
  company_id, posted_by, status, material_type, weight_tons, truck_type_required, trucks_needed,
  pickup_location_name, pickup_address, pickup_city, pickup_state, pickup_zip, pickup_coordinates,
  delivery_location_name, delivery_address, delivery_city, delivery_state, delivery_zip, delivery_coordinates,
  distance_miles, scheduled_date, pickup_time_start, pickup_time_end, pricing_type, rate_amount, estimated_total, urgent
) VALUES
(
  '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'posted', 'gravel', 25.0, 'end_dump', 2,
  'Rio Tinto Quarry', '12600 S 5600 W', 'Herriman', 'UT', '84096', ST_GeogFromText('POINT(-112.0369 40.4669)'),
  'I-15 Expansion Site 4', '14400 S Bangerter Hwy', 'Draper', 'UT', '84020', ST_GeogFromText('POINT(-111.9183 40.4524)'),
  8.5, CURRENT_DATE + INTERVAL '2 days', '08:00', '12:00', 'fixed', 350.00, 700.00, false
),
(
  '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'posted', 'asphalt', 30.0, 'belly_dump', 1,
  'Staker Asphalt Plant', '5025 W 1820 S', 'Salt Lake City', 'UT', '84104', ST_GeogFromText('POINT(-111.9394 40.7338)'),
  'Airport Expansion Project', '776 N Terminal Dr', 'Salt Lake City', 'UT', '84122', ST_GeogFromText('POINT(-111.9778 40.7899)'),
  4.2, CURRENT_DATE + INTERVAL '1 day', '06:00', '09:00', 'fixed', 425.00, 425.00, true
),
(
  '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'posted', 'sand', 28.0, 'side_dump', 3,
  'Geneva Rock - Point of the Mountain', '14616 S Pony Express Rd', 'Bluffdale', 'UT', '84065', ST_GeogFromText('POINT(-111.9389 40.4833)'),
  'Daybreak Development', '11576 S 4000 W', 'South Jordan', 'UT', '84009', ST_GeogFromText('POINT(-111.9958 40.5486)'),
  6.1, CURRENT_DATE + INTERVAL '3 days', '07:00', '16:00', 'per_ton', 15.00, 1260.00, false
),
(
  '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'bid', 'base_course', 22.0, 'end_dump', 1,
  'Hanson Aggregates', '7200 W California Ave', 'Salt Lake City', 'UT', '84104', ST_GeogFromText('POINT(-112.0039 40.7608)'),
  'Mountain View Corridor Mile 15', '13400 S 5600 W', 'Herriman', 'UT', '84096', ST_GeogFromText('POINT(-112.0369 40.4827)'),
  18.3, CURRENT_DATE + INTERVAL '4 days', '08:00', '17:00', 'bid', 0.00, 800.00, false
),
(
  '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'assigned', 'dirt', 35.0, 'end_dump', 2,
  'Excavation Site A', '9800 S 3200 W', 'South Jordan', 'UT', '84095', ST_GeogFromText('POINT(-111.9389 40.5986)'),
  'Fill Site B', '15200 S Redwood Rd', 'Bluffdale', 'UT', '84065', ST_GeogFromText('POINT(-111.9394 40.4706)'),
  9.2, CURRENT_DATE, '09:00', '15:00', 'fixed', 250.00, 500.00, false
);

-- Sample Bids
INSERT INTO bids (load_id, driver_id, amount, message, status) VALUES
((SELECT id FROM loads WHERE status = 'bid' LIMIT 1), '40000000-0000-0000-0000-000000000001', 750.00, 'I can handle this load tomorrow. Have experience with base course.', 'pending'),
((SELECT id FROM loads WHERE status = 'bid' LIMIT 1), '40000000-0000-0000-0000-000000000003', 725.00, 'Experienced driver, can start immediately.', 'pending');

-- Sample Completed Load
INSERT INTO loads (
  company_id, posted_by, status, material_type, weight_tons, truck_type_required, trucks_needed,
  pickup_location_name, pickup_address, pickup_city, pickup_state, pickup_zip, pickup_coordinates,
  delivery_location_name, delivery_address, delivery_city, delivery_state, delivery_zip, delivery_coordinates,
  distance_miles, scheduled_date, pickup_time_start, pickup_time_end, pricing_type, rate_amount, estimated_total, urgent,
  created_at, updated_at
) VALUES
(
  '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'completed', 'aggregate', 24.0, 'end_dump', 1,
  'Mountain Quarry', '10200 N 6000 W', 'Highland', 'UT', '84003', ST_GeogFromText('POINT(-111.8144 40.4247)'),
  'Convention Center Renovation', '220 S State St', 'Salt Lake City', 'UT', '84111', ST_GeogFromText('POINT(-111.8889 40.7647)'),
  24.5, CURRENT_DATE - INTERVAL '5 days', '07:00', '11:00', 'fixed', 600.00, 600.00, false,
  NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days'
);

-- Print success message
DO $$
BEGIN
  RAISE NOTICE 'Seed data inserted successfully!';
  RAISE NOTICE 'Created 3 companies, 5 drivers, 6 trucks, 6 loads, and 2 bids';
  RAISE NOTICE 'Note: Replace placeholder user IDs with actual Supabase Auth user IDs after creating accounts';
END $$;
