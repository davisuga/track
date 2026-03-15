CREATE TABLE IF NOT EXISTS public.category_spend_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (
    category = ANY (ARRAY['food', 'fuel', 'office-supplies', 'cleaning', 'other'])
  ),
  max_receipt_amount numeric(10, 2) NOT NULL CHECK (max_receipt_amount > 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE (company_id, category)
);

CREATE INDEX IF NOT EXISTS idx_category_spend_limits_company
  ON public.category_spend_limits (company_id);

ALTER TABLE public.receipts
  ADD COLUMN IF NOT EXISTS vendor_tax_id text,
  ADD COLUMN IF NOT EXISTS vendor_tax_id_valid boolean NOT NULL DEFAULT false;

INSERT INTO public.category_spend_limits (company_id, category, max_receipt_amount)
SELECT
  companies.id,
  defaults.category,
  defaults.max_receipt_amount
FROM public.companies
CROSS JOIN (
  VALUES
    ('food', 50.00::numeric),
    ('fuel', 150.00::numeric),
    ('office-supplies', 120.00::numeric),
    ('cleaning', 90.00::numeric),
    ('other', 75.00::numeric)
) AS defaults(category, max_receipt_amount)
ON CONFLICT (company_id, category) DO NOTHING;
