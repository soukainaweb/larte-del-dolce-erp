import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { ENTITY_DETAIL_CONFIG } from '../config/entityDetailRoutes';

/**
 * Resolves /dashboard/{module}/:id by redirecting to the list page
 * and opening the existing detail modal via location.state.
 */
const EntityDetailRedirect = ({ module }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);

  const config = ENTITY_DETAIL_CONFIG[module];

  useEffect(() => {
    if (!config?.listPath) {
      navigate('/dashboard', { replace: true });
      return;
    }

    if (!id) {
      navigate(config.listPath, { replace: true });
      return;
    }

    let cancelled = false;

    const resolve = async () => {
      try {
        if (config.fetch) {
          await config.fetch(id);
        }
        if (cancelled) return;

        navigate(config.listPath, {
          replace: true,
          state: { [config.viewStateKey]: id },
        });
      } catch {
        if (cancelled) return;
        setFailed(true);
        window.setTimeout(() => {
          navigate(config.listPath, { replace: true });
        }, 1200);
      }
    };

    resolve();

    return () => {
      cancelled = true;
    };
  }, [config, id, module, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
      {!failed ? (
        <>
          <Loader2 className="animate-spin text-[#B8863B]" size={36} />
          <p className="mt-4 text-sm text-[#6D6D6D]">{t('common.loading')}</p>
        </>
      ) : (
        <p className="text-sm text-[#6D6D6D]">{t('errors.notFound')}</p>
      )}
    </div>
  );
};

export default EntityDetailRedirect;
