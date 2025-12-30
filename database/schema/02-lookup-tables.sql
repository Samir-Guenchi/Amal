-- ============================================
-- Lookup Tables (Reference Data)
-- ============================================
-- Purpose: Store reference data for foreign keys
-- Dependencies: 01-domains.sql
-- Author: Database Administration Team
-- Version: 2.0
-- Last Updated: 2025-12-15
-- ============================================

-- Conversation modes
CREATE TABLE IF NOT EXISTS conversation_modes (
  code VARCHAR(20) PRIMARY KEY,
  name_ar VARCHAR(100) NOT NULL,
  name_fr VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE conversation_modes IS 'Available conversation modes';
COMMENT ON COLUMN conversation_modes.code IS 'Unique mode identifier';

INSERT INTO conversation_modes (code, name_ar, name_fr, name_en, description) VALUES
  ('AUTO', 'تلقائي', 'Automatique', 'Automatic', 'AI decides between external RAG API and SUPPORT'),
  ('SUPPORT', 'دعم متخصص', 'Support', 'Support', 'Human support ticket mode')
ON CONFLICT (code) DO NOTHING;

-- Conversation statuses
CREATE TABLE IF NOT EXISTS conversation_statuses (
  code VARCHAR(20) PRIMARY KEY,
  name_ar VARCHAR(100) NOT NULL,
  name_fr VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  description TEXT,
  is_terminal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE conversation_statuses IS 'Conversation lifecycle statuses';

INSERT INTO conversation_statuses (code, name_ar, name_fr, name_en, is_terminal) VALUES
  ('active', 'نشط', 'Actif', 'Active', false),
  ('archived', 'مؤرشف', 'Archivé', 'Archived', true),
  ('escalated', 'تم التصعيد', 'Escaladé', 'Escalated', false),
  ('closed', 'مغلق', 'Fermé', 'Closed', true)
ON CONFLICT (code) DO NOTHING;

-- Support ticket categories
CREATE TABLE IF NOT EXISTS ticket_categories (
  code VARCHAR(50) PRIMARY KEY,
  name_ar VARCHAR(100) NOT NULL,
  name_fr VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE ticket_categories IS 'Support ticket categories';

INSERT INTO ticket_categories (code, name_ar, name_fr, name_en, icon, sort_order) VALUES
  ('crisis', 'أزمة', 'Crise', 'Crisis', '🆘', 0),
  ('addiction', 'الإدمان', 'Dépendance', 'Addiction', '💊', 1),
  ('mental_health', 'الصحة النفسية', 'Santé mentale', 'Mental Health', '🧠', 2),
  ('prevention', 'الوقاية', 'Prévention', 'Prevention', '🛡️', 3),
  ('resources', 'الموارد', 'Ressources', 'Resources', '📚', 4),
  ('other', 'أخرى', 'Autre', 'Other', '📋', 5)
ON CONFLICT (code) DO NOTHING;

-- Support ticket priorities
CREATE TABLE IF NOT EXISTS ticket_priorities (
  code VARCHAR(20) PRIMARY KEY,
  name_ar VARCHAR(50) NOT NULL,
  name_fr VARCHAR(50) NOT NULL,
  name_en VARCHAR(50) NOT NULL,
  level INTEGER NOT NULL UNIQUE,
  color VARCHAR(7),
  sla_hours INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE ticket_priorities IS 'Support ticket priority levels with SLA';
COMMENT ON COLUMN ticket_priorities.sla_hours IS 'Service Level Agreement response time in hours';

INSERT INTO ticket_priorities (code, name_ar, name_fr, name_en, level, color, sla_hours) VALUES
  ('low', 'منخفض', 'Bas', 'Low', 1, '#28a745', 72),
  ('medium', 'متوسط', 'Moyen', 'Medium', 2, '#ffc107', 24),
  ('high', 'عالي', 'Élevé', 'High', 3, '#fd7e14', 8),
  ('urgent', 'عاجل', 'Urgent', 'Urgent', 4, '#dc3545', 2)
ON CONFLICT (code) DO NOTHING;

-- Support ticket statuses
CREATE TABLE IF NOT EXISTS ticket_statuses (
  code VARCHAR(20) PRIMARY KEY,
  name_ar VARCHAR(50) NOT NULL,
  name_fr VARCHAR(50) NOT NULL,
  name_en VARCHAR(50) NOT NULL,
  is_open BOOLEAN DEFAULT true,
  is_terminal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE ticket_statuses IS 'Support ticket workflow statuses';

INSERT INTO ticket_statuses (code, name_ar, name_fr, name_en, is_open, is_terminal) VALUES
  ('open', 'مفتوح', 'Ouvert', 'Open', true, false),
  ('in_progress', 'قيد المعالجة', 'En cours', 'In Progress', true, false),
  ('pending', 'معلق', 'En attente', 'Pending', true, false),
  ('resolved', 'تم الحل', 'Résolu', 'Resolved', false, true),
  ('closed', 'مغلق', 'Fermé', 'Closed', false, true)
ON CONFLICT (code) DO NOTHING;

-- Log lookup table creation
DO $$
BEGIN
  RAISE NOTICE 'Lookup tables created and seeded successfully';
  RAISE NOTICE 'conversation_modes: 2 modes (AUTO, SUPPORT)';
  RAISE NOTICE 'conversation_statuses: 4 statuses';
  RAISE NOTICE 'ticket_categories: 6 categories';
  RAISE NOTICE 'ticket_priorities: 4 priorities with SLA';
  RAISE NOTICE 'ticket_statuses: 5 statuses';
END $$;
