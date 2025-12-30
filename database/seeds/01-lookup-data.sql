-- ============================================
-- Seed Data: Lookup Tables
-- ============================================
-- Purpose: Insert reference data for lookup tables
-- Dependencies: 02-lookup-tables.sql
-- Author: Database Administration Team
-- Version: 2.0
-- Last Updated: 2025-12-15
-- ============================================

BEGIN;

-- ============================================
-- CONVERSATION MODES
-- ============================================

INSERT INTO conversation_modes (code, name_ar, name_fr, name_en, description, is_active) VALUES
  ('AUTO', 'تلقائي', 'Automatique', 'Automatic', 'AI automatically decides between RAG API and SUPPORT', true),
  ('SUPPORT', 'دعم متخصص', 'Support', 'Support', 'Direct human support ticket creation', true)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  name_en = EXCLUDED.name_en,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- ============================================
-- CONVERSATION STATUSES
-- ============================================

INSERT INTO conversation_statuses (code, name_ar, name_fr, name_en, is_terminal, description) VALUES
  ('active', 'نشط', 'Actif', 'Active', false, 'Conversation is ongoing'),
  ('archived', 'مؤرشف', 'Archivé', 'Archived', true, 'Conversation has been archived'),
  ('escalated', 'تم التصعيد', 'Escaladé', 'Escalated', false, 'Conversation escalated to support'),
  ('closed', 'مغلق', 'Fermé', 'Closed', true, 'Conversation is closed')
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  name_en = EXCLUDED.name_en,
  is_terminal = EXCLUDED.is_terminal,
  description = EXCLUDED.description;

-- ============================================
-- TICKET CATEGORIES
-- ============================================

INSERT INTO ticket_categories (code, name_ar, name_fr, name_en, description, icon, sort_order, is_active) VALUES
  ('crisis', 'أزمة', 'Crise', 'Crisis', 'Immediate crisis intervention needed', '🆘', 0, true),
  ('addiction', 'الإدمان', 'Dépendance', 'Addiction', 'Drug addiction support and counseling', '💊', 1, true),
  ('mental_health', 'الصحة النفسية', 'Santé mentale', 'Mental Health', 'Mental health support', '🧠', 2, true),
  ('prevention', 'الوقاية', 'Prévention', 'Prevention', 'Prevention and education', '🛡️', 3, true),
  ('resources', 'الموارد', 'Ressources', 'Resources', 'Information about resources and services', '📚', 4, true),
  ('family_support', 'دعم الأسرة', 'Soutien familial', 'Family Support', 'Support for families affected by addiction', '👨‍👩‍👧‍👦', 5, true),
  ('relapse', 'الانتكاس', 'Rechute', 'Relapse', 'Relapse prevention and support', '🔄', 6, true),
  ('general', 'عام', 'Général', 'General', 'General inquiries', '💬', 7, true)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  name_en = EXCLUDED.name_en,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- ============================================
-- TICKET PRIORITIES
-- ============================================

INSERT INTO ticket_priorities (code, name_ar, name_fr, name_en, level, color, sla_hours) VALUES
  ('low', 'منخفض', 'Bas', 'Low', 1, '#28a745', 72),
  ('medium', 'متوسط', 'Moyen', 'Medium', 2, '#ffc107', 24),
  ('high', 'عالي', 'Élevé', 'High', 3, '#fd7e14', 8),
  ('urgent', 'عاجل', 'Urgent', 'Urgent', 4, '#dc3545', 2)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  name_en = EXCLUDED.name_en,
  level = EXCLUDED.level,
  color = EXCLUDED.color,
  sla_hours = EXCLUDED.sla_hours;

-- ============================================
-- TICKET STATUSES
-- ============================================

INSERT INTO ticket_statuses (code, name_ar, name_fr, name_en, is_open, is_terminal) VALUES
  ('open', 'مفتوح', 'Ouvert', 'Open', true, false),
  ('in_progress', 'قيد المعالجة', 'En cours', 'In Progress', true, false),
  ('pending', 'معلق', 'En attente', 'Pending', true, false),
  ('resolved', 'تم الحل', 'Résolu', 'Resolved', false, true),
  ('closed', 'مغلق', 'Fermé', 'Closed', false, true),
  ('cancelled', 'ملغى', 'Annulé', 'Cancelled', false, true)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  name_en = EXCLUDED.name_en,
  is_open = EXCLUDED.is_open,
  is_terminal = EXCLUDED.is_terminal;

-- ============================================
-- VERIFICATION
-- ============================================

DO $$
DECLARE
  mode_count INTEGER;
  status_count INTEGER;
  category_count INTEGER;
  priority_count INTEGER;
  ticket_status_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO mode_count FROM conversation_modes;
  SELECT COUNT(*) INTO status_count FROM conversation_statuses;
  SELECT COUNT(*) INTO category_count FROM ticket_categories;
  SELECT COUNT(*) INTO priority_count FROM ticket_priorities;
  SELECT COUNT(*) INTO ticket_status_count FROM ticket_statuses;
  
  RAISE NOTICE 'Seed data inserted successfully:';
  RAISE NOTICE '  - Conversation modes: %', mode_count;
  RAISE NOTICE '  - Conversation statuses: %', status_count;
  RAISE NOTICE '  - Ticket categories: %', category_count;
  RAISE NOTICE '  - Ticket priorities: %', priority_count;
  RAISE NOTICE '  - Ticket statuses: %', ticket_status_count;
END $$;

COMMIT;

-- ============================================
-- END OF SEED DATA
-- ============================================
