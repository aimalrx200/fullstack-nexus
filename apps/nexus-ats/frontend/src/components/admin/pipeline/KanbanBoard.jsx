// apps/nexus-ats/frontend/src/components/admin/pipeline/KanbanBoard.jsx

import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DragDropContext } from "@hello-pangea/dnd";
import { toast } from "sonner";
import {
  selectAllCandidates,
  moveCandidateStage,
} from "@/redux/slices/candidateSlice";
import { selectSelectedJobId } from "@/redux/slices/jobSlice";
import { MOCK_STAGES } from "@/lib/mockData/stages.mock";
import KanbanColumn from "./KanbanColumn";
import styles from "./KanbanBoard.module.css";

export default function KanbanBoard() {
  const dispatch = useDispatch();

  const candidates = useSelector(selectAllCandidates);
  const selectedJobId = useSelector(selectSelectedJobId);
  const searchQuery = useSelector(
    (state) => state.candidates.pipelineSearchQuery || "",
  );

  // Filter candidates according to Requisition & Search query
  const filteredCandidates = useMemo(() => {
    return candidates.filter((cand) => {
      const matchesJob =
        selectedJobId === "all" || cand.jobId === selectedJobId;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        cand.name?.toLowerCase().includes(query) ||
        cand.jobTitle?.toLowerCase().includes(query) ||
        cand.email?.toLowerCase().includes(query) ||
        cand.tags?.some((t) => t.toLowerCase().includes(query));

      return matchesJob && matchesSearch;
    });
  }, [candidates, selectedJobId, searchQuery]);

  // Group filtered candidates by stage ID
  const candidatesByStage = useMemo(() => {
    const map = {};
    MOCK_STAGES.forEach((stage) => {
      map[stage.id] = [];
    });

    filteredCandidates.forEach((cand) => {
      if (map[cand.stage]) {
        map[cand.stage].push(cand);
      } else {
        // Fallback for unexpected or missing stage keys
        if (!map["applied"]) map["applied"] = [];
        map["applied"].push(cand);
      }
    });

    return map;
  }, [filteredCandidates]);

  // Handle Drag End with Optimistic Redux Update
  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a valid drop target
    if (!destination) return;

    // Dropped in exact same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const candidate = candidates.find((c) => c.id === draggableId);
    const destinationStage = MOCK_STAGES.find(
      (s) => s.id === destination.droppableId,
    );

    if (source.droppableId !== destination.droppableId) {
      dispatch(
        moveCandidateStage({
          candidateId: draggableId,
          newStageId: destination.droppableId,
        }),
      );

      toast.success(
        `Moved ${candidate?.name || "Candidate"} to ${
          destinationStage?.title || destination.droppableId
        }`,
      );
    }
  };

  return (
    <div className={styles.boardCanvas}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className={styles.columnsTrack}>
          {MOCK_STAGES.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              candidates={candidatesByStage[stage.id] || []}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
