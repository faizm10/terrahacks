import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileTextIcon, DownloadIcon } from "lucide-react";
import type { TimelineItem } from "@/app/history/page";
type TimelineProps = {
  events: TimelineItem[];
};

export function Timeline({ events }: TimelineProps) {
  return (
    <div className="relative pl-8 sm:pl-16">
      {/* Vertical line */}
      <div className="absolute left-0 sm:left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>

      {events.map((event, index) => (
        <div key={event.id} className="mb-8 flex items-start relative">
          {/* Circle icon */}
          <div className="absolute -left-2.5 sm:-left-0.5 top-2.5 w-5 h-5 rounded-full bg-[var(--color-accent)] flex items-center justify-center z-10">
            {event.icon || <FileTextIcon className="w-3 h-3 text-white" />}
          </div>

          {/* Timeline Item Card */}
          <Card className="flex-1 ml-8 sm:ml-16 bg-white shadow-card rounded-lg overflow-hidden">
            <CardHeader className="pb-2">
              <CardDescription className="text-sm text-[var(--color-text-secondary)]">
                {new Date(event.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
              <CardTitle className="text-lg font-semibold text-[var(--color-text-primary)]">
                {event.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--color-text-primary)] mb-3">
                {event.description}
              </p>
              {event.fileUrl && event.fileName && (
                <div className="flex items-center space-x-2 mt-2">
                  <FileTextIcon className="w-4 h-4 text-[var(--color-accent)]" />
                  <a
                    href={event.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-accent)] hover:underline text-sm"
                  >
                    {event.fileName}
                  </a>
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={event.fileUrl}
                      download={event.fileName}
                      aria-label={`Download ${event.fileName}`}
                    >
                      <DownloadIcon className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
