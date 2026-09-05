-- PostgreSQL Schema for Anime Streaming & VIP Community Platform

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(32) UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(32) NOT NULL DEFAULT 'user', -- 'user', 'moderator', 'admin', 'superadmin'
    avatar_url TEXT DEFAULT '/avatars/default.png',
    is_vip BOOLEAN NOT NULL DEFAULT FALSE,
    vip_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Genres Table
CREATE TABLE IF NOT EXISTS genres (
    id SERIAL PRIMARY KEY,
    name_uz VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_ru VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

-- 3. Animes Table
CREATE TABLE IF NOT EXISTS animes (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    original_title VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    poster_url TEXT NOT NULL,
    trailer_video_url TEXT,
    rating NUMERIC(3, 1) DEFAULT 0.0,
    views_count BIGINT DEFAULT 0,
    is_vip BOOLEAN NOT NULL DEFAULT FALSE,
    free_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(32) DEFAULT 'ongoing',
    release_year INT DEFAULT 2024,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Anime - Genres (Many to Many)
CREATE TABLE IF NOT EXISTS anime_genres (
    anime_id BIGINT REFERENCES animes(id) ON DELETE CASCADE,
    genre_id INT REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (anime_id, genre_id)
);

-- 5. Episodes Table
CREATE TABLE IF NOT EXISTS episodes (
    id BIGSERIAL PRIMARY KEY,
    anime_id BIGINT REFERENCES animes(id) ON DELETE CASCADE,
    episode_number INT NOT NULL,
    title VARCHAR(255),
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_seconds INT DEFAULT 1440,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(anime_id, episode_number)
);

-- 6. Bookmarks (Saqlanganlar)
CREATE TABLE IF NOT EXISTS bookmarks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    anime_id BIGINT REFERENCES animes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, anime_id)
);

-- 7. Ratings Table
CREATE TABLE IF NOT EXISTS ratings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    anime_id BIGINT REFERENCES animes(id) ON DELETE CASCADE,
    score INT CHECK (score >= 1 AND score <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, anime_id)
);

-- 8. Forum Topics (Mulohazalar)
CREATE TABLE IF NOT EXISTS forum_topics (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    anime_id BIGINT REFERENCES animes(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    category VARCHAR(64) DEFAULT 'General',
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Comments Table (Anime & Forum)
CREATE TABLE IF NOT EXISTS comments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    anime_id BIGINT REFERENCES animes(id) ON DELETE CASCADE,
    topic_id BIGINT REFERENCES forum_topics(id) ON DELETE CASCADE,
    parent_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_spoiler BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. VIP Plans
CREATE TABLE IF NOT EXISTS vip_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    days INT NOT NULL,
    price_uzs BIGINT NOT NULL,
    badge VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE
);

-- 11. Payment Settings
CREATE TABLE IF NOT EXISTS payment_settings (
    id SERIAL PRIMARY KEY,
    card_number VARCHAR(32) NOT NULL,
    card_holder VARCHAR(255) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    instruction_uz TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. VIP Purchases (Receipt Verification Queue)
CREATE TABLE IF NOT EXISTS vip_purchases (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    plan_id INT REFERENCES vip_plans(id),
    amount_uzs BIGINT NOT NULL,
    receipt_image_url TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'pending',
    admin_id BIGINT REFERENCES users(id),
    admin_note TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for maximum read speed
CREATE INDEX IF NOT EXISTS idx_animes_views ON animes(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_animes_rating ON animes(rating DESC);
CREATE INDEX IF NOT EXISTS idx_animes_vip ON animes(is_vip);
CREATE INDEX IF NOT EXISTS idx_animes_free_at ON animes(free_at);
CREATE INDEX IF NOT EXISTS idx_episodes_anime_id ON episodes(anime_id, episode_number);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_vip_purchases_status ON vip_purchases(status);

-- ================= SEED INITIAL DATA =================

-- Admin User (Password: admin123)
INSERT INTO users (name, email, phone, password_hash, role, is_vip, vip_expires_at)
VALUES 
('Super Admin', 'admin@anime.uz', '+998901234567', '$2a$10$7R9rZ/M96v/nN9M1Uj3kG.3q6zXgY0l03L9Yn3Ea3V4Ew5t3P7kI2', 'superadmin', true, NOW() + INTERVAL '365 days'),
('Ilhomjon', 'ilhom@anime.uz', '+998944258546', '$2a$10$7R9rZ/M96v/nN9M1Uj3kG.3q6zXgY0l03L9Yn3Ea3V4Ew5t3P7kI2', 'admin', true, NOW() + INTERVAL '365 days')
ON CONFLICT DO NOTHING;

-- Genres Seed
INSERT INTO genres (name_uz, name_en, name_ru, slug) VALUES
('Ekshn / Jangari', 'Action', 'Экшен', 'action'),
('Fantastika', 'Fantasy', 'Фэнтези', 'fantasy'),
('Shounen', 'Shounen', 'Сёнэн', 'shounen'),
('Isekai', 'Isekai', 'Исекай', 'isekai'),
('Romantika', 'Romance', 'Романтика', 'romance'),
('Komediya', 'Comedy', 'Комедия', 'comedy'),
('Sarguzasht', 'Adventure', 'Приключения', 'adventure'),
('Misteriya / Detektiv', 'Mystery', 'Детектив', 'mystery'),
('Drama', 'Drama', 'Драма', 'drama'),
('Kiberpank / Ilmiy-fantastik', 'Sci-Fi', 'Фантастика', 'sci-fi')
ON CONFLICT (slug) DO NOTHING;

-- Payment Settings Seed
INSERT INTO payment_settings (card_number, card_holder, bank_name, instruction_uz)
VALUES ('8600 4904 1234 5678', 'IBROHIM G‘OFUROV', 'Kapitalbank / Uzcard', 'Kartaga pul o‘tkazib, chek skrinshotini yuklang. 5-15 daqiqa ichida VIP profilingiz faollashadi.')
ON CONFLICT DO NOTHING;

-- VIP Plans Seed
INSERT INTO vip_plans (name, days, price_uzs, badge, is_active) VALUES
('1 Oylik VIP', 30, 15000, 'Tejamkor', true),
('3 Oylik VIP', 90, 39000, '🔥 Eng Mashhur', true),
('6 Oylik VIP', 180, 69000, 'Super Chegirma', true),
('1 Yillik VIP', 365, 120000, '👑 VIP Cheksiz', true)
ON CONFLICT DO NOTHING;

-- Sample Anime Data
INSERT INTO animes (title, original_title, slug, description, poster_url, trailer_video_url, rating, views_count, is_vip, free_at, status, release_year) VALUES
(
    'Solo Leveling: Arise', 
    '俺だけレベルアップな件', 
    'solo-leveling-arise', 
    'Dunyodagi eng zaif ovchi Sung Jin-Woo kutilmagan sirli qo‘shaloq zindonda o‘lim yoqasiga kelib qoladi. U yagona tizim o‘yinchisiga aylanib, dunyoning eng qudratli soyalar hukmdori bo‘lish yo‘lini boshlaydi.',
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    9.8,
    142500,
    false,
    NULL,
    'ongoing',
    2024
),
(
    'Jujutsu Kaisen: Shibuya Incident', 
    '呪術廻戦', 
    'jujutsu-kaisen-shibuya', 
    'Shibuya ko‘chalarida la’natlar qiroli Sukuna va eng kuchli afsungar Gojo Satoru o‘rtasida tarixiy to‘qnashuv boshlanadi. Itadori Yuji va uning do‘stlari insoniyat taqdirini qutqarishga majbur.',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    9.6,
    98200,
    false,
    NULL,
    'completed',
    2023
),
(
    'Demon Slayer: Hashira Training Arc', 
    '鬼滅の刃 柱稽古編', 
    'demon-slayer-hashira-training', 
    'Muzan Kibutsujiga qarshi so‘nggi jangga tayyorgarlik ko‘rish uchun Tanjuro va do‘stlari barcha Hashiralar (Ustunlar) boshchiligidagi o‘ta og‘ir mashg‘ulotlarga kirishadilar.',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    9.4,
    85400,
    true,
    NOW() + INTERVAL '7 days',
    'ongoing',
    2024
),
(
    'Chainsaw Man: Reze Arc Movie', 
    'チェンソーマン', 
    'chainsaw-man-reze-arc', 
    'Denji sirli va jozibador qiz Reze bilan tanishadi. Ammo uning asl shaxsi va Denji yuragini egallash maqsadi butun shaharni portlashlar girdobiga tortadi.',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    9.2,
    72100,
    true,
    NOW() + INTERVAL '14 days',
    'ongoing',
    2024
),
(
    'Frieren: Beyond Journey’s End', 
    '葬送のフリーレン', 
    'frieren-beyond-journeys-end', 
    'Dahshatli Demon qiroli mag‘lub etilgach, ming yillik elf sehrgar Frieren do‘stlari bilan xayrlashib, insonlar tuyg‘ulari va hayot mazmunini anglash uchun yangi sayohatga chiqadi.',
    'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    9.7,
    115300,
    false,
    NULL,
    'completed',
    2024
),
(
    'Bleach: Thousand-Year Blood War Part 3', 
    'BLEACH 千年血戦篇', 
    'bleach-thousand-year-blood-war', 
    'Quincy imperatori Yhwach Ruhlar jamiyatini zabt etishga intilmoqda. Kurosaki Ichigo o‘zining asl kuchlarini uyg‘otib, eng qonli to‘qnashuvga kirishadi.',
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    9.5,
    64000,
    true,
    NOW() + INTERVAL '3 days',
    'ongoing',
    2024
);

-- Anime Genres linking
INSERT INTO anime_genres (anime_id, genre_id) VALUES
(1, 1), (1, 2), (1, 3),
(2, 1), (2, 2), (2, 3),
(3, 1), (3, 2), (3, 3),
(4, 1), (4, 10), (4, 9),
(5, 2), (5, 7), (5, 9),
(6, 1), (6, 2), (6, 3)
ON CONFLICT DO NOTHING;

-- Episodes Seed
INSERT INTO episodes (anime_id, episode_number, title, video_url, thumbnail_url, duration_seconds) VALUES
(1, 1, '1-Qism: Men o‘zgarishim kerak', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400', 1420),
(1, 2, '2-Qism: Qo‘shaloq zindon siri', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400', 1450),
(1, 3, '3-Qism: Kundalik topshiriqlar', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400', 1410),
(2, 1, '1-Qism: Shibuya darvozasi', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400', 1390),
(2, 2, '2-Qism: Gojo Satoruning kuchi', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400', 1430),
(3, 1, '1-Qism: Ustunlar mashg‘uloti boshlanishi', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400', 1480),
(4, 1, '1-Qism: Bomba qiz', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400', 1500),
(5, 1, '1-Qism: Qahramonlar davrining intihosi', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'https://images.unsplash.com/photo-1563089145-599997674d42?w=400', 1440),
(6, 1, '1-Qism: Yhwach hujumi', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=400', 1420)
ON CONFLICT DO NOTHING;

-- Forum Topics Seed (Mulohazalar)
INSERT INTO forum_topics (user_id, anime_id, title, content, category, likes_count, comments_count) VALUES
(
    1,
    1,
    'Sung Jin-Woo eng kuchli monarx bo‘la oladimi?',
    'Solo Leveling 2-mavsumida Jin-Wooning qobiliyatlari qanchalik rivojlanadi? Uning eng sevimli soyasi (Igris, Beru yoki Iron) qaysi deb o‘ylaysiz? Fikrlaringizni qoldiring!',
    'Muhokama',
    42,
    8
),
(
    2,
    5,
    'Frieren: Nega bu anime zamonaviy klassika hisoblanmoqda?',
    'Frieren animatsiyasi, musiqasi va xarakterlar psixologiyasi juda chuqur yoritilgan. Har bir epizod inson vaqtining qadrini ko‘rsatib beradi.',
    'Tahlil',
    29,
    5
),
(
    1,
    NULL,
    '2024-2025 yillarda qaysi yangi animelarni kutyapsiz?',
    'Kelgusi mavsumda eng kutilayotgan animelar ro‘yxatini tuzamiz. Chainsaw Man Reze filmi va One Punch Man 3-mavsumi haqida nima deysiz?',
    'Umumiy',
    35,
    12
)
ON CONFLICT DO NOTHING;
