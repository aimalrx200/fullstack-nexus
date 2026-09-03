// src/components/NotFound.jsx

import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Home, Compass } from "lucide-react";
import { ROUTES } from "../../routes/routes";

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-wrapper">
        {/* Ambient Glow - Purely visual, static offset */}
        <div className="not-found-ambient-glow" />

        {/* 1. Motion Wrapper: ONLY handles entrance opacity & position */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="not-found-motion-container"
        >
          {/* 2. Visual Card Container: Handles backdrop-blur, clip-paths, borders & hover styles */}
          <div className="not-found-card">
            {/* Top Terminal Header Bar */}
            <div className="not-found-header">
              <div className="not-found-header-status">
                <span className="not-found-badge-dot" />
                <span className="not-found-header-title">
                  SYS // ROUTE_NOT_FOUND
                </span>
              </div>
              <span className="not-found-version">v2.0.26</span>
            </div>

            {/* Compass Icon Badge */}
            <div className="not-found-icon-badge">
              <Compass className="not-found-icon" />
            </div>

            {/* Status Badge */}
            <span className="not-found-status-tag">[!] ERROR 404</span>

            <h1 className="not-found-title">Page not found</h1>

            <p className="not-found-description">
              The link you followed may be broken, or the page has been moved.
              Check the URL or navigate back home.
            </p>

            <div className="not-found-actions">
              {/* Go Back Secondary Action */}
              <button
                onClick={() => navigate(-1)}
                type="button"
                className="not-found-btn-back"
              >
                <ArrowLeft className="not-found-btn-back-icon" />
                Go back
              </button>

              {/* Back to Home Primary Action */}
              <Link to={ROUTES.HOME} className="not-found-link-home">
                <Home className="not-found-link-home-icon" />
                Back to Home
              </Link>
            </div>
          </div>
        </motion.div>

        <p className="not-found-footer-note">
          If you believe this is an error, please reach out to system support.
        </p>
      </div>
    </div>
  );
};
