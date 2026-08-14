import { getExportScopeConfig } from '../config/exportScopeConfigs';
import { SCOPE_MODE } from '../components/export/exportScopeTypes';

/**
 * Count records for the selected export scope (preview in modal).
 */
export async function countExportRecords({ pageId, pageContext, scopeMode, selectedEntity }) {
  const config = typeof pageId === 'object' ? pageId : getExportScopeConfig(pageId, pageContext);
  if (!config?.countRecords) {
    return pageContext?.data?.length ?? 0;
  }
  return config.countRecords({ scopeMode, selectedEntity, pageContext });
}

/**
 * Resolve the full dataset for export based on explicit user scope.
 */
export async function resolveExportDataset({ pageId, pageContext, scopeMode, selectedEntity }) {
  const config = typeof pageId === 'object' ? pageId : getExportScopeConfig(pageId, pageContext);
  if (!config) {
    throw new Error(`No export scope config for page: ${pageId}`);
  }

  if (!scopeMode) {
    throw new Error('Export scope is required');
  }

  if (scopeMode === SCOPE_MODE.ENTITY && !selectedEntity) {
    throw new Error('Entity selection is required');
  }

  return config.resolveDataset({ scopeMode, selectedEntity, pageContext });
}

export default resolveExportDataset;
