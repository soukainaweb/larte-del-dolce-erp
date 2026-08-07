import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Loader2,
  MicOff,
  PhoneOff,
  Users,
  Video,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { unwrapData, getApiErrorMessage } from '../../utils/apiHelpers';
import {
  endMeeting,
  getMeetingSession,
  startMeeting,
} from '../../services/meetingService';

const JITSI_DOMAIN = import.meta.env.VITE_JITSI_DOMAIN || 'meet.jit.si';

const MeetingRoomPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { user } = useAuth();

  const jitsiApiRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [session, setSession] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [error, setError] = useState(null);

  const meeting = session?.meeting;
  const permissions = session?.permissions || {};
  const jitsiConfig = session?.jitsi || {};
  const displayName = session?.user?.displayName
    || user?.fullName
    || user?.email
    || t('meetings.room.guest');

  const loadSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMeetingSession(id);
      const data = unwrapData(response);
      setSession(data);
      setInCall(data?.meeting?.status === 'live');
    } catch (err) {
      const message = getApiErrorMessage(err, t('meetings.room.accessDenied'));
      setError(message);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const handleStartMeeting = async () => {
    setStarting(true);
    try {
      await startMeeting(id);
      showToast(t('meetings.room.started'), 'success');
      await loadSession();
      setInCall(true);
    } catch (err) {
      showToast(getApiErrorMessage(err, t('meetings.errors.save')), 'error');
    } finally {
      setStarting(false);
    }
  };

  const handleEndMeeting = async () => {
    if (!window.confirm(t('meetings.room.confirmEnd'))) return;
    setEnding(true);
    try {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.executeCommand('hangup');
      }
      await endMeeting(id);
      showToast(t('meetings.room.ended'), 'success');
      navigate('/dashboard/meetings', { replace: true });
    } catch (err) {
      showToast(getApiErrorMessage(err, t('meetings.errors.save')), 'error');
    } finally {
      setEnding(false);
    }
  };

  const handleMuteAll = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('muteEveryone', 'audio');
      showToast(t('meetings.room.mutedAll'), 'info');
    }
  };

  const handleKickParticipant = (participantId) => {
    if (jitsiApiRef.current && participantId) {
      jitsiApiRef.current.executeCommand('kickParticipant', participantId);
    }
  };

  const handleApiReady = (api) => {
    jitsiApiRef.current = api;

    api.addEventListener('videoConferenceJoined', () => {
      setInCall(true);
    });
    api.addEventListener('videoConferenceLeft', () => {
      setInCall(false);
    });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#0f1117] text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#C6923B]" />
          <p className="text-sm text-white/70">{t('meetings.room.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F8F7F4] p-6">
        <div className="max-w-md w-full bg-white border border-[#ECE8E1] rounded-2xl p-8 text-center">
          <p className="text-[#3D2F24] font-semibold mb-2">{t('meetings.room.accessDenied')}</p>
          <p className="text-sm text-[#6D6D6D] mb-6">{error}</p>
          <button
            type="button"
            onClick={() => navigate('/dashboard/meetings')}
            className="px-4 py-2 rounded-xl bg-[#B8863B] text-white text-sm"
          >
            {t('meetings.room.backToList')}
          </button>
        </div>
      </div>
    );
  }

  if (meeting.status === 'finished' || meeting.status === 'cancelled') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F8F7F4] p-6">
        <div className="max-w-md w-full bg-white border border-[#ECE8E1] rounded-2xl p-8 text-center">
          <p className="text-[#3D2F24] font-semibold mb-2">{t('meetings.room.meetingEnded')}</p>
          <p className="text-sm text-[#6D6D6D] mb-6">{t(`meetings.status.${meeting.status}`)}</p>
          <button
            type="button"
            onClick={() => navigate('/dashboard/meetings')}
            className="px-4 py-2 rounded-xl bg-[#B8863B] text-white text-sm"
          >
            {t('meetings.room.backToList')}
          </button>
        </div>
      </div>
    );
  }

  const showPrejoin = meeting.status === 'scheduled' && permissions.isHost && !inCall;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] min-h-[640px] bg-[#0f1117] rounded-2xl overflow-hidden border border-[#2a2d36]">
      {/* Top control bar */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[#161922] border-b border-[#2a2d36] text-white shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/dashboard/meetings')}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label={t('meetings.room.backToList')}
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-semibold truncate">{meeting.title}</h1>
            <p className="text-xs text-white/50 truncate">
              {meeting.meeting_date} · {(meeting.meeting_time || '').slice(0, 5)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${
            meeting.status === 'live'
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'bg-blue-500/20 text-blue-300'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${meeting.status === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`} />
            {t(`meetings.status.${meeting.status}`)}
          </span>

          {permissions.canModerate && inCall && (
            <>
              <button
                type="button"
                onClick={handleMuteAll}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs"
              >
                <MicOff className="w-3.5 h-3.5" />
                {t('meetings.room.muteAll')}
              </button>
              <button
                type="button"
                onClick={handleEndMeeting}
                disabled={ending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold disabled:opacity-50"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                {t('meetings.room.endMeeting')}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Main video area */}
        <div className="flex-1 relative min-w-0">
          {showPrejoin ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0f1117] text-white p-6">
              <div className="max-w-lg w-full text-center space-y-6">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-[#B8863B]/20 flex items-center justify-center">
                  <Video className="w-8 h-8 text-[#C6923B]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">{meeting.title}</h2>
                  <p className="text-sm text-white/60">{t('meetings.room.hostWaiting')}</p>
                </div>
                <button
                  type="button"
                  onClick={handleStartMeeting}
                  disabled={starting}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#B8863B] to-[#C6923B] text-white font-semibold disabled:opacity-50"
                >
                  {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                  {t('meetings.room.startMeeting')}
                </button>
              </div>
            </div>
          ) : inCall || meeting.status === 'live' ? (
            <JitsiMeeting
              domain={jitsiConfig.domain || JITSI_DOMAIN}
              roomName={jitsiConfig.roomName || meeting.room_name}
              configOverwrite={{
                prejoinPageEnabled: false,
                startWithAudioMuted: false,
                startWithVideoMuted: false,
                disableDeepLinking: true,
                enableWelcomePage: false,
                enableClosePage: false,
              }}
              interfaceConfigOverwrite={{
                SHOW_JITSI_WATERMARK: false,
                SHOW_WATERMARK_FOR_GUESTS: false,
                MOBILE_APP_PROMO: false,
                TOOLBAR_BUTTONS: [
                  'microphone',
                  'camera',
                  'desktop',
                  'fullscreen',
                  'fodeviceselection',
                  'hangup',
                  'chat',
                  'raisehand',
                  'participants-pane',
                  'tileview',
                  'settings',
                ],
              }}
              userInfo={{
                displayName,
                email: session?.user?.email || user?.email || '',
              }}
              onApiReady={handleApiReady}
              getIFrameRef={(node) => {
                if (node) {
                  node.style.height = '100%';
                  node.style.width = '100%';
                  node.style.border = '0';
                }
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/70 p-6 text-center">
              <p>{t('meetings.room.waitingForHost')}</p>
            </div>
          )}
        </div>

        {/* Participants sidebar */}
        {inCall && (
          <aside className="hidden lg:flex w-72 flex-col bg-[#161922] border-s border-[#2a2d36] text-white shrink-0">
            <div className="px-4 py-3 border-b border-[#2a2d36] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#C6923B]" />
              <span className="text-sm font-semibold">{t('meetings.room.participants')}</span>
              <span className="text-xs text-white/40">({meeting.invitees?.length || 0})</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {(meeting.invitees || []).map((invitee) => (
                <div
                  key={invitee.id}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/5"
                >
                  <div className="min-w-0">
                    <p className="text-sm truncate">
                      {invitee.user
                        ? `${invitee.user.first_name || ''} ${invitee.user.last_name || ''}`.trim() || invitee.email
                        : invitee.email}
                    </p>
                    {invitee.role === 'host' && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#C6923B]">
                        <Shield className="w-3 h-3" /> {t('meetings.room.host')}
                      </span>
                    )}
                  </div>
                  {permissions.canModerate && invitee.role !== 'host' && (
                    <button
                      type="button"
                      onClick={() => handleKickParticipant(invitee.user_id)}
                      className="text-[10px] text-rose-300 hover:text-rose-200 shrink-0"
                    >
                      {t('meetings.room.remove')}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default MeetingRoomPage;
