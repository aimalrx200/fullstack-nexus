// apps/nexus-ats/frontend/src/components/public/application/ApplicationModal.jsx

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useDispatch } from "react-redux";
import { X, UploadCloud, CheckCircle2, FileText } from "lucide-react";
import { toast } from "sonner";
import { addCandidate } from "@/redux/slices/candidateSlice";
import { incrementApplicantCount } from "@/redux/slices/jobSlice";
import { APP_CONFIG } from "@/config/constants";
import Button from "@/components/common/Button";
import styles from "./ApplicationModal.module.css";

const DEFAULT_DUMMY_PDF =
  "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

export default function ApplicationModal({ job, isOpen, onClose }) {
  const dispatch = useDispatch();

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

    const today = new Date().toISOString().split("T")[0];
    const experienceDefaults = {
      Junior: 1,
      "Mid-Level": 3,
      Senior: 5,
      "Staff / Lead": 8,
    };

    const newCandidate = {
      jobId: job.id,
      jobTitle: job.title,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || undefined,
      location: job.location || "Remote",
      avatar: "",
      stage: "applied",
      rating: 0,
      score: 0,
      appliedDate: today,
      experienceYears: experienceDefaults[job.experienceLevel] || 3,
      expectedSalary: job.salaryRange || "Negotiable",
      resumeUrl: file ? URL.createObjectURL(file) : DEFAULT_DUMMY_PDF,
      portfolioUrl: formData.websiteOrProfile.trim() || undefined,
      tags: [job.department, "Inbound Applicant"],
      scorecard: {
        technical: 0,
        communication: 0,
        systemDesign: 0,
        recommendation: "Review Required",
      },
      notes: [],
    };

    // Dispatch candidate insertion & increment job applicant count in store
    dispatch(addCandidate(newCandidate));
    dispatch(incrementApplicantCount(job.id));

    toast.success(`Application received for ${job.title}!`);
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
                  Resume (PDF){" "}
                  <span className={styles.requiredAsterisk}>*</span>
                </label>
                <label className={styles.dropzone}>
                  <input
                    type="file"
                    accept=".pdf"
                    required
                    onChange={handleFileChange}
                    className={styles.fileInputHidden}
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
            aria-label="Application Submitted"
            onClick={(e) => e.stopPropagation()}
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
              <span className={styles.jobPillDot} />
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
