import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, UploadCloud, CheckCircle2, FileText } from "lucide-react";
import { APP_CONFIG } from "@/config/constants";
import Button from "@/components/common/Button";
import styles from "./ApplicationModal.module.css";

export default function ApplicationModal({ job, isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    websiteOrProfile: "",
  });
  const [file, setFile] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleReset = useCallback(() => {
    setIsSubmitted(false);
    setFile(null);
    setFormData({ name: "", email: "", phone: "", websiteOrProfile: "" });
    onClose();
  }, [onClose]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleReset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleReset]);

  // Lock background page scroll while modal is active
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !job) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  // Closes modal when user clicks anywhere on the backdrop/overlay
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleReset();
    }
  };

  const modalContent = (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      <div className={styles.container} onClick={handleBackdropClick}>
        {!isSubmitted ? (
          /* ================= Form View ================= */
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()} // Prevents clicks inside the form from closing modal
          >
            <div className={styles.headerRow}>
              <div className={styles.headerText}>
                <h2 className={styles.title}>Apply for {job.title}</h2>
                <p className={styles.subtitle}>
                  {job.department} • {job.location} • {job.employmentType}
                </p>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={handleReset}
                aria-label="Close application form"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Full Name */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Full Name <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  className={styles.input}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              {/* Email Address */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Email Address{" "}
                  <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sarah@example.com"
                  className={styles.input}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              {/* Phone Number */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Phone Number{" "}
                  <span className={styles.optional}>(Optional)</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +1 (555) 019-2834"
                  className={styles.input}
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>

              {/* Portfolio or Profile */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Portfolio or Profile Link{" "}
                  <span className={styles.optional}>(Optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  className={styles.input}
                  value={formData.websiteOrProfile}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      websiteOrProfile: e.target.value,
                    })
                  }
                />
              </div>

              {/* Resume Dropzone */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Resume (PDF) <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <label className={styles.dropzone}>
                  <input
                    type="file"
                    accept=".pdf"
                    required
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  {file ? (
                    <div className={styles.fileSelected}>
                      <FileText size={18} />
                      <span>{file.name}</span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={22} color="var(--primary)" />
                      <span className={styles.dropzoneText}>
                        Choose PDF resume or drag it here
                      </span>
                      <span className={styles.dropzoneHint}>
                        PDF up to 10MB
                      </span>
                    </>
                  )}
                </label>
              </div>

              {/* Action Buttons */}
              <div className={styles.actions}>
                <Button
                  variant="secondary"
                  onClick={handleReset}
                  className={styles.actionBtn}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className={styles.actionBtn}
                >
                  Send Application
                </Button>
              </div>
            </form>
          </div>
        ) : (
          /* ================= Dedicated Confirmation View ================= */
          <div
            className={`${styles.modal} ${styles.confirmationModal}`}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()} // Prevents clicks inside confirmation from closing modal
          >
            {/* Top right close button */}
            <button
              type="button"
              className={`${styles.closeButton} ${styles.closeButtonTopRight}`}
              onClick={handleReset}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Glowing Success Icon */}
            <div className={styles.successIconWrapper}>
              <CheckCircle2 size={30} />
            </div>

            {/* Title */}
            <h2 className={styles.successTitle}>Application Submitted!</h2>

            {/* Role Context Pill */}
            <div className={styles.jobPill}>
              <span className={styles.jobPillDot}></span>
              <span>{job.title}</span>
            </div>

            {/* Subtitle / Description */}
            <p className={styles.successText}>
              Thank you for applying. The team at{" "}
              <strong>{APP_CONFIG.companyName}</strong> has received your
              application and will reach out via email regarding next steps.
            </p>

            {/* Centered Return Button */}
            <div className={styles.successActions}>
              <Button
                variant="primary"
                onClick={handleReset}
                className={styles.doneBtn}
              >
                Back to Open Roles
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
