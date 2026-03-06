/**
 * ZoomClass.tsx — Student's Live Class Room (Zoom Integration)
 *
 * ROLE: Student (participant)
 * - Shows meeting info and pre-join screen
 * - "Join Class" opens Zoom join_url in new tab
 * - Can view class status
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../shared/api/axios";
import toast from "react-hot-toast";
import "./ZoomClass.css";

interface ClassInfo {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  role: string;
  userName: string;
  zoomMeetingId: number;
  joinUrl: string;
  password: string;
}

const ZoomClass = () => {
  const { channelName } = useParams<{ channelName: string }>();
  const navigate = useNavigate();

  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // ─── Fetch class info ──────────────────────────────────────────────
  useEffect(() => {
    if (!channelName) {
      toast.error("Invalid class");
      navigate("/dashboard/live-classes");
      return;
    }

    const fetchClassInfo = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(
          `/live-classes/join-info/${channelName}`
        );
        setClassInfo(res.data);
      } catch (err) {
        toast.error("Failed to load class info");
        navigate("/dashboard/live-classes");
      } finally {
        setLoading(false);
      }
    };
    fetchClassInfo();
  }, [channelName, navigate]);

  // ─── Join Meeting ──────────────────────────────────────────────────
  const joinMeeting = () => {
    if (!classInfo?.joinUrl) {
      toast.error("No Zoom meeting URL available");
      return;
    }

    // Open Zoom in new tab
    window.open(classInfo.joinUrl, "_blank", "noopener,noreferrer");
    toast.success("Zoom is opening in a new tab!");
  };

  // ─── Loading State ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="zc-loading">
        <div className="zc-spinner" />
        <span>Preparing your classroom...</span>
      </div>
    );
  }

  if (!classInfo) {
    return (
      <div className="zc-loading">
        <span>Class not found</span>
        <button
          className="zc-back-btn"
          onClick={() => navigate("/dashboard/live-classes")}
        >
          ← Back to Classes
        </button>
      </div>
    );
  }

  // ─── Format dates ──────────────────────────────────────────────────
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const status = classInfo.status || "scheduled";

  // ─── Main UI ───────────────────────────────────────────────────────
  return (
    <div className="zc-room">
      {/* Top Bar */}
      <div className="zc-topbar">
        <div className="zc-topbar-left">
          <span className="zc-topbar-title">📚 {classInfo.title}</span>
          <span
            className={`zc-topbar-badge ${status === "live" ? "zc-badge-live" : status === "ended" ? "zc-badge-ended" : "zc-badge-scheduled"}`}
          >
            {status === "live"
              ? "● Live"
              : status === "ended"
                ? "Ended"
                : "Scheduled"}
          </span>
          <span className="zc-topbar-badge zc-badge-student">Student</span>
        </div>

        <div className="zc-topbar-center" />

        <div className="zc-topbar-right">
          <button
            className="zc-nav-btn"
            onClick={() => navigate("/dashboard/live-classes")}
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="zc-content">
        <div className="zc-meeting-card">
          {/* Zoom Icon */}
          <div className="zc-zoom-icon">
            <svg viewBox="0 0 48 48" width="64" height="64">
              <rect width="48" height="48" rx="12" fill="#2D8CFF" />
              <path
                d="M14 17h14c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H14c-1.1 0-2-.9-2-2V19c0-1.1.9-2 2-2zm20 2l6-4v18l-6-4V19z"
                fill="white"
              />
            </svg>
          </div>

          <h2 className="zc-meeting-title">{classInfo.title}</h2>

          <div className="zc-meeting-details">
            <div className="zc-detail-item">
              <span className="zc-detail-icon">📅</span>
              <span>{formatDate(classInfo.startTime)}</span>
            </div>
            <div className="zc-detail-item">
              <span className="zc-detail-icon">🕐</span>
              <span>
                {formatTime(classInfo.startTime)} —{" "}
                {classInfo.endTime ? formatTime(classInfo.endTime) : "TBD"}
              </span>
            </div>
            {classInfo.zoomMeetingId && (
              <div className="zc-detail-item">
                <span className="zc-detail-icon">🔗</span>
                <span>Meeting ID: {classInfo.zoomMeetingId}</span>
              </div>
            )}
            {classInfo.password && (
              <div className="zc-detail-item">
                <span className="zc-detail-icon">🔑</span>
                <span>Password: {classInfo.password}</span>
              </div>
            )}
          </div>

          <div className="zc-meeting-role">
            <span className="zc-role-badge student">📚 Participant (Student)</span>
            <span className="zc-role-name">{classInfo.userName}</span>
          </div>

          {/* Action Buttons */}
          <div className="zc-actions">
            {status === "live" ? (
              <button className="zc-join-btn" onClick={joinMeeting}>
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Join Class Now
              </button>
            ) : status === "scheduled" ? (
              <div className="zc-scheduled-message">
                <div className="zc-waiting-icon">⏳</div>
                <p>This class hasn't started yet.</p>
                <p className="zc-subtext">
                  The teacher will start the meeting soon. You can join once it's
                  live.
                </p>
                <button className="zc-join-btn scheduled" onClick={joinMeeting}>
                  Enter Waiting Room
                </button>
              </div>
            ) : (
              <div className="zc-ended-message">
                <p>This class has ended.</p>
                <button
                  className="zc-back-btn"
                  onClick={() => navigate("/dashboard/live-classes")}
                >
                  ← Back to Classes
                </button>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="zc-tips">
            <h4>💡 Tips</h4>
            <ul>
              <li>Make sure you have Zoom installed for the best experience</li>
              <li>You can also join via your web browser</li>
              <li>Unmute your mic when the teacher allows discussion</li>
              <li>Use Zoom's chat feature to ask questions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoomClass;
