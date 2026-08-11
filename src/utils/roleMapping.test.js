import { describe, expect, it, beforeAll } from 'vitest';
import i18n from '../i18n';
import { translateRoleLabel } from './roleMapping';

describe('translateRoleLabel', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('ar');
  });

  it('uses distinct Arabic labels for admin and responsible', () => {
    const adminLabel = translateRoleLabel({ name: 'admin', display_name: 'Administrator' });
    const responsibleLabel = translateRoleLabel({ name: 'responsible', display_name: 'Responsible' });

    expect(adminLabel).toBe('المسؤول');
    expect(responsibleLabel).toBe('مسؤول الاعتماد');
    expect(adminLabel).not.toBe(responsibleLabel);
  });
});
