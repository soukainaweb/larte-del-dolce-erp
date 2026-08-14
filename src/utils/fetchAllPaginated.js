import { unwrapPaginated } from './apiHelpers';

/**
 * Fetch every page from a paginated list API.
 * @param {Function} fetchPage - async ({ page, per_page, ...params }) => axios response or { data, meta }
 * @param {Object} baseParams - filters applied to every page request
 * @param {number} pageSize - per_page size (default 100)
 * @returns {Promise<{ items: Array, total: number }>}
 */
export async function fetchAllPaginated(fetchPage, baseParams = {}, pageSize = 100) {
  let page = 1;
  let allItems = [];
  let total = null;

  while (true) {
    const response = await fetchPage({
      ...baseParams,
      page,
      per_page: pageSize,
    });

    const { items, meta } = unwrapPaginated(response);
    const pageItems = Array.isArray(items) ? items : [];

    if (total == null) {
      total = meta?.total ?? pageItems.length;
    }

    allItems = allItems.concat(pageItems);

    if (pageItems.length === 0 || allItems.length >= total) {
      break;
    }

    page += 1;

    if (page > 500) {
      break;
    }
  }

  return { items: allItems, total: total ?? allItems.length };
}

export default fetchAllPaginated;
