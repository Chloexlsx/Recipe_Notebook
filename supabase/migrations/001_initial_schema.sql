-- Enable UUID extension if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create recipes table
CREATE TABLE IF NOT EXISTS public.recipes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  cook_time_mins INTEGER NOT NULL,
  culture VARCHAR(100) NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  link TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create notes table
CREATE TABLE IF NOT EXISTS public.notes (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  feedback TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create ingredients table
CREATE TABLE IF NOT EXISTS public.ingredients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id SERIAL PRIMARY KEY,
  ingredient_id INTEGER NOT NULL REFERENCES public.ingredients(id) ON DELETE RESTRICT,
  location TEXT NOT NULL CHECK (location IN ('fridge', 'freezer', 'pantry')),
  quantity NUMERIC(12, 3) NOT NULL CHECK (quantity >= 0),
  unit VARCHAR(20) NOT NULL,
  purchase_date DATE,
  expiry_date DATE,
  opened BOOLEAN NOT NULL DEFAULT false,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS trg_recipes_set_updated_at ON public.recipes;
CREATE TRIGGER trg_recipes_set_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_notes_set_updated_at ON public.notes;
CREATE TRIGGER trg_notes_set_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_ingredients_set_updated_at ON public.ingredients;
CREATE TRIGGER trg_ingredients_set_updated_at
  BEFORE UPDATE ON public.ingredients
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_inventory_items_set_updated_at ON public.inventory_items;
CREATE TRIGGER trg_inventory_items_set_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notes_recipe_id ON public.notes(recipe_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_ingredient_id ON public.inventory_items(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_location ON public.inventory_items(location);
CREATE INDEX IF NOT EXISTS idx_inventory_items_expiry_date ON public.inventory_items(expiry_date);
CREATE INDEX IF NOT EXISTS idx_inventory_items_location_expiry ON public.inventory_items(location, expiry_date);
