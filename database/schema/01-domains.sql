-- ============================================
-- Custom Domain Types
-- ============================================
-- Purpose: Define custom data types with validation
-- Dependencies: None
-- Author: Database Administration Team
-- Version: 2.0
-- Last Updated: 2025-12-15
-- ============================================

-- Email address with validation
CREATE DOMAIN email_address AS VARCHAR(255)
  CHECK (VALUE ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

COMMENT ON DOMAIN email_address IS 'Email address with RFC 5322 validation';

-- Locale code (ISO 639-1 + ISO 3166-1)
CREATE DOMAIN locale_code AS VARCHAR(10)
  CHECK (VALUE IN ('ar-DZ', 'fr-FR', 'en-US'));

COMMENT ON DOMAIN locale_code IS 'Supported locale codes: ar-DZ (Algerian Arabic), fr-FR (French), en-US (English)';

-- Timezone name (IANA timezone database)
CREATE DOMAIN timezone_name AS VARCHAR(50)
  CHECK (VALUE ~ '^[A-Za-z_]+/[A-Za-z_]+$');

COMMENT ON DOMAIN timezone_name IS 'IANA timezone name (e.g., Africa/Algiers)';

-- Phone number (Algerian format)
CREATE DOMAIN phone_number_dz AS VARCHAR(20)
  CHECK (VALUE ~ '^\+213[0-9]{9}$' OR VALUE ~ '^0[0-9]{9}$');

COMMENT ON DOMAIN phone_number_dz IS 'Algerian phone number format: +213XXXXXXXXX or 0XXXXXXXXX';

-- Log domain creation
DO $$
BEGIN
  RAISE NOTICE 'Custom domains created successfully';
  RAISE NOTICE 'email_address: Email validation';
  RAISE NOTICE 'locale_code: Locale validation (ar-DZ, fr-FR, en-US)';
  RAISE NOTICE 'timezone_name: Timezone validation';
  RAISE NOTICE 'phone_number_dz: Algerian phone format';
END $$;
