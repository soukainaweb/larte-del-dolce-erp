import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  CalendarDays,
  CalendarPlus,
  Clock,
  Download,
  History,
  Loader2,
  LogIn,
  Mail,
  User,
  Users,
  Video,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { unwrapData, getApiErrorMessage } from '../../utils/apiHelpers';
import { isAdminRole } from '../../utils/permissions';
import {
  cancelMeeting,
  downloadMeetingIcs,
  getGoogleCalendarUrl,
  getMeetingById,
  getMeetingHistory,
  scheduleMeeting,
  startMeeting,
} from '../../services/meetingService';

const FONT_HEADING = "'Cormorant Garamond', serif";
const FONT_BODY = "'Inter', sans-serif";
const DATE_LOCALE = 'ar-SA';

const StatusBadge = ({ status, t }) => {
  const map = {
    draft: 'bg-amber-50 text-amber-700 border-amber-200',
    scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    live: 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse',
    finished: 'bg-slate-50 text-slate-700 border-slate-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    completed: 'bg-slate-50 text-slate-700 border-slate-200',
  };
  const key = status === 'completed' ? 'finished' : status;
  return (
    <span className={`inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full border ${map[status] || map.scheduled}`}>
      {t(`meetings.status.${key}`, status)}
    </span>
  );
};

const InvitationBadge = ({ status, t }) => {
  const map = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    declined: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[status] || map.pending}`}>
      {t(`meetings.invitationStatus.${status}`, status)}
    </span>
  );
};

const canManageMeeting = (meeting, user) => {
  if (!meeting || !user) return false;
  if (isAdminRole(user.role)) return true;
  return Number(meeting.created_by) === Number(user.id);
};

const formatDateTime = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString(DATE_LOCALE, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const MeetingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [meeting, setMeeting] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  const isHost = useMemo(() => canManageMeeting(meeting, user), [meeting, user]);
  const isInvited = useMemo(() => {
    if (!meeting || !user) return false;
    if (isHost) return true;
    return (meeting.invitees || []).some((inv) => Number(inv.user_id) === Number(user.id));
  }, [meeting, user, isHost]);

  const canJoin = meeting?.status === 'live' && isInvited;
  const canStart = meeting?.status === 'scheduled' && isHost;
  const canSchedule = meeting?.status === 'draft' && isHost;
  const canCancel = meeting && isHost && !['finished', 'cancelled'].includes(meeting.status);

  const loadMeeting = useCallback(async () => {
    setLoading(true);
    try {
      const [meetingRes, historyRes] = await Promise.all([
        getMeetingById(id),
        getMeetingHistory(id),
      ]);
      setMeeting(unwrapData(meetingRes));
      setHistory(unwrapData(historyRes) || []);
    } catch (err) {
      showToast(getApiErrorMessage(err, t('meetings.errors.load')), 'error');
      setMeeting(null);
    } finally {
      setLoading(false);
    }
  }, [id, showToast, t]);

  useEffect(() => {
    loadMeeting();
  }, [loadMeeting]);

  const runAction = async (key, fn, successKey) => {
    setActionLoading(key);
    try {
      const res = await fn(id);
      if (res?.data) setMeeting(unwrapData(res) || meeting);
      showToast(t(successKey), 'success');
      await loadMeeting();
    } catch (err) {
      showToast(getApiErrorMessage(err, t('meetings.errors.save')), 'error');
    } finally {
      setActionLoading('');
    }
  };

  const handleSchedule = () => runAction('schedule', scheduleMeeting, 'meetings.messages.scheduled');
  const handleCancel = () => {
    if (!window.confirm(t('meetings.confirmCancel'))) return;
    runAction('cancel', cancelMeeting, 'meetings.messages.cancelled');
  };

  const handleStartAndJoin = async () => {
    setActionLoading('start');
    try {
      if (meeting.status === 'scheduled') {
        await startMeeting(id);
      }
      navigate(`/dashboard/meetings/${id}/room`);
    } catch (err) {
      showToast(getApiErrorMessage(err, t('meetings.errors.save')), 'error');
    } finally {
      setActionLoading('');
    }
  };

  const handleDownloadIcs = async () => {
    try {
      await downloadMeetingIcs(id);
      showToast(t('meetings.details.icsDownloaded'), 'success');
    } catch (err) {
      showToast(getApiErrorMessage(err, t('meetings.errors.save')), 'error');
    }
  };

  const googleCalendarUrl = meeting ? getGoogleCalendarUrl(meeting) : '';

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F8F7F4]" style={{ fontFamily: FONT_BODY }}>
        <div className="flex flex-col items-center gap-3 text-[#6D6D6D]">
          <Loader2 className="w-8 h-8 animate-spin text-[#B8863B]" />
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F8F7F4] p-6" style={{ fontFamily: FONT_BODY }}>
        <div className="max-w-md w-full bg-white border border-[#ECE8E1] rounded-2xl p-8 text-center">
          <p className="font-semibold text-[#3D2F24] mb-4">{t('meetings.details.notFound')}</p>
          <button type="button" onClick={() => navigate('/dashboard/meetings')}
            className="px-4 py-2 rounded-xl bg-[#B8863B] text-white text-sm">
            {t('meetings.room.backToList')}
          </button>
        </div>
      </div>
    );
  }

  const organizerName = meeting.creator
    ? `${meeting.creator.first_name || ''} ${meeting.creator.last_name || ''}`.trim() || meeting.creator.email
    : '—';

  return (
    <div className="w-full min-h-screen bg-[#F8F7F4] p-4 sm:p-6" style={{ fontFamily: FONT_BODY }}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-3">
            <button type="button" onClick={() => navigate('/dashboard/meetings')}
              className="inline-flex items-center gap-2 text-sm text-[#6D6D6D] hover:text-[#3D2F24]">
              <ArrowLeft size={16} />{t('meetings.room.backToList')}
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#3D2F24]" style={{ fontFamily: FONT_HEADING }}>
                  {meeting.title}
                </h1>
                <StatusBadge status={meeting.status} t={t} />
              </div>
              <p className="text-sm text-[#6D6D6D]">{t('meetings.details.subtitle')}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {canSchedule && (
              <button type="button" onClick={handleSchedule} disabled={!!actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm disabled:opacity-50">
                {actionLoading === 'schedule' ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                {t('meetings.actions.schedule')}
              </button>
            )}
            {canStart && (
              <button type="button" onClick={handleStartAndJoin} disabled={!!actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm disabled:opacity-50">
                {actionLoading === 'start' ? <Loader2 size={16} className="animate-spin" /> : <Video size={16} />}
                {t('meetings.room.startMeeting')}
              </button>
            )}
            {canJoin && (
              <button type="button" onClick={() => navigate(`/dashboard/meetings/${id}/room`)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B8863B] text-white text-sm">
                <LogIn size={16} />{t('meetings.room.joinMeeting')}
              </button>
            )}
            {canCancel && (
              <button type="button" onClick={handleCancel} disabled={!!actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-200 text-rose-700 text-sm disabled:opacity-50">
                {actionLoading === 'cancel' ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                {t('meetings.actions.cancel')}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white border border-[#ECE8E1] rounded-2xl p-5 sm:p-6">
              <h2 className="text-lg font-bold text-[#3D2F24] mb-4" style={{ fontFamily: FONT_HEADING }}>
                {t('meetings.details.information')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F8F7F4]">
                  <CalendarDays className="w-5 h-5 text-[#B8863B] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase text-[#6D6D6D] font-semibold">{t('common.date')}</p>
                    <p className="text-sm text-[#3D2F24]">
                      {meeting.meeting_date ? new Date(meeting.meeting_date).toLocaleDateString(DATE_LOCALE) : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F8F7F4]">
                  <Clock className="w-5 h-5 text-[#B8863B] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase text-[#6D6D6D] font-semibold">{t('meetings.fields.time')}</p>
                    <p className="text-sm text-[#3D2F24]">{(meeting.meeting_time || '').slice(0, 5)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F8F7F4]">
                  <User className="w-5 h-5 text-[#B8863B] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase text-[#6D6D6D] font-semibold">{t('meetings.details.organizer')}</p>
                    <p className="text-sm text-[#3D2F24]">{organizerName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F8F7F4]">
                  <Users className="w-5 h-5 text-[#B8863B] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase text-[#6D6D6D] font-semibold">{t('nav.customers')}</p>
                    <p className="text-sm text-[#3D2F24]">{meeting.customer?.name || '—'}</p>
                  </div>
                </div>
              </div>
              {meeting.notes && (
                <div className="mt-4 p-4 rounded-xl bg-[#F8F7F4]">
                  <p className="text-xs uppercase text-[#6D6D6D] font-semibold mb-2">{t('common.notes')}</p>
                  <p className="text-sm text-[#3D2F24] whitespace-pre-wrap">{meeting.notes}</p>
                </div>
              )}
              {(meeting.started_at || meeting.ended_at) && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#6D6D6D]">
                  {meeting.started_at && (
                    <p>{t('meetings.details.startedAt')}: {formatDateTime(meeting.started_at)}</p>
                  )}
                  {meeting.ended_at && (
                    <p>{t('meetings.details.endedAt')}: {formatDateTime(meeting.ended_at)}</p>
                  )}
                </div>
              )}
            </section>

            <section className="bg-white border border-[#ECE8E1] rounded-2xl p-5 sm:p-6">
              <h2 className="text-lg font-bold text-[#3D2F24] mb-4 flex items-center gap-2" style={{ fontFamily: FONT_HEADING }}>
                <Users size={18} />{t('meetings.details.participants')}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px]">
                  <thead>
                    <tr className="border-b border-[#ECE8E1] text-left">
                      <th className="py-2 text-xs font-semibold text-[#6D6D6D] uppercase">{t('meetings.details.name')}</th>
                      <th className="py-2 text-xs font-semibold text-[#6D6D6D] uppercase">{t('meetings.details.role')}</th>
                      <th className="py-2 text-xs font-semibold text-[#6D6D6D] uppercase">{t('meetings.details.invitationStatus')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(meeting.invitees || []).map((invitee) => {
                      const name = invitee.user
                        ? `${invitee.user.first_name || ''} ${invitee.user.last_name || ''}`.trim() || invitee.email
                        : invitee.email;
                      return (
                        <tr key={invitee.id} className="border-b border-[#ECE8E1] last:border-0">
                          <td className="py-3 text-sm">
                            <p className="font-medium text-[#3D2F24]">{name}</p>
                            <p className="text-xs text-[#6D6D6D]">{invitee.email}</p>
                          </td>
                          <td className="py-3 text-sm capitalize">{t(`meetings.room.${invitee.role}`, invitee.role)}</td>
                          <td className="py-3">
                            <InvitationBadge status={invitee.invitation_status || 'pending'} t={t} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {(meeting.invitees || []).length === 0 && (
                  <p className="text-sm text-[#6D6D6D] py-4">{t('meetings.details.noParticipants')}</p>
                )}
              </div>
            </section>

            <section className="bg-white border border-[#ECE8E1] rounded-2xl p-5 sm:p-6">
              <h2 className="text-lg font-bold text-[#3D2F24] mb-4 flex items-center gap-2" style={{ fontFamily: FONT_HEADING }}>
                <History size={18} />{t('meetings.details.history')}
              </h2>
              <div className="space-y-3">
                {history.length === 0 ? (
                  <p className="text-sm text-[#6D6D6D]">{t('meetings.details.noHistory')}</p>
                ) : (
                  history.map((entry) => (
                    <div key={entry.id} className="flex gap-3 p-3 rounded-xl bg-[#F8F7F4]">
                      <div className="w-2 h-2 rounded-full bg-[#B8863B] mt-2 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-[#3D2F24]">{entry.description || t(`meetings.activity.${entry.action}`, entry.action)}</p>
                        <p className="text-xs text-[#6D6D6D] mt-1">
                          {entry.user?.name || entry.user?.email || t('meetings.details.system')}
                          {' · '}
                          {formatDateTime(entry.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="bg-white border border-[#ECE8E1] rounded-2xl p-5 sm:p-6">
              <h2 className="text-lg font-bold text-[#3D2F24] mb-4" style={{ fontFamily: FONT_HEADING }}>
                {t('meetings.details.calendar')}
              </h2>
              <div className="space-y-3">
                {googleCalendarUrl && (
                  <a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-[#4285F4] text-white text-sm font-medium hover:bg-[#3367D6] transition-colors">
                    <CalendarPlus size={16} />{t('meetings.details.addGoogleCalendar')}
                  </a>
                )}
                <button type="button" onClick={handleDownloadIcs}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-[#ECE8E1] text-sm hover:bg-[#F8F7F4]">
                  <Download size={16} />{t('meetings.details.downloadIcs')}
                </button>
              </div>
            </section>

            {meeting.status !== 'draft' && isInvited && (
              <section className="bg-white border border-[#ECE8E1] rounded-2xl p-5 sm:p-6">
                <h2 className="text-lg font-bold text-[#3D2F24] mb-3" style={{ fontFamily: FONT_HEADING }}>
                  {t('meetings.details.videoRoom')}
                </h2>
                <p className="text-sm text-[#6D6D6D] mb-4">{t('meetings.details.videoRoomHint')}</p>
                {(canJoin || canStart) && (
                  <button type="button" onClick={canStart ? handleStartAndJoin : () => navigate(`/dashboard/meetings/${id}/room`)}
                    disabled={!!actionLoading}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#B8863B] to-[#C89B5A] text-white text-sm disabled:opacity-50">
                    <Video size={16} />
                    {canStart ? t('meetings.room.startMeeting') : t('meetings.room.joinMeeting')}
                  </button>
                )}
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default MeetingDetailsPage;
