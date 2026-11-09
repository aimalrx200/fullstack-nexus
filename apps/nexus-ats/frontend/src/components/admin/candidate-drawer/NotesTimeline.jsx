// apps/nexus-ats/frontend/src/components/admin/candidate-drawer/NotesTimeline.jsx

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { addCandidateNote } from "@/redux/slices/candidateSlice";
import styles from "./NotesTimeline.module.css";

export default function NotesTimeline({ candidate }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [noteText, setNoteText] = useState("");

  const notes = candidate.notes || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    dispatch(
      addCandidateNote({
        candidateId: candidate.id,
        author: user?.name
          ? `${user.name} (Recruiter)`
          : "Alex Sterling (Recruiter)",
        text: noteText.trim(),
      }),
    );

    setNoteText("");
    toast.success("Recruiter feedback note recorded");
  };

  return (
    <div className={styles.container}>
      {/* Submission Form */}
      <form onSubmit={handleSubmit} className={styles.noteForm}>
        <textarea
          className={styles.textarea}
          placeholder="Add interview feedback, phone screen observations, or compensation notes..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
        />
        <div className={styles.formFooter}>
          <span className={styles.authorNote}>
            Posting as {user?.name || "Alex Sterling"}
          </span>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={!noteText.trim()}
          >
            <Send size={13} />
            <span>Record Note</span>
          </button>
        </div>
      </form>

      {/* Recruiter Notes Feed */}
      <div className={styles.notesFeed}>
        {notes.length > 0 ? (
          notes.map((note) => (
            <div key={note.id} className={styles.noteItem}>
              <div className={styles.noteHeader}>
                <div className={styles.authorRow}>
                  <div className={styles.noteAvatar}>
                    {note.avatar ? (
                      <img
                        src={note.avatar}
                        alt={note.author}
                        className={styles.noteAvatarImg}
                      />
                    ) : (
                      note.author?.charAt(0) || "R"
                    )}
                  </div>
                  <span className={styles.authorName}>{note.author}</span>
                </div>
                <span className={styles.timestamp}>{note.createdAt}</span>
              </div>
              <p className={styles.noteText}>{note.text}</p>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <MessageSquare size={20} />
            <p>
              No recruiter feedback recorded yet. Write the first note above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
