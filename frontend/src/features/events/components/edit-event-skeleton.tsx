import { SetPageMeta } from "@/components/layouts/page-meta-context";

interface EditEventSkeletonProps {
  eventId: string;
}

export function EditEventSkeleton({ eventId }: EditEventSkeletonProps) {
  return (
    <>
      <SetPageMeta title="Edit Event" backHref={eventId ? `/events/${eventId}` : "/events"} />
      <div className="page-container max-w-3xl space-y-8 page-enter animate-pulse">
        {/* Cover Image Upload Skeleton */}
        <div className="h-48 sm:h-56 bg-base-200 rounded-xl" />

        {/* Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2 space-y-2">
            <div className="h-4 w-20 bg-base-200 rounded" />
            <div className="h-10 bg-base-200 rounded-lg" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-16 bg-base-200 rounded" />
            <div className="h-10 bg-base-200 rounded-lg" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-12 bg-base-200 rounded" />
            <div className="h-10 bg-base-200 rounded-lg" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 w-24 bg-base-200 rounded" />
          <div className="h-32 bg-base-200 rounded-lg" />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-4 w-20 bg-base-200 rounded" />
            <div className="h-10 bg-base-200 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <div className="h-4 w-16 bg-base-200 rounded" />
              <div className="h-10 bg-base-200 rounded-lg" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-16 bg-base-200 rounded text-base-200" />
              <div className="h-10 bg-base-200 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <div className="h-4 w-16 bg-base-200 rounded" />
          <div className="h-10 bg-base-200 rounded-lg" />
        </div>

        {/* Max Participants & Deadline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-4 w-28 bg-base-200 rounded" />
            <div className="h-10 bg-base-200 rounded-lg" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-36 bg-base-200 rounded" />
            <div className="h-10 bg-base-200 rounded-lg" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border pb-8">
          <div className="h-10 w-20 bg-base-200 rounded-lg" />
          <div className="h-10 w-32 bg-base-200 rounded-lg" />
        </div>
      </div>
    </>
  );
}
