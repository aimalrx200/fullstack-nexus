// apps/nexus-ats/frontend/src/components/public/application/ApplicationModal.jsx

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { X, UploadCloud, CheckCircle2, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { applyForJob } from "@/redux/slices/candidateSlice";
import { incrementApplicantCount } from "@/redux/slices/jobSlice";
import { APP_CONFIG } from "@/config/constants";
import Button from "@/components/common/Button";
import styles from "./ApplicationModal.module.css";

export default function ApplicationModal({ job, isOpen, onClose }) {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    websiteOrProfile: "",
  });
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleReset = useCallback(() => {
    setIsSubmitted(false);
    setIsSubmitting(false);
    setFile(null);
    setFormData({ name: "", email: "", phone: "", websiteOrProfile: "" });
    onClose();
  }, [onClose]);

  // Escape key closes modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleReset();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleReset]);

  // Lock background scroll
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
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File is too large. Please upload a PDF under 10MB.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please upload your PDF resume");
      return;
    }

    setIsSubmitting(true);

    try {
      // Build multipart/form-data payload
      const formPayload = new FormData();
      formPayload.append("jobId", job.id);
      formPayload.append("name", formData.name.trim());
      formPayload.append("email", formData.email.trim());
      if (formData.phone.trim())
        formPayload.append("phone", formData.phone.trim());
      formPayload.append("location", job.location || "Remote");
      if (formData.websiteOrProfile.trim()) {
        formPayload.append(
          "websiteOrProfile",
          formData.websiteOrProfile.trim(),
        );
      }
      formPayload.append("resume", file);

      await dispatch(applyForJob(formPayload)).unwrap();
      dispatch(incrementApplicantCount(job.id));

      toast.success(`Application received for ${job.title}!`);
      setIsSubmitted(true);
    } catch (err) {
      toast.error(err || "Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSubmitting) {
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
            aria-label={`Apply for ${job.title}`}
            onClick={(e) => e.stopPropagation()}
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
                disabled={isSubmitting}
                aria-label="Close application form"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Full Name */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Full Name <span className={styles.requiredAsterisk}>*</span>
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
                  disabled={isSubmitting}
                />
              </div>

              {/* Email Address */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Email Address{" "}
                  <span className={styles.requiredAsterisk}>*</span>
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  placeholder="https://github.com/..."
                  className={styles.input}
                  value={formData.websiteOrProfile}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      websiteOrProfile: e.target.value,
                    })
                  }
                  disabled={isSubmitting}
                />
              </div>

              {/* Resume Dropzone */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Resume (PDF){" "}
                  <span className={styles.requiredAsterisk}>*</span>
                </label>
                <label className={styles.dropzone}>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    required
                    onChange={handleFileChange}
                    className={styles.fileInputHidden}
                    disabled={isSubmitting}
                  />
                  {file ? (
                    <div className={styles.fileSelected}>
                      <FileText size={18} />
                      <span>{file.name}</span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud
                        size={22}
                        className={styles.uploadCloudIcon}
                      />
                      <span className={styles.dropzoneText}>
                        Choose PDF resume or drag it here
                      </span>
                      <span className={styles.dropzoneHint}>
                        PDF or DOCX up to 10MB
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
                  disabled={isSubmitting}
                  className={styles.actionBtn}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className={styles.actionBtn}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="spinner" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <span>Send Application</span>
                  )}
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
            aria-label="Application Submitted"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={`${styles.closeButton} ${styles.closeButtonTopRight}`}
              onClick={handleReset}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className={styles.successIconWrapper}>
              <CheckCircle2 size={30} />
            </div>

            <h2 className={styles.successTitle}>Application Submitted!</h2>

            <div className={styles.jobPill}>
              <span className={styles.jobPillDot} />
              <span>{job.title}</span>
            </div>

            <p className={styles.successText}>
              Thank you for applying. The team at{" "}
              <strong>{APP_CONFIG.companyName}</strong> has received your
              application and will reach out via email regarding next steps.
            </p>

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
