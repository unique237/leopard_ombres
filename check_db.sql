\echo '=== TABLES ==='
\dt

\echo '=== BOOKS ==='
SELECT id, title, author, status, featured, price_promo, price_full, currency FROM books;

\echo '=== ORDERS ==='
SELECT id, format, email, first_name, payment_method, amount, status, created_at FROM orders;

\echo '=== COMMENTS ==='
SELECT id, author_name, comment, is_published FROM comments;

\echo '=== SITE SETTINGS ==='
SELECT key, value FROM site_settings;

\echo '=== ADMIN USERS ==='
SELECT id, email, created_at FROM admin_users;

\echo '=== ORDER STATS ==='
SELECT * FROM order_stats;

\echo '=== PAGE VISITS (count) ==='
SELECT COUNT(*) AS total_visits FROM page_visits;
