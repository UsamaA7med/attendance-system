import { Button } from "@/components/ui/button";
import { DeleteIconButton } from "@/components/common";
import { useDeleteLecture, useLecturesPaginated } from "@/hooks/useLectures";
import type { LectureItem } from "@/lib/lectures.api";
import {
  BookOpen,
  CalendarDays,
  Clock,
  Edit,
  Plus,
} from "lucide-react";
import React, { useState } from "react";
import { DeleteLectureDialog } from "./DeleteLectureDialog";
import { EditLectureModal } from "./EditLectureModal";
import { TableSkeletonRows } from "@/components/ui/table-skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { DataTableContainer } from "@/components/common";

interface LecturesTableProps {
  onOpenCreateLecture?: (classId?: string) => void;
  onEditLecture?: (lecture: LectureItem) => void;
  classId?: string;
  date?: string;
  search?: string;
  page?: number;
  onPageChange?: (page: number) => void;
}

export const LecturesTable = React.memo(function LecturesTable({
  onOpenCreateLecture,
  onEditLecture,
  classId,
  date,
  search,
  page: controlledPage,
  onPageChange: controlledOnPageChange,
}: LecturesTableProps) {
  const [internalPage, setInternalPage] = useState(1);
  const activePage = controlledPage !== undefined ? controlledPage : internalPage;
  const handlePageChange = controlledOnPageChange || setInternalPage;

  const queryParams = {
    page: activePage,
    classId: classId && classId !== "all" ? classId : undefined,
    date: date || undefined,
    search: search?.trim() || undefined,
  };

  const { data: lecturesResponse, isLoading } = useLecturesPaginated(queryParams);
  const lectures = lecturesResponse?.data || [];
  const paginationMeta = lecturesResponse?.pagination;

  const deleteMutation = useDeleteLecture();
  const [deletingLecture, setDeletingLecture] = useState<LectureItem | null>(null);
  const [internalEditingLecture, setInternalEditingLecture] = useState<LectureItem | null>(null);

  const handleOpenEdit = (lecture: LectureItem) => {
    if (onEditLecture) {
      onEditLecture(lecture);
    } else {
      setInternalEditingLecture(lecture);
    }
  };

  const handleOpenDelete = (lecture: LectureItem) => {
    setDeletingLecture(lecture);
  };

  const handleCloseDelete = () => {
    setDeletingLecture(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingLecture) return;
    try {
      await deleteMutation.mutateAsync(deletingLecture.id);
      setDeletingLecture(null);
    } catch {
      // Handled in useDeleteLecture onError toast
    }
  };

  return (
    <>
      <DataTableContainer
        pagination={
          paginationMeta
            ? {
                page: paginationMeta.page,
                totalPages: paginationMeta.totalPages,
                hasNextPage: paginationMeta.hasNextPage,
                hasPrevPage: paginationMeta.hasPrevPage,
                onPageChange: handlePageChange,
                isLoading,
              }
            : undefined
        }
      >
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Class & Room</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeletonRows columns={5} rows={5} hasAvatar={false} />
            ) : lectures.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-neutral-500">
                  <CalendarDays className="h-8 w-8 mx-auto text-neutral-400 mb-2" />
                  <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                    No lectures scheduled yet
                  </p>
                  <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
                    Schedule a class lecture with a date and unique start time to manage your course sessions.
                  </p>
                  {onOpenCreateLecture && (
                    <Button
                      size="sm"
                      className="mt-4 gap-1.5"
                      onClick={() => onOpenCreateLecture()}
                    >
                      <Plus className="h-4 w-4" />
                      Schedule First Lecture
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              lectures.map((lecture) => {
                return (
                  <TableRow
                    key={lecture.id}
                  >
                    {/* Date & Start Time */}
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 font-bold">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-bold text-neutral-900 dark:text-neutral-100 text-xs">
                            {lecture.date}
                          </div>
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium flex items-center gap-1 mt-0.5">
                            <span>Starts at {lecture.startTime}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Class & Room */}
                    <TableCell className="text-xs whitespace-nowrap">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-neutral-400" />
                        <span>{lecture.class.name}</span>
                      </div>
                      {lecture.class.room && (
                        <div className="text-neutral-500 text-[11px] mt-0.5">
                          Room: {lecture.class.room}
                        </div>
                      )}
                    </TableCell>

                    {/* Teacher */}
                    <TableCell className="text-xs whitespace-nowrap">
                      {lecture.class.teacher ? (
                        <div className="font-medium text-neutral-800 dark:text-neutral-200">
                          {lecture.class.teacher.name}
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic">Unassigned</span>
                      )}
                    </TableCell>

                    {/* Notes */}
                    <TableCell className="text-xs text-neutral-500 max-w-[240px] truncate">
                      {lecture.notes || "—"}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                          onClick={() => handleOpenEdit(lecture)}
                          title="Edit lecture"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DeleteIconButton
                          onClick={() => handleOpenDelete(lecture)}
                          disabled={deleteMutation.isPending && deletingLecture?.id === lecture.id}
                          title="Delete lecture"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </DataTableContainer>

      <EditLectureModal
        lecture={internalEditingLecture}
        isOpen={Boolean(internalEditingLecture)}
        onClose={() => setInternalEditingLecture(null)}
      />

      <DeleteLectureDialog
        lecture={deletingLecture}
        isOpen={Boolean(deletingLecture)}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </>
  );
});
