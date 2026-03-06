import React, { useState, useEffect } from "react";
import { studentApi } from "../../../shared/api/studentApi";
import {
  FiVideo,
  FiCalendar,
  FiClock,
  FiExternalLink,
  FiUsers,
} from "react-icons/fi";
import "../styles/LiveClasses.css";

const LiveClasses = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveClasses = async () => {
      try {
        const res = await studentApi.getLiveClasses();
        setClasses(res.data);
      } catch (err) {
        console.error("Error fetching live classes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveClasses();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading live classes...</p>
      </div>
    );
  }

  const liveCount = classes.filter((c) => c.status === "live").length;
  const scheduledCount = classes.filter((c) => c.status === "scheduled").length;

  const getDuration = (lc: any) => {
    const start = lc.startTime || lc.start_time;
    const end = lc.endTime || lc.end_time;
    if (!start || !end) return null;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.round(diff / 60000);
  };

  const getStartTime = (lc: any) => lc.startTime || lc.start_time;

  const openLiveClass = (classId: string) => {
    window.open(`/live-classes/room/${classId}`, "_blank",
      "noopener,noreferrer");
  };

  return (
    <div className="live-classes-container animate-fade-in">
      <div className="classes-header">
        <h1 className="header-title">Live Classes</h1>
        <p className="header-subtitle">
          Join your instructors for real-time learning sessions.
        </p>
      </div>

      <div className="stats-row">
        <div className="stat-badge live">
          <span className="pulse-dot"></span>
          {liveCount} Live {liveCount === 1 ? "Class" : "Classes"}
        </div>
        <div className="stat-badge">
          <FiCalendar size={16} />
          {scheduledCount} Scheduled
        </div>
        <div className="stat-badge">
          <FiUsers size={16} />
          {classes.length} Total
        </div>
      </div>

      <div className="classes-grid">
        {classes.length > 0 ? (
          classes.map((lc) => (
            <div
              key={lc.id}
              className={`class-card ${lc.status === "live" ? "live" : ""}`}
            >
              <div className="card-content">
                <div className="status-badges">
                  <span
                    className={`status-badge ${lc.status === "live" ? "live" : "scheduled"}`}
                  >
                    {lc.status === "live" ? (
                      <>
                        {" "}
                        <span className="live-indicator"></span> LIVE NOW{" "}
                      </>
                    ) : (
                      "SCHEDULED"
                    )}
                  </span>
                  <span className="status-badge unit">
                    {lc.course || "General"}
                  </span>
                </div>

                <h3 className="class-title">{lc.title}</h3>

                <div className="class-details">
                  <div className="detail-item">
                    <FiCalendar />{" "}
                    <span>
                      {new Date(getStartTime(lc)).toLocaleDateString(undefined, {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="detail-item">
                    <FiClock />{" "}
                    <span>
                      {new Date(getStartTime(lc)).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      {getDuration(lc) && <> • {getDuration(lc)} min</>}
                    </span>
                  </div>
                </div>

                <div className="action-buttons">
                  {(lc.status === "live" || lc.status === "scheduled") &&
                  lc.live_url ? (
                    <button
                      className={`join-button ${lc.status === "live" ? "live" : "scheduled"}`}
                      onClick={() => openLiveClass(lc.id)}
                    >
                      {lc.status === "live" ? "Join Class" : "Enter Class"}{" "}
                      <FiVideo size={16} />
                    </button>
                  ) : (
                    <button disabled className="disabled-button">
                      Not Started
                    </button>
                  )}
                  {(lc.recordingUrl || lc.recording_url) && (
                    <a
                      href={lc.recordingUrl || lc.recording_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="recording-button"
                      data-tooltip="View Recording"
                    >
                      <FiExternalLink size={20} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon-wrapper">
              <FiVideo className="empty-icon" />
            </div>
            <h3>No Live Classes Scheduled</h3>
            <p>
              There are no live classes scheduled at the moment. Check back
              later or explore your course materials.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveClasses;
