// apps/nexus-ats/frontend/src/components/admin/jobs/CreateJobModal.jsx

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { X, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { setCreateJobModalOpen } from "@/redux/slices/uiSlice";
import { createJob } from "@/redux/slices/jobSlice";
import {
  DEPARTMENTS,
  WORKPLACE_TYPES,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
} from "@/config/constants";
import styles from "./CreateJobModal.module.css";

const AVAILABLE_DEPARTMENTS = DEPARTMENTS.filter(
  (d) => d !== "All Departments",
);
const AVAILABLE_WORKPLACE_TYPES = WORKPLACE_TYPES.filter(
  (w) => w !== "All Locations",
);
const AVAILABLE_EMPLOYMENT_TYPES = EMPLOYMENT_TYPES.filter(
  (e) => e !== "All Types",
);
const AVAILABLE_EXPERIENCE_LEVELS = EXPERIENCE_LEVELS.filter(
  (l) => l !== "All Levels",
);

const INITIAL_FORM_STATE = {
  title: "",
  department: AVAILABLE_DEPARTMENTS[0] || "Engineering",
  workplaceType: AVAILABLE_WORKPLACE_TYPES[0] || "Remote",
  employmentType: AVAILABLE_EMPLOYMENT_TYPES[0] || "Full-time",
  experienceLevel: AVAILABLE_EXPERIENCE_LEVELS[2] || "Senior",
  location: "Remote",
  salaryRange: "$130,000 - $160,000 USD",
  summary: "",
};

export default function CreateJobModal() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.ui.createJobModalOpen);

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [responsibilities, setResponsibilities] = useState([]);
  const [currentResp, setCurrentResp] = useState("");
  const [requirements, setRequirements] = useState([]);
  const [currentReq, setCurrentReq] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = useCallback(() => {
    dispatch(setCreateJobModalOpen(false));
    setFormData(INITIAL_FORM_STATE);
    setResponsibilities([]);
    setCurrentResp("");
    setRequirements([]);
    setCurrentReq("");
    setIsSubmitting(false);
  }, [dispatch]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddResponsibility = () => {
    if (!currentResp.trim()) return;
    setResponsibilities([...responsibilities, currentResp.trim()]);
    setCurrentResp("");
  };

  const handleRemoveResponsibility = (index) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };

  const handleAddRequirement = () => {
    if (!currentReq.trim()) return;
    setRequirements([...requirements, currentReq.trim()]);
    setCurrentReq("");
  };

  const handleRemoveRequirement = (index) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please provide a job title");
      return;
    }

    setIsSubmitting(true);

    const newJobPayload = {
      ...formData,
      title: formData.title.trim(),
      responsibilities:
        responsibilities.length > 0
          ? responsibilities
          : [
              "Lead key architectural initiatives across the pod.",
              "Collaborate with product and design leads to deliver resilient software.",
            ],
      requirements:
        requirements.length > 0
          ? requirements
          : [
              "Proven hands-on experience in production distributed systems.",
              "Strong written and asynchronous communication skills.",
            ],
      benefits: [
        "100% remote-first flexibility with home office stipend",
        "Comprehensive health, dental, and vision insurance",
        "Annual learning & conference budget",
      ],
    };

    try {
      const created = await dispatch(createJob(newJobPayload)).unwrap();
      toast.success(`Job requisition "${created.title}" published!`);
      handleClose();
    } catch (err) {
      toast.error(err || "Failed to create requisition");
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) handleClose();
      }}
      aria-hidden="true"
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Create New Job Requisition"
      >
        <div className={styles.header}>
          <div className={styles.headerTitleGroup}>
            <h2 className={styles.title}>New Job Requisition</h2>
            <p className={styles.subtitle}>
              Configure and publish an open role across the Nexus Careers
              Portal.
            </p>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <form
          id="create-job-form"
          onSubmit={handleSubmit}
          className={styles.formBody}
        >
          {/* Job Title */}
          <div className={styles.formGroup}>
            <label htmlFor="job-title" className={styles.label}>
              Role Title <span className={styles.requiredAsterisk}>*</span>
            </label>
            <input
              id="job-title"
              type="text"
              required
              placeholder="e.g. Senior Distributed Systems Engineer"
              className={styles.input}
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              disabled={isSubmitting}
            />
          </div>

          {/* Department & Workplace */}
          <div className={styles.fieldGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="job-department" className={styles.label}>
                Department
              </label>
              <select
                id="job-department"
                className={styles.select}
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                disabled={isSubmitting}
              >
                {AVAILABLE_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="job-workplace" className={styles.label}>
                Workplace Type
              </label>
              <select
                id="job-workplace"
                className={styles.select}
                value={formData.workplaceType}
                onChange={(e) =>
                  setFormData({ ...formData, workplaceType: e.target.value })
                }
                disabled={isSubmitting}
              >
                {AVAILABLE_WORKPLACE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Employment Type & Level */}
          <div className={styles.fieldGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="job-employment" className={styles.label}>
                Employment Type
              </label>
              <select
                id="job-employment"
                className={styles.select}
                value={formData.employmentType}
                onChange={(e) =>
                  setFormData({ ...formData, employmentType: e.target.value })
                }
                disabled={isSubmitting}
              >
                {AVAILABLE_EMPLOYMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="job-experience" className={styles.label}>
                Experience Level
              </label>
              <select
                id="job-experience"
                className={styles.select}
                value={formData.experienceLevel}
                onChange={(e) =>
                  setFormData({ ...formData, experienceLevel: e.target.value })
                }
                disabled={isSubmitting}
              >
                {AVAILABLE_EXPERIENCE_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location & Salary */}
          <div className={styles.fieldGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="job-location" className={styles.label}>
                Location
              </label>
              <input
                id="job-location"
                type="text"
                placeholder="e.g. Remote or San Francisco, CA"
                className={styles.input}
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="job-salary" className={styles.label}>
                Target Salary Range
              </label>
              <input
                id="job-salary"
                type="text"
                placeholder="e.g. $140,000 - $170,000 USD"
                className={styles.input}
                value={formData.salaryRange}
                onChange={(e) =>
                  setFormData({ ...formData, salaryRange: e.target.value })
                }
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Role Summary */}
          <div className={styles.formGroup}>
            <label htmlFor="job-summary" className={styles.label}>
              Role Summary <span className={styles.requiredAsterisk}>*</span>
            </label>
            <textarea
              id="job-summary"
              required
              placeholder="Brief executive summary of the position..."
              className={styles.textarea}
              value={formData.summary}
              onChange={(e) =>
                setFormData({ ...formData, summary: e.target.value })
              }
              disabled={isSubmitting}
            />
          </div>

          {/* Key Responsibilities */}
          <div className={styles.formGroup}>
            <label htmlFor="add-resp" className={styles.label}>
              Key Responsibilities{" "}
              <span className={styles.optionalBadge}>(Optional)</span>
            </label>
            <div className={styles.listAdder}>
              <input
                id="add-resp"
                type="text"
                placeholder="e.g. Maintain CI/CD pipelines and zero-downtime deploys"
                className={styles.input}
                value={currentResp}
                onChange={(e) => setCurrentResp(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddResponsibility();
                  }
                }}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className={styles.addBtn}
                onClick={handleAddResponsibility}
                disabled={isSubmitting}
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>

            {responsibilities.length > 0 && (
              <div className={styles.itemsContainer}>
                {responsibilities.map((resp, index) => (
                  <div key={index} className={styles.itemPill}>
                    <span className={styles.itemText}>{resp}</span>
                    <button
                      type="button"
                      className={styles.removeItemBtn}
                      onClick={() => handleRemoveResponsibility(index)}
                      aria-label="Remove item"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Qualifications */}
          <div className={styles.formGroup}>
            <label htmlFor="add-req" className={styles.label}>
              Required Qualifications{" "}
              <span className={styles.optionalBadge}>(Optional)</span>
            </label>
            <div className={styles.listAdder}>
              <input
                id="add-req"
                type="text"
                placeholder="e.g. 5+ years experience in Node.js & Redis Lua"
                className={styles.input}
                value={currentReq}
                onChange={(e) => setCurrentReq(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddRequirement();
                  }
                }}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className={styles.addBtn}
                onClick={handleAddRequirement}
                disabled={isSubmitting}
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>

            {requirements.length > 0 && (
              <div className={styles.itemsContainer}>
                {requirements.map((req, index) => (
                  <div key={index} className={styles.itemPill}>
                    <span className={styles.itemText}>{req}</span>
                    <button
                      type="button"
                      className={styles.removeItemBtn}
                      onClick={() => handleRemoveRequirement(index)}
                      aria-label="Remove item"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-job-form"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            <CheckCircle2 size={14} />
            <span>
              {isSubmitting ? "Publishing..." : "Publish Requisition"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
