BEGIN;

CREATE TABLE IF NOT EXISTS public.inventory_items (
  id            integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  ingredient_id integer NOT NULL
                REFERENCES public.ingredients(id)
                ON DELETE RESTRICT,

  location      text NOT NULL
                CHECK (location IN ('fridge', 'freezer', 'pantry')),

  quantity      numeric(12, 3) NOT NULL
                CHECK (quantity >= 0),

  unit          varchar(20) NOT NULL,  -- g / ml / pcs ...

  purchase_date date,
  expiry_date   date,

  opened        boolean NOT NULL DEFAULT false,
  note          text,

  created_at    timestamp without time zone NOT NULL DEFAULT now(),
  updated_at    timestamp without time zone NOT NULL DEFAULT now()
);

-- 自動更新 updated_at（共用函式：之後其他表也可用）
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_inventory_items_set_updated_at ON public.inventory_items;

CREATE TRIGGER trg_inventory_items_set_updated_at
BEFORE UPDATE ON public.inventory_items
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 常用索引：查某食材、按地點、找快過期
CREATE INDEX IF NOT EXISTS idx_inventory_items_ingredient_id
  ON public.inventory_items (ingredient_id);

CREATE INDEX IF NOT EXISTS idx_inventory_items_location
  ON public.inventory_items (location);

CREATE INDEX IF NOT EXISTS idx_inventory_items_expiry_date
  ON public.inventory_items (expiry_date);

CREATE INDEX IF NOT EXISTS idx_inventory_items_location_expiry
  ON public.inventory_items (location, expiry_date);

COMMIT;
