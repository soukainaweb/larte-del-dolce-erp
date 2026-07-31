import { supabase } from '../lib/supabase';

const PROPERTIES_TABLE = 'properties';

/**
 * @typedef {Object} Property
 * @property {string} id
 * @property {string} title
 * @property {string|null} [description]
 * @property {number} price
 * @property {string} city
 * @property {string|null} [address]
 * @property {number|null} [bedrooms]
 * @property {number|null} [bathrooms]
 * @property {number|null} [area]
 * @property {string|null} [image_url]
 * @property {string} [created_at]
 */

/**
 * @typedef {Object} PropertyInput
 * @property {string} title
 * @property {string} [description]
 * @property {number} price
 * @property {string} city
 * @property {string} [address]
 * @property {number} [bedrooms]
 * @property {number} [bathrooms]
 * @property {number} [area]
 * @property {string} [image_url]
 */

const getClient = () => {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env'
    );
  }
  return supabase;
};

const throwIfError = (error, action) => {
  if (error) {
    throw new Error(error.message || `Supabase error while ${action}`);
  }
};

/**
 * Fetch all properties, newest first.
 * @param {{ orderBy?: string, ascending?: boolean }} [options]
 * @returns {Promise<Property[]>}
 */
export async function fetchProperties({ orderBy = 'created_at', ascending = false } = {}) {
  const client = getClient();

  const { data, error } = await client
    .from(PROPERTIES_TABLE)
    .select('*')
    .order(orderBy, { ascending });

  throwIfError(error, 'fetching properties');
  return data ?? [];
}

/**
 * Insert a new property row.
 * @param {PropertyInput} property
 * @returns {Promise<Property>}
 */
export async function addProperty(property) {
  const client = getClient();

  const { data, error } = await client
    .from(PROPERTIES_TABLE)
    .insert(property)
    .select()
    .single();

  throwIfError(error, 'adding property');
  return data;
}

/**
 * Update an existing property by id.
 * @param {string} id
 * @param {Partial<PropertyInput>} updates
 * @returns {Promise<Property>}
 */
export async function updateProperty(id, updates) {
  const client = getClient();

  const { data, error } = await client
    .from(PROPERTIES_TABLE)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  throwIfError(error, 'updating property');
  return data;
}

/**
 * Delete a property by id.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteProperty(id) {
  const client = getClient();

  const { error } = await client.from(PROPERTIES_TABLE).delete().eq('id', id);

  throwIfError(error, 'deleting property');
}

export default {
  fetchProperties,
  addProperty,
  updateProperty,
  deleteProperty,
};
