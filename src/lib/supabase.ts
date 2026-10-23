import { createClient } from '@supabase/supabase-js';
import type { NewAssociate, ExistingAssociateUpdate } from '../types';

// Credenciales desde variables de entorno de Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('TU_SUPABASE_URL')
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Claves locales para almacenamiento cuando Supabase no está conectado
const LOCAL_STORAGE_NEW_KEY = 'pmd_new_associates';
const LOCAL_STORAGE_EXISTING_KEY = 'pmd_existing_updates';

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
  }
];

export async function saveNewAssociate(data: Omit<NewAssociate, 'id' | 'created_at'>): Promise<NewAssociate> {
  const newRecord: NewAssociate = {
    ...data,
    id: crypto.randomUUID ? crypto.randomUUID() : `pmd-${Date.now()}`,
    created_at: new Date().toISOString(),
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
-- TABLAS Y POLÍTICAS DE SUPABASE
-- NIT: 901262947-1
-- ==============================================================

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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.new_associates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.existing_associates_updates ENABLE ROW LEVEL SECURITY;

-- Políticas de inserción pública (los usuarios pueden registrarse y enviar formularios)
CREATE POLICY "Permitir insercion publica en new_associates" 
ON public.new_associates FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir insercion publica en existing_associates_updates" 
ON public.existing_associates_updates FOR INSERT 
WITH CHECK (true);

-- Políticas de lectura pública/admin
CREATE POLICY "Permitir lectura en new_associates" 
ON public.new_associates FOR SELECT 
USING (true);

CREATE POLICY "Permitir lectura en existing_associates_updates" 
ON public.existing_associates_updates FOR SELECT 
USING (true);
`;
