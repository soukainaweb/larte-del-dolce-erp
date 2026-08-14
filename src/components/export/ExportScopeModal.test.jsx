import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExportScopeModal from './ExportScopeModal';
import { SCOPE_MODE } from './exportScopeTypes';

vi.mock('../../utils/resolveExportDataset', () => ({
  countExportRecords: vi.fn().mockResolvedValue(5),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

const baseConfig = {
  pageId: 'orders',
  entityKind: 'customer',
  recordKind: 'order',
  modes: [SCOPE_MODE.ENTITY, SCOPE_MODE.ALL, SCOPE_MODE.FILTERS],
  searchEntities: vi.fn().mockResolvedValue([{ id: 1, label: 'Ahmed', raw: { id: 1, name: 'Ahmed' } }]),
  hasActiveFilters: () => true,
};

describe('ExportScopeModal', () => {
  beforeEach(() => {
    cleanup();
  });

  it('disables confirm when no scope is selected', () => {
    render(
      <ExportScopeModal
        isOpen
        onClose={() => {}}
        onConfirm={() => {}}
        scopeConfig={baseConfig}
        pageContext={{}}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('button', { name: 'exportScope.confirmExport' })).toBeDisabled();
  });

  it('disables confirm for entity mode without selected entity', async () => {
    const user = userEvent.setup();
    render(
      <ExportScopeModal
        isOpen
        onClose={() => {}}
        onConfirm={() => {}}
        scopeConfig={baseConfig}
        pageContext={{}}
      />
    );

    const dialog = screen.getByRole('dialog');
    const radios = within(dialog).getAllByRole('radio');
    await user.click(radios[0]);

    expect(within(dialog).getByRole('button', { name: 'exportScope.confirmExport' })).toBeDisabled();
  });

  it('allows confirm after export all is selected and count loads', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ExportScopeModal
        isOpen
        onClose={() => {}}
        onConfirm={onConfirm}
        scopeConfig={baseConfig}
        pageContext={{}}
      />
    );

    const dialog = screen.getByRole('dialog');
    const radios = within(dialog).getAllByRole('radio');
    await user.click(radios[1]);

    const confirmButton = await within(dialog).findByRole('button', { name: 'exportScope.confirmExport' });
    expect(confirmButton).not.toBeDisabled();

    await user.click(confirmButton);
    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ scopeMode: SCOPE_MODE.ALL, count: 5 })
    );
  });
});
