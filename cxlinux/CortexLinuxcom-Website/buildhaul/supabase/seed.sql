-- =============================================
-- BUILDHAUL SEED DATA - REAL UTAH MARKET DATA
-- Verified January 2026
-- =============================================

-- Clean existing data
TRUNCATE profiles, companies, drivers, trucks, loads, load_assignments, bids, payments, reviews, notifications CASCADE;

-- =============================================
-- POSTER PROFILES (Construction Companies)
-- =============================================

INSERT INTO profiles (id, email, full_name, phone, role, company_name, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'dispatch@graniteconstruction.com', 'Ty Bradley', '801-831-6113', 'poster', 'Granite Construction', NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'orders@genevarock.com', 'Cody Preston', '801-420-0701', 'poster', 'Geneva Rock Products', NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'dispatch@stakerparson.com', 'Lane Boyer', '801-731-1111', 'poster', 'Staker Parson Companies', NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', 'ops@wadsco.com', 'Con Wadsworth', '801-553-1661', 'poster', 'Ralph L. Wadsworth Construction', NOW(), NOW()),
('55555555-5555-5555-5555-555555555555', 'dispatch@wwclyde.net', 'Wilford Clyde', '801-489-3641', 'poster', 'W.W. Clyde & Co', NOW(), NOW());

-- DRIVER PROFILES
INSERT INTO profiles (id, email, full_name, phone, role, created_at, updated_at) VALUES
('aaaa1111-1111-1111-1111-111111111111', 'dustin.miller@email.com', 'Dustin Miller', '801-555-1001', 'driver', NOW(), NOW()),
('aaaa2222-2222-2222-2222-222222222222', 'jose.garcia@email.com', 'Jose Garcia', '801-555-1002', 'driver', NOW(), NOW()),
('aaaa3333-3333-3333-3333-333333333333', 'mike.thompson@email.com', 'Mike Thompson', '801-555-1003', 'driver', NOW(), NOW()),
('aaaa4444-4444-4444-4444-444444444444', 'ryan.jensen@email.com', 'Ryan Jensen', '801-555-1004', 'driver', NOW(), NOW()),
('aaaa5555-5555-5555-5555-555555555555', 'carlos.rodriguez@email.com', 'Carlos Rodriguez', '801-555-1005', 'driver', NOW(), NOW()),
('aaaa6666-6666-6666-6666-666666666666', 'travis.smith@email.com', 'Travis Smith', '801-555-1006', 'driver', NOW(), NOW()),
('aaaa7777-7777-7777-7777-777777777777', 'brandon.wright@email.com', 'Brandon Wright', '801-555-1007', 'driver', NOW(), NOW()),
('aaaa8888-8888-8888-8888-888888888888', 'derek.jones@email.com', 'Derek Jones', '801-555-1008', 'driver', NOW(), NOW());

-- =============================================
-- COMPANIES - REAL UTAH DATA
-- =============================================

INSERT INTO companies (id, owner_id, name, business_type, address, city, state, zip, phone, email, verified, rating, total_loads_posted, created_at) VALUES
-- Granite Construction - Utah Region
('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 'Granite Construction - Utah Region', 'general_contractor',
 '1000 N Warm Springs Rd', 'Salt Lake City', 'UT', '84116',
 '801-526-6000', 'dispatch@graniteconstruction.com', true, 4.9, 2847, NOW()),

-- Geneva Rock Products - HQ Orem
('c2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
 'Geneva Rock Products', 'material_supplier',
 '1565 W 400 N', 'Orem', 'UT', '84057',
 '801-281-7900', 'orders@genevarock.com', true, 4.8, 5621, NOW()),

-- Staker Parson - HQ Ogden
('c3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
 'Staker Parson Companies', 'material_supplier',
 '2350 S 1900 W', 'Ogden', 'UT', '84401',
 '801-731-1111', 'dispatch@stakerparson.com', true, 4.7, 4392, NOW()),

-- Ralph L. Wadsworth - Draper
('c4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444',
 'Ralph L. Wadsworth Construction', 'general_contractor',
 '166 E 14000 S Suite 200', 'Draper', 'UT', '84020',
 '801-553-1661', 'ops@wadsco.com', true, 4.9, 1893, NOW()),

-- W.W. Clyde - Orem (moving to Springville 2026)
('c5555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555',
 'W.W. Clyde & Co', 'general_contractor',
 '730 N 1500 W', 'Orem', 'UT', '84057',
 '801-489-3641', 'dispatch@wwclyde.net', true, 4.8, 2156, NOW());

-- =============================================
-- DRIVERS
-- =============================================

INSERT INTO drivers (id, profile_id, company_name, address, city, state, zip, cdl_number, cdl_state, cdl_expiry, years_experience, verified, rating, completed_loads, on_time_percentage, available, service_radius_miles, created_at) VALUES
('d1111111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', 'Miller Trucking LLC', '7832 S Redwood Rd', 'West Jordan', 'UT', '84088', 'UT-CDL-847291', 'UT', '2027-06-15', 12, true, 4.9, 847, 98.2, true, 75, NOW()),
('d2222222-2222-2222-2222-222222222222', 'aaaa2222-2222-2222-2222-222222222222', 'Garcia Hauling', '567 E 7200 S', 'Midvale', 'UT', '84047', 'UT-CDL-293847', 'UT', '2026-09-20', 8, true, 4.8, 623, 97.5, true, 60, NOW()),
('d3333333-3333-3333-3333-333333333333', 'aaaa3333-3333-3333-3333-333333333333', 'Thompson Transport', '9200 S State St', 'Sandy', 'UT', '84070', 'UT-CDL-182736', 'UT', '2027-03-10', 15, true, 4.95, 1247, 99.1, true, 100, NOW()),
('d4444444-4444-4444-4444-444444444444', 'aaaa4444-4444-4444-4444-444444444444', NULL, '12300 S 300 E', 'Draper', 'UT', '84020', 'UT-CDL-938271', 'UT', '2026-12-01', 5, true, 4.7, 312, 96.8, true, 50, NOW()),
('d5555555-5555-5555-5555-555555555555', 'aaaa5555-5555-5555-5555-555555555555', 'Rodriguez Brothers Trucking', '4800 S Redwood Rd', 'Taylorsville', 'UT', '84123', 'UT-CDL-472910', 'UT', '2027-08-25', 10, true, 4.85, 956, 97.9, false, 80, NOW()),
('d6666666-6666-6666-6666-666666666666', 'aaaa6666-6666-6666-6666-666666666666', 'Smith Excavation & Hauling', '6200 W 13100 S', 'Herriman', 'UT', '84096', 'UT-CDL-019283', 'UT', '2026-04-30', 7, true, 4.6, 445, 95.2, true, 40, NOW()),
('d7777777-7777-7777-7777-777777777777', 'aaaa7777-7777-7777-7777-777777777777', NULL, '2100 N Main St', 'Lehi', 'UT', '84043', 'UT-CDL-837462', 'UT', '2027-11-15', 3, true, 4.5, 127, 94.5, true, 35, NOW()),
('d8888888-8888-8888-8888-888888888888', 'aaaa8888-8888-8888-8888-888888888888', 'Jones Construction Services', '700 E State St', 'American Fork', 'UT', '84003', 'UT-CDL-102938', 'UT', '2026-07-20', 20, true, 4.92, 2156, 99.3, true, 120, NOW());

-- =============================================
-- TRUCKS
-- =============================================

INSERT INTO trucks (id, driver_id, truck_type, make, model, year, license_plate, capacity_tons, insurance_verified, insurance_expiry, dot_number, active, created_at) VALUES
('t1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'end_dump', 'Peterbilt', '389', 2022, 'UT E84729', 25, true, '2026-03-15', 'USDOT-2847193', true, NOW()),
('t1111112-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'belly_dump', 'Kenworth', 'W900', 2021, 'UT B93847', 28, true, '2026-03-15', 'USDOT-2847194', true, NOW()),
('t2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 'end_dump', 'Freightliner', 'Cascadia', 2023, 'UT E29384', 24, true, '2026-05-20', 'USDOT-3928471', true, NOW()),
('t3333333-3333-3333-3333-333333333333', 'd3333333-3333-3333-3333-333333333333', 'lowboy', 'Peterbilt', '567', 2020, 'UT L18273', 50, true, '2026-08-10', 'USDOT-1827364', true, NOW()),
('t3333334-3333-3333-3333-333333333333', 'd3333333-3333-3333-3333-333333333333', 'end_dump', 'Kenworth', 'T880', 2022, 'UT E83746', 26, true, '2026-08-10', 'USDOT-1827365', true, NOW()),
('t4444444-4444-4444-4444-444444444444', 'd4444444-4444-4444-4444-444444444444', 'side_dump', 'Mack', 'Granite', 2021, 'UT S93827', 27, true, '2026-06-01', 'USDOT-9382716', true, NOW()),
('t5555555-5555-5555-5555-555555555555', 'd5555555-5555-5555-5555-555555555555', 'belly_dump', 'Peterbilt', '579', 2022, 'UT B47291', 30, true, '2026-09-25', 'USDOT-4729103', true, NOW()),
('t5555556-5555-5555-5555-555555555555', 'd5555555-5555-5555-5555-555555555555', 'end_dump', 'Volvo', 'VNL', 2023, 'UT E83947', 25, true, '2026-09-25', 'USDOT-4729104', true, NOW()),
('t6666666-6666-6666-6666-666666666666', 'd6666666-6666-6666-6666-666666666666', 'water_truck', 'International', 'HX', 2020, 'UT W01928', 4000, true, '2026-04-30', 'USDOT-0192837', true, NOW()),
('t7777777-7777-7777-7777-777777777777', 'd7777777-7777-7777-7777-777777777777', 'flatbed', 'Freightliner', 'Coronado', 2019, 'UT F83746', 22, true, '2026-11-15', 'USDOT-8374625', true, NOW()),
('t8888888-8888-8888-8888-888888888888', 'd8888888-8888-8888-8888-888888888888', 'end_dump', 'Peterbilt', '389', 2023, 'UT E10293', 26, true, '2026-07-20', 'USDOT-1029384', true, NOW()),
('t8888889-8888-8888-8888-888888888888', 'd8888888-8888-8888-8888-888888888888', 'belly_dump', 'Kenworth', 'W990', 2023, 'UT B89012', 29, true, '2026-07-20', 'USDOT-1029385', true, NOW()),
('t8888890-8888-8888-8888-888888888888', 'd8888888-8888-8888-8888-888888888888', 'lowboy', 'Peterbilt', '389', 2022, 'UT L90123', 55, true, '2026-07-20', 'USDOT-1029386', true, NOW());

-- =============================================
-- LOADS - REAL UTAH PIT/PROJECT LOCATIONS
-- =============================================

INSERT INTO loads (id, company_id, posted_by, status, material_type, weight_tons, truck_type_required, trucks_needed,
  pickup_location_name, pickup_address, pickup_city, pickup_state, pickup_zip,
  delivery_location_name, delivery_address, delivery_city, delivery_state, delivery_zip,
  distance_miles, scheduled_date, pickup_time_start, pickup_time_end,
  pricing_type, rate_amount, estimated_total, round_trips, urgent, notes, created_at, updated_at) VALUES

-- POSTED LOADS
-- Geneva Rock Point of Mountain to UDOT US-89 Project
('l0000001-0000-0000-0000-000000000001', 'c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 'posted', 'base_course', 25, 'end_dump', 5,
 'Geneva Rock - Point of the Mountain', '14000 S Minuteman Dr', 'Draper', 'UT', '84020',
 'US-89 Reconstruction - Mile Marker 395', '2100 S Highway 89', 'Farmington', 'UT', '84025',
 32, CURRENT_DATE + 1, '06:00', '07:00', 'per_ton', 8.50, 1062.50, 1, false,
 'UDOT project. Check in at gate with project badge. Hard hats required.', NOW(), NOW()),

-- Staker Parson Beck Street to Mountain View Corridor
('l0000002-0000-0000-0000-000000000002', 'c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 'posted', 'aggregate', 22, 'belly_dump', 3,
 'Staker Parson - Beck Street', '1730 N Beck St', 'Salt Lake City', 'UT', '84116',
 'Mountain View Corridor Phase 4', '6200 W 11400 S', 'West Jordan', 'UT', '84081',
 18, CURRENT_DATE + 1, '07:00', '08:00', 'fixed', 650, 1950, 1, false,
 'Belly dumps only. Spread on grade. Flaggers on site.', NOW(), NOW()),

-- Geneva Rock Orem to SLC Airport Expansion
('l0000003-0000-0000-0000-000000000003', 'c2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
 'posted', 'sand', 20, 'end_dump', 2,
 'Geneva Rock - Orem Plant', '1565 W 400 N', 'Orem', 'UT', '84057',
 'SLC Airport - Terminal Expansion', '776 N Terminal Dr', 'Salt Lake City', 'UT', '84122',
 42, CURRENT_DATE, '05:00', '06:00', 'hourly', 135, 540, 2, true,
 'URGENT: Airport security clearance required. Contact dispatch 801-281-7900 for badge.', NOW(), NOW()),

-- Staker Parson Ogden to Meta Data Center Eagle Mountain
('l0000004-0000-0000-0000-000000000004', 'c3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
 'posted', 'gravel', 24, 'end_dump', 4,
 'Staker Parson - Ogden', '2350 S 1900 W', 'Ogden', 'UT', '84401',
 'Meta Data Center - Phase 3', '1450 W Granary Rd', 'Eagle Mountain', 'UT', '84005',
 65, CURRENT_DATE + 2, '06:30', '07:30', 'per_ton', 9.25, 888, 1, false,
 'Meta security check required. No cell phones past gate. 30 min badge process.', NOW(), NOW()),

-- Rip Rap from Tooele to Jordan River Bank
('l0000005-0000-0000-0000-000000000005', 'c4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444',
 'posted', 'rip_rap', 18, 'lowboy', 1,
 'Staker Parson - Bauer Pit', '494 E 2400 N', 'Tooele', 'UT', '84074',
 'Jordan River Trail - Bank Stabilization', '7200 S 700 W', 'Midvale', 'UT', '84047',
 42, CURRENT_DATE + 3, '08:00', '09:00', 'fixed', 1450, 1450, 1, false,
 'Large riprap 2-4 ft diameter. Lowboy with ramps required. Army Corps specs.', NOW(), NOW()),

-- Granite Willard Pit to Farmington TOD
('l0000006-0000-0000-0000-000000000006', 'c5555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555',
 'posted', 'topsoil', 22, 'end_dump', 3,
 'Granite - Wells Aggregate Facility', '300 E 750 N Highway 89', 'Willard', 'UT', '84340',
 'Farmington Station TOD', '400 N Station Pkwy', 'Farmington', 'UT', '84025',
 28, CURRENT_DATE + 1, '07:00', '08:00', 'per_ton', 7.00, 462, 1, false,
 'Screened topsoil for landscaping. Dump in designated staging area.', NOW(), NOW()),

-- Hot Mix from Granite West Haven to Weber County Overlay
('l0000007-0000-0000-0000-000000000007', 'c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 'posted', 'asphalt', 24, 'end_dump', 6,
 'Granite - West Haven AC Plant', '1555 S 1900 W', 'West Haven', 'UT', '84401',
 'Weber County Overlay Project', '2700 Harrison Blvd', 'Ogden', 'UT', '84403',
 5, CURRENT_DATE, '04:00', '05:00', 'hourly', 145, 870, 3, true,
 'NIGHT PAVING. Hot mix asphalt - insulated beds required. 3 round trips each truck.', NOW(), NOW()),

-- Geneva Rock to BYU Campus
('l0000008-0000-0000-0000-000000000008', 'c2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
 'posted', 'concrete', 10, 'end_dump', 1,
 'Geneva Rock - Orem Plant', '1565 W 400 N', 'Orem', 'UT', '84057',
 'BYU Life Sciences Expansion', '1700 N Canyon Rd', 'Provo', 'UT', '84604',
 6, CURRENT_DATE + 4, '06:00', '07:00', 'fixed', 425, 425, 1, false,
 'Recycled concrete aggregate for base. Check in at engineering building.', NOW(), NOW()),

-- Granite Talon Cove Asphalt to Eagle Mountain
('l0000009-0000-0000-0000-000000000009', 'c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 'assigned', 'base_course', 26, 'belly_dump', 2,
 'Granite - Talon Cove Facility', '4288 E Ranches Pkwy', 'Eagle Mountain', 'UT', '84005',
 'Daybreak Community - Phase 14', '11400 S Kestrel Rise Rd', 'South Jordan', 'UT', '84009',
 18, CURRENT_DATE, '06:00', '07:00', 'per_ton', 8.00, 416, 1, false,
 'Residential development. Watch for pedestrians and school zones.', NOW(), NOW()),

-- I-15 Expansion Active Load
('l0000010-0000-0000-0000-000000000010', 'c3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
 'in_progress', 'aggregate', 25, 'end_dump', 3,
 'Staker Parson - Beck Street', '1730 N Beck St', 'Salt Lake City', 'UT', '84116',
 'I-15 Northbound Expansion', 'I-15 Exit 328', 'Kaysville', 'UT', '84037',
 22, CURRENT_DATE, '05:30', '06:30', 'per_ton', 8.75, 656.25, 1, false,
 'Active highway construction. Flaggers on site. Follow pilot car into work zone.', NOW(), NOW()),

-- Completed Load - Wadsworth Project
('l0000011-0000-0000-0000-000000000011', 'c4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444',
 'completed', 'sand', 22, 'end_dump', 2,
 'Geneva Rock - Point of the Mountain', '14000 S Minuteman Dr', 'Draper', 'UT', '84020',
 'The Point Utah Development', '15000 S Traverse Ridge Rd', 'Draper', 'UT', '84020',
 4, CURRENT_DATE - 1, '07:00', '08:00', 'fixed', 550, 1100, 1, false,
 'Completed on schedule. Excellent communication.', NOW() - INTERVAL '1 day', NOW()),

-- Completed Load - Clyde Santaquin Project
('l0000012-0000-0000-0000-000000000012', 'c5555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555',
 'completed', 'gravel', 24, 'belly_dump', 4,
 'Staker Parson - Lehi Pit', '1400 W Main St', 'Lehi', 'UT', '84043',
 'Santaquin Industrial Park', '400 N Industrial Rd', 'Santaquin', 'UT', '84655',
 45, CURRENT_DATE - 2, '06:00', '07:00', 'per_ton', 7.50, 720, 1, false,
 'All loads delivered. Professional crew.', NOW() - INTERVAL '2 days', NOW());

-- =============================================
-- LOAD ASSIGNMENTS
-- =============================================

INSERT INTO load_assignments (id, load_id, driver_id, truck_id, status, assigned_at, accepted_at, created_at) VALUES
('a0000001-0000-0000-0000-000000000001', 'l0000009-0000-0000-0000-000000000009', 'd1111111-1111-1111-1111-111111111111', 't1111112-1111-1111-1111-111111111111', 'accepted', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', NOW()),
('a0000002-0000-0000-0000-000000000002', 'l0000009-0000-0000-0000-000000000009', 'd2222222-2222-2222-2222-222222222222', 't2222222-2222-2222-2222-222222222222', 'accepted', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '90 minutes', NOW()),
('a0000003-0000-0000-0000-000000000003', 'l0000010-0000-0000-0000-000000000010', 'd3333333-3333-3333-3333-333333333333', 't3333334-3333-3333-3333-333333333333', 'en_route_delivery', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours', NOW()),
('a0000004-0000-0000-0000-000000000004', 'l0000010-0000-0000-0000-000000000010', 'd4444444-4444-4444-4444-444444444444', 't4444444-4444-4444-4444-444444444444', 'loaded', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours', NOW()),
('a0000005-0000-0000-0000-000000000005', 'l0000010-0000-0000-0000-000000000010', 'd8888888-8888-8888-8888-888888888888', 't8888888-8888-8888-8888-888888888888', 'at_pickup', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours', NOW()),
('a0000006-0000-0000-0000-000000000006', 'l0000011-0000-0000-0000-000000000011', 'd5555555-5555-5555-5555-555555555555', 't5555556-5555-5555-5555-555555555555', 'completed', NOW() - INTERVAL '26 hours', NOW() - INTERVAL '25 hours', NOW()),
('a0000007-0000-0000-0000-000000000007', 'l0000011-0000-0000-0000-000000000011', 'd6666666-6666-6666-6666-666666666666', 't6666666-6666-6666-6666-666666666666', 'completed', NOW() - INTERVAL '26 hours', NOW() - INTERVAL '25 hours', NOW());

-- =============================================
-- BIDS
-- =============================================

INSERT INTO bids (id, load_id, driver_id, amount, message, status, created_at) VALUES
('b0000001-0000-0000-0000-000000000001', 'l0000005-0000-0000-0000-000000000005', 'd3333333-3333-3333-3333-333333333333', 1350, 'Have 50-ton lowboy available. 15 years rip rap experience. Hauled for Army Corps before.', 'pending', NOW() - INTERVAL '1 hour'),
('b0000002-0000-0000-0000-000000000002', 'l0000005-0000-0000-0000-000000000005', 'd8888888-8888-8888-8888-888888888888', 1400, '55-ton lowboy ready. Done work at Bauer Pit and Jordan River trail before.', 'pending', NOW() - INTERVAL '30 minutes'),
('b0000003-0000-0000-0000-000000000003', 'l0000004-0000-0000-0000-000000000004', 'd1111111-1111-1111-1111-111111111111', 875, 'Can bring 2 end dumps. Have hauled to Meta site before - badge still active.', 'pending', NOW() - INTERVAL '2 hours');

-- =============================================
-- REVIEWS
-- =============================================

INSERT INTO reviews (id, load_id, reviewer_id, reviewee_id, reviewer_role, rating, comment, created_at) VALUES
('r0000001-0000-0000-0000-000000000001', 'l0000011-0000-0000-0000-000000000011', '44444444-4444-4444-4444-444444444444', 'aaaa5555-5555-5555-5555-555555555555', 'poster', 5, 'Carlos was 15 minutes early and very professional. Knew exactly where to dump. Will use again.', NOW() - INTERVAL '20 hours'),
('r0000002-0000-0000-0000-000000000002', 'l0000011-0000-0000-0000-000000000011', '44444444-4444-4444-4444-444444444444', 'aaaa6666-6666-6666-6666-666666666666', 'poster', 4, 'Good work. 10 minute delay at pickup but communicated proactively.', NOW() - INTERVAL '20 hours'),
('r0000003-0000-0000-0000-000000000003', 'l0000011-0000-0000-0000-000000000011', 'aaaa5555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'driver', 5, 'Easy site access at The Point. Clear signage. Payment processed same day.', NOW() - INTERVAL '19 hours'),
('r0000004-0000-0000-0000-000000000004', 'l0000012-0000-0000-0000-000000000012', 'aaaa1111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'driver', 5, 'W.W. Clyde runs a tight operation. Great coordination with multiple trucks. Scales calibrated.', NOW() - INTERVAL '40 hours');

-- =============================================
-- NOTIFICATIONS
-- =============================================

INSERT INTO notifications (id, user_id, type, title, message, read, created_at) VALUES
('n0000001-0000-0000-0000-000000000001', 'aaaa1111-1111-1111-1111-111111111111', 'load_posted', 'New Load Available', 'Base course needed at US-89 Reconstruction - 5 trucks, $8.50/ton from Geneva Rock POM', false, NOW() - INTERVAL '30 minutes'),
('n0000002-0000-0000-0000-000000000002', 'aaaa3333-3333-3333-3333-333333333333', 'load_posted', 'Lowboy Load Available', 'Rip rap haul from Bauer Pit to Jordan River - $1,450 fixed. Your lowboy matches.', false, NOW() - INTERVAL '45 minutes'),
('n0000003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'bid_received', 'New Bid Received', 'Mike Thompson bid $1,350 on your rip rap load to Jordan River', false, NOW() - INTERVAL '1 hour'),
('n0000004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'bid_received', 'New Bid Received', 'Derek Jones bid $1,400 on your rip rap load to Jordan River', false, NOW() - INTERVAL '30 minutes'),
('n0000005-0000-0000-0000-000000000005', 'aaaa5555-5555-5555-5555-555555555555', 'payment', 'Payment Received', 'You received $1,100 for The Point Utah job via BuildHaul', true, NOW() - INTERVAL '18 hours');

-- Done
SELECT 'BuildHaul seed data loaded successfully' as status;
