
-- Create footer menus
INSERT INTO menus (id, name, location) VALUES 
  ('a0000001-0000-0000-0000-000000000001', 'Product', 'footer'),
  ('a0000001-0000-0000-0000-000000000002', 'Company', 'footer'),
  ('a0000001-0000-0000-0000-000000000003', 'Support', 'footer');

-- Product menu items
INSERT INTO menu_items (menu_id, label, url, sort_order) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'GBP Management', '/features', 0),
  ('a0000001-0000-0000-0000-000000000001', 'Review Monitoring', '/features', 1),
  ('a0000001-0000-0000-0000-000000000001', 'Analytics', '/features', 2),
  ('a0000001-0000-0000-0000-000000000001', 'Listings', '/features', 3),
  ('a0000001-0000-0000-0000-000000000001', 'Pricing', '/pricing', 4);

-- Company menu items
INSERT INTO menu_items (menu_id, label, url, sort_order) VALUES
  ('a0000001-0000-0000-0000-000000000002', 'About Us', '/about', 0),
  ('a0000001-0000-0000-0000-000000000002', 'Contact', '/contact', 1),
  ('a0000001-0000-0000-0000-000000000002', 'Careers', '/about', 2),
  ('a0000001-0000-0000-0000-000000000002', 'Blog', '/about', 3);

-- Support menu items
INSERT INTO menu_items (menu_id, label, url, sort_order) VALUES
  ('a0000001-0000-0000-0000-000000000003', 'Help Center', '/contact', 0),
  ('a0000001-0000-0000-0000-000000000003', 'Documentation', '/contact', 1),
  ('a0000001-0000-0000-0000-000000000003', 'API Reference', '/contact', 2),
  ('a0000001-0000-0000-0000-000000000003', 'Status', '/contact', 3);
