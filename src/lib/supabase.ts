import { createClient } from '@supabase/supabase-js';
import type { NewAssociate, ExistingAssociateUpdate, BenefitStatus } from '../types';

// Credenciales desde variables de entorno de Vite
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('TU_SUPABASE_URL')) {
    return null;
  }
  try {
    const parsed = new URL(supabaseUrl);
    if (!parsed.protocol.startsWith('http')) return null;
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.warn('URL de Supabase inválida o no configurada, operando en modo local:', err);
    return null;
  }
}

export const supabase = getSupabaseClient();
export const isSupabaseConfigured = Boolean(supabase !== null);

// Claves locales para almacenamiento cuando Supabase no está conectado
const LOCAL_STORAGE_NEW_KEY = 'pmd_new_associates_v2';
const LOCAL_STORAGE_EXISTING_KEY = 'pmd_existing_updates_v2';

// Datos semilla de ejemplo si no hay nada guardado
const DEFAULT_NEW_ASSOCIATES: NewAssociate[] = [
  {
    id: 'demo-1',
    first_name: 'Carlos Andrés',
    last_name: 'Restrepo Gómez',
    doc_type: 'CC',
    doc_number: '1020345678',
    phone: '3104567890',
    email: 'carlos.restrepo@example.com',
    department: 'Antioquia',
    municipality: 'Medellín',
    address: 'Calle 50 # 45-20, Laureles',
    habeas_data: true,
    certificate_folio: 'PMD-COL-2024-8921',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    benefit_status: 'DELIVERED',
    benefit_type: 'Canasta de Alimentos Mensual',
    benefit_notes: 'Paquete alimentario #1 entregado en centro de acopio comunal',
    benefit_date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'demo-2',
    first_name: 'María Elena',
    last_name: 'Torres Benítez',
    doc_type: 'PPT',
    doc_number: '984512345',
    phone: '3209876543',
    email: 'maria.torres@example.com',
    department: 'Cundinamarca',
    municipality: 'Bogotá D.C.',
    address: 'Carrera 15 # 85-30',
    habeas_data: true,
    certificate_folio: 'PMD-COL-2024-9145',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    benefit_status: 'IN_PROCESS',
    benefit_type: 'Vivienda Digna y Mejoramiento',
    benefit_notes: 'Postulación en validación de subsidio complementario',
    benefit_date: new Date().toISOString(),
  }
];

const DEFAULT_EXISTING_UPDATES: ExistingAssociateUpdate[] = [
  {
    id: 'demo-ext-1',
    full_name: 'Hernán Darío Valencia Moreno',
    doc_type: 'CC',
    doc_number: '71654321',
    phone: '3157891234',
    email: 'h.valencia@example.com',
    intl_account_number: 'ES91 2100 0418 4502 0005 1332',
    bank_name: 'CaixaBank Internacional',
    country_bank: 'España',
    swift_bic: 'CAIXESBBXXX',
    habeas_data: true,
    certificate_folio: 'PMD-INTL-2024-3310',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    benefit_status: 'DELIVERED',
    benefit_type: 'Programa PYMES Productivas',
    benefit_notes: 'Asignación de capital semilla cooperación bilateral desembolsado',
    benefit_date: new Date(Date.now() - 3600000 * 2).toISOString(),
  }
];

export async function saveNewAssociate(data: Omit<NewAssociate, 'id' | 'created_at'>): Promise<NewAssociate> {
  const newRecord: NewAssociate = {
    ...data,
    id: crypto.randomUUID ? crypto.randomUUID() : `pmd-${Date.now()}`,
    created_at: new Date().toISOString(),
    benefit_status: data.benefit_status || 'PENDING',
    benefit_type: data.benefit_type || '',
    benefit_notes: data.benefit_notes || '',
    benefit_date: data.benefit_date || undefined,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: inserted, error } = await supabase
        .from('new_associates')
        .insert([newRecord])
        .select()
        .single();
      
      if (!error && inserted) {
        return inserted as NewAssociate;
      }
      console.warn('Supabase error, guardando en local:', error);
    } catch (err) {
      console.warn('Error conectando a Supabase:', err);
    }
  }

  // Fallback LocalStorage
  const existing = getLocalNewAssociates();
  const updated = [newRecord, ...existing];
  localStorage.setItem(LOCAL_STORAGE_NEW_KEY, JSON.stringify(updated));
  return newRecord;
}

export async function saveExistingAssociateUpdate(
  data: Omit<ExistingAssociateUpdate, 'id' | 'created_at'>
): Promise<ExistingAssociateUpdate> {
  const newRecord: ExistingAssociateUpdate = {
    ...data,
    id: crypto.randomUUID ? crypto.randomUUID() : `pmd-ext-${Date.now()}`,
    created_at: new Date().toISOString(),
    benefit_status: data.benefit_status || 'PENDING',
    benefit_type: data.benefit_type || '',
    benefit_notes: data.benefit_notes || '',
    benefit_date: data.benefit_date || undefined,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: inserted, error } = await supabase
        .from('existing_associates_updates')
        .insert([newRecord])
        .select()
        .single();
      
      if (!error && inserted) {
        return inserted as ExistingAssociateUpdate;
      }
      console.warn('Supabase error, guardando en local:', error);
    } catch (err) {
      console.warn('Error conectando a Supabase:', err);
    }
  }

  // Fallback LocalStorage
  const existing = getLocalExistingUpdates();
  const updated = [newRecord, ...existing];
  localStorage.setItem(LOCAL_STORAGE_EXISTING_KEY, JSON.stringify(updated));
  return newRecord;
}

export async function updateNewAssociateBenefit(
  id: string,
  benefit: {
    benefit_status: BenefitStatus;
    benefit_type: string;
    benefit_notes: string;
    benefit_date: string;
  }
): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('new_associates')
        .update(benefit)
        .eq('id', id);
      if (!error) return true;
      console.warn('Error actualizando beneficio en Supabase:', error);
    } catch (err) {
      console.warn(err);
    }
  }

  const existing = getLocalNewAssociates();
  const updated = existing.map(item => item.id === id ? { ...item, ...benefit } : item);
  localStorage.setItem(LOCAL_STORAGE_NEW_KEY, JSON.stringify(updated));
  return true;
}

export async function updateExistingAssociateBenefit(
  id: string,
  benefit: {
    benefit_status: BenefitStatus;
    benefit_type: string;
    benefit_notes: string;
    benefit_date: string;
  }
): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('existing_associates_updates')
        .update(benefit)
        .eq('id', id);
      if (!error) return true;
      console.warn('Error actualizando beneficio en Supabase:', error);
    } catch (err) {
      console.warn(err);
    }
  }

  const existing = getLocalExistingUpdates();
  const updated = existing.map(item => item.id === id ? { ...item, ...benefit } : item);
  localStorage.setItem(LOCAL_STORAGE_EXISTING_KEY, JSON.stringify(updated));
  return true;
}

export async function fetchAllNewAssociates(): Promise<NewAssociate[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('new_associates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        return data as NewAssociate[];
      }
    } catch (err) {
      console.warn('Error leyendo Supabase:', err);
    }
  }
  return getLocalNewAssociates();
}

export async function fetchAllExistingUpdates(): Promise<ExistingAssociateUpdate[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('existing_associates_updates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        return data as ExistingAssociateUpdate[];
      }
    } catch (err) {
      console.warn('Error leyendo Supabase:', err);
    }
  }
  return getLocalExistingUpdates();
}

function getLocalNewAssociates(): NewAssociate[] {
  const item = localStorage.getItem(LOCAL_STORAGE_NEW_KEY);
  if (!item) {
    localStorage.setItem(LOCAL_STORAGE_NEW_KEY, JSON.stringify(DEFAULT_NEW_ASSOCIATES));
    return DEFAULT_NEW_ASSOCIATES;
  }
  try {
    return JSON.parse(item);
  } catch {
    return DEFAULT_NEW_ASSOCIATES;
  }
}

function getLocalExistingUpdates(): ExistingAssociateUpdate[] {
  const item = localStorage.getItem(LOCAL_STORAGE_EXISTING_KEY);
  if (!item) {
    localStorage.setItem(LOCAL_STORAGE_EXISTING_KEY, JSON.stringify(DEFAULT_EXISTING_UPDATES));
    return DEFAULT_EXISTING_UPDATES;
  }
  try {
    return JSON.parse(item);
  } catch {
    return DEFAULT_EXISTING_UPDATES;
  }
}

// Script SQL para copiar en Supabase
export const SUPABASE_SQL_SCHEMA = `-- ==============================================================
-- PROGRAMA COOPERACIÓN INTERNACIONAL COLOMBIA - GRUPO PMD SAS
-- TABLAS Y POLÍTICAS DE SUPABASE CON GESTIÓN DE BENEFICIOS
-- NIT: 901262947-1
-- ==============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabla de Nuevos Asociados
CREATE TABLE IF NOT EXISTS public.new_associates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    doc_type TEXT NOT NULL,
    doc_number TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    department TEXT NOT NULL,
    municipality TEXT NOT NULL,
    address TEXT NOT NULL,
    habeas_data BOOLEAN NOT NULL DEFAULT true,
    certificate_folio TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    benefit_status TEXT DEFAULT 'PENDING',
    benefit_type TEXT DEFAULT '',
    benefit_notes TEXT DEFAULT '',
    benefit_date TIMESTAMPTZ
);

-- Si la tabla ya existía, añadir las columnas de beneficios de forma segura
ALTER TABLE public.new_associates ADD COLUMN IF NOT EXISTS benefit_status TEXT DEFAULT 'PENDING';
ALTER TABLE public.new_associates ADD COLUMN IF NOT EXISTS benefit_type TEXT DEFAULT '';
ALTER TABLE public.new_associates ADD COLUMN IF NOT EXISTS benefit_notes TEXT DEFAULT '';
ALTER TABLE public.new_associates ADD COLUMN IF NOT EXISTS benefit_date TIMESTAMPTZ;

-- 2. Tabla de Actualización de Asociados y Cuentas Internacionales
CREATE TABLE IF NOT EXISTS public.existing_associates_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    doc_type TEXT NOT NULL,
    doc_number TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    intl_account_number TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    country_bank TEXT NOT NULL,
    swift_bic TEXT,
    habeas_data BOOLEAN NOT NULL DEFAULT true,
    certificate_folio TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    benefit_status TEXT DEFAULT 'PENDING',
    benefit_type TEXT DEFAULT '',
    benefit_notes TEXT DEFAULT '',
    benefit_date TIMESTAMPTZ
);

-- Si la tabla ya existía, añadir las columnas de beneficios de forma segura
ALTER TABLE public.existing_associates_updates ADD COLUMN IF NOT EXISTS benefit_status TEXT DEFAULT 'PENDING';
ALTER TABLE public.existing_associates_updates ADD COLUMN IF NOT EXISTS benefit_type TEXT DEFAULT '';
ALTER TABLE public.existing_associates_updates ADD COLUMN IF NOT EXISTS benefit_notes TEXT DEFAULT '';
ALTER TABLE public.existing_associates_updates ADD COLUMN IF NOT EXISTS benefit_date TIMESTAMPTZ;

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.new_associates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.existing_associates_updates ENABLE ROW LEVEL SECURITY;

-- Políticas de inserción y lectura pública / admin
CREATE POLICY "Permitir insercion publica en new_associates" 
ON public.new_associates FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir lectura en new_associates" 
ON public.new_associates FOR SELECT 
USING (true);

CREATE POLICY "Permitir actualizacion en new_associates" 
ON public.new_associates FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir insercion publica en existing_associates_updates" 
ON public.existing_associates_updates FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir lectura en existing_associates_updates" 
ON public.existing_associates_updates FOR SELECT 
USING (true);

CREATE POLICY "Permitir actualizacion en existing_associates_updates" 
ON public.existing_associates_updates FOR UPDATE 
USING (true)
WITH CHECK (true);
`;
