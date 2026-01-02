-- Add new columns to profiles table for extended doctor information
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS age integer,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS qualification text,
ADD COLUMN IF NOT EXISTS experience text,
ADD COLUMN IF NOT EXISTS nmc_id text,
ADD COLUMN IF NOT EXISTS working_days text[];