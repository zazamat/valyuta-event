import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "../../../admin-shell";
import { findEvent } from "../event-admin-data";
import { MediaManager } from "./media-manager";

type MediaPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function MediaPage({ params }: MediaPageProps) {
  const { slug } = await params;
  const event = findEvent(slug);

  if (!event) {
    notFound();
  }

  return (
    <AdminShell
      activeLabel="Cari tədbirlər"
      action={<BackLink slug={event.slug} />}
      description="Foto qalereya, video embed və press linklər ayrıca idarə olunur."
      title={`${event.title} · Media`}
    >
      <MediaManager
        initialPhotos={event.media?.photos ?? []}
        initialPressLinks={event.media?.pressLinks ?? []}
        initialVideos={event.media?.videos ?? []}
      />
    </AdminShell>
  );
}

function BackLink({ slug }: { slug: string }) {
  return (
    <Link
      className="rounded-lg border border-black/15 bg-white px-5 py-3 text-sm font-semibold"
      href={`/admin/events/${slug}`}
    >
      Tədbir panelinə qayıt
    </Link>
  );
}
