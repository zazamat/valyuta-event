"use client";

import Image from "next/image";
import { useState } from "react";

type Photo = { title: string; url: string };
type Video = { title: string; provider: string; url: string; embedUrl: string };
type PressLink = { title: string; url: string };

export function MediaManager({
  initialPhotos,
  initialPressLinks,
  initialVideos,
}: {
  initialPhotos: Photo[];
  initialPressLinks: PressLink[];
  initialVideos: Video[];
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [videos, setVideos] = useState(initialVideos);
  const [pressLinks, setPressLinks] = useState(initialPressLinks);
  const [modal, setModal] = useState<"photo" | "video" | "press" | "delete" | null>(null);
  const [editing, setEditing] = useState<{ type: "photo" | "video" | "press"; index: number } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "photo" | "video" | "press"; index: number; title: string } | null>(null);
  const [photoForm, setPhotoForm] = useState<Photo>({ title: "", url: "/event-hero.png" });
  const [videoForm, setVideoForm] = useState<Video>({ embedUrl: "", provider: "YouTube", title: "", url: "" });
  const [pressForm, setPressForm] = useState<PressLink>({ title: "", url: "" });

  const openPhoto = (index?: number) => {
    setEditing(index === undefined ? null : { type: "photo", index });
    setPhotoForm(index === undefined ? { title: "", url: "/event-hero.png" } : photos[index]);
    setModal("photo");
  };
  const openVideo = (index?: number) => {
    setEditing(index === undefined ? null : { type: "video", index });
    setVideoForm(index === undefined ? { embedUrl: "", provider: "YouTube", title: "", url: "" } : videos[index]);
    setModal("video");
  };
  const openPress = (index?: number) => {
    setEditing(index === undefined ? null : { type: "press", index });
    setPressForm(index === undefined ? { title: "", url: "" } : pressLinks[index]);
    setModal("press");
  };

  const savePhoto = () => {
    if (!photoForm.title.trim()) return;
    setPhotos((current) => editing?.type === "photo" ? current.map((item, index) => index === editing.index ? photoForm : item) : [...current, photoForm]);
    setModal(null);
  };
  const saveVideo = () => {
    if (!videoForm.title.trim()) return;
    setVideos((current) => editing?.type === "video" ? current.map((item, index) => index === editing.index ? videoForm : item) : [...current, videoForm]);
    setModal(null);
  };
  const savePress = () => {
    if (!pressForm.title.trim()) return;
    setPressLinks((current) => editing?.type === "press" ? current.map((item, index) => index === editing.index ? pressForm : item) : [...current, pressForm]);
    setModal(null);
  };
  const remove = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "photo") setPhotos((current) => current.filter((_, index) => index !== deleteTarget.index));
    if (deleteTarget.type === "video") setVideos((current) => current.filter((_, index) => index !== deleteTarget.index));
    if (deleteTarget.type === "press") setPressLinks((current) => current.filter((_, index) => index !== deleteTarget.index));
    setDeleteTarget(null);
    setModal(null);
  };

  return (
    <>
      <div className="mb-5 flex flex-wrap gap-2">
        <button className="rounded-lg bg-[#101510] px-4 py-2 text-sm font-semibold text-white" onClick={() => openPhoto()} type="button">Foto əlavə et</button>
        <button className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold" onClick={() => openVideo()} type="button">YouTube video əlavə et</button>
        <button className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold" onClick={() => openPress()} type="button">Press link əlavə et</button>
      </div>

      <section className="grid gap-5">
        <Block title="Foto qalereya">
          <div className="grid gap-4 md:grid-cols-2">
            {photos.map((photo, index) => (
              <article className="overflow-hidden rounded-lg border border-black/10 bg-white" key={`${photo.title}-${index}`}>
                <div className="relative aspect-[16/9]"><Image alt={photo.title} className="object-cover" fill src={photo.url} /></div>
                <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <strong>{photo.title}</strong>
                  <div className="flex gap-2"><button className="rounded-lg border border-black/15 px-3 py-2 text-sm font-semibold" onClick={() => openPhoto(index)} type="button">Düzəliş</button><DeleteButton onClick={() => { setDeleteTarget({ type: "photo", index, title: photo.title }); setModal("delete"); }} /></div>
                </div>
              </article>
            ))}
          </div>
        </Block>

        <Block title="Videolar">
          <div className="grid gap-4 md:grid-cols-2">
            {videos.map((video, index) => (
              <article className="rounded-lg border border-black/10 bg-white p-4" key={`${video.title}-${index}`}>
                <h3 className="font-semibold">{video.title}</h3>
                <p className="mt-1 text-sm text-[#68736c]">{video.provider}</p>
                <div className="mt-3 aspect-video overflow-hidden rounded-lg bg-[#101510]"><iframe allowFullScreen className="h-full w-full" src={video.embedUrl} title={video.title} /></div>
                <div className="mt-4 flex flex-wrap gap-2"><button className="rounded-lg border border-black/15 px-3 py-2 text-sm font-semibold" onClick={() => openVideo(index)} type="button">Düzəliş</button><DeleteButton onClick={() => { setDeleteTarget({ type: "video", index, title: video.title }); setModal("delete"); }} /></div>
              </article>
            ))}
          </div>
        </Block>

        <Block title="Press linklər">
          <div className="grid gap-3">
            {pressLinks.map((item, index) => (
              <article className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-black/10 bg-white p-4" key={`${item.title}-${index}`}>
                <div><strong>{item.title}</strong><p className="text-sm text-[#68736c]">{item.url}</p></div>
                <div className="flex gap-2"><button className="rounded-lg border border-black/15 px-3 py-2 text-sm font-semibold" onClick={() => openPress(index)} type="button">Düzəliş</button><DeleteButton onClick={() => { setDeleteTarget({ type: "press", index, title: item.title }); setModal("delete"); }} /></div>
              </article>
            ))}
          </div>
        </Block>
      </section>

      {modal === "photo" ? <Modal title="Foto" onClose={() => setModal(null)}><Input label="Başlıq" value={photoForm.title} onChange={(value) => setPhotoForm({ ...photoForm, title: value })} /><Input label="Şəkil yolu" value={photoForm.url} onChange={(value) => setPhotoForm({ ...photoForm, url: value })} /><Actions disabled={!photoForm.title.trim()} onCancel={() => setModal(null)} onSave={savePhoto} /></Modal> : null}
      {modal === "video" ? <Modal title="Video" onClose={() => setModal(null)}><Input label="Başlıq" value={videoForm.title} onChange={(value) => setVideoForm({ ...videoForm, title: value })} /><Input label="Provider" value={videoForm.provider} onChange={(value) => setVideoForm({ ...videoForm, provider: value })} /><Input label="Video link" value={videoForm.url} onChange={(value) => setVideoForm({ ...videoForm, url: value })} /><Input label="Embed link" value={videoForm.embedUrl} onChange={(value) => setVideoForm({ ...videoForm, embedUrl: value })} /><Actions disabled={!videoForm.title.trim()} onCancel={() => setModal(null)} onSave={saveVideo} /></Modal> : null}
      {modal === "press" ? <Modal title="Press link" onClose={() => setModal(null)}><Input label="Başlıq" value={pressForm.title} onChange={(value) => setPressForm({ ...pressForm, title: value })} /><Input label="Link" value={pressForm.url} onChange={(value) => setPressForm({ ...pressForm, url: value })} /><Actions disabled={!pressForm.title.trim()} onCancel={() => setModal(null)} onSave={savePress} /></Modal> : null}
      {modal === "delete" && deleteTarget ? <Modal title="Media sil" onClose={() => setModal(null)}><p><strong>{deleteTarget.title}</strong> silinsin?</p><div className="mt-5 flex justify-end gap-2"><button className="rounded-lg border border-black/15 px-4 py-2 text-sm font-semibold" onClick={() => setModal(null)} type="button">Ləğv et</button><button className="rounded-lg bg-[#b42318] px-4 py-2 text-sm font-semibold text-white" onClick={remove} type="button">Sil</button></div></Modal> : null}
    </>
  );
}

function Block({ children, title }: { children: React.ReactNode; title: string }) { return <section className="rounded-lg border border-black/10 bg-white p-5"><h2 className="mb-4 text-xl font-semibold">{title}</h2>{children}</section>; }
function DeleteButton({ onClick }: { onClick: () => void }) { return <button className="rounded-lg border border-[#ffd1cc] px-3 py-2 text-sm font-semibold text-[#b42318]" onClick={onClick} type="button">Sil</button>; }
function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) { return <div className="fixed inset-0 z-50 grid place-items-center bg-[#101510]/45 px-4"><div className="w-full max-w-2xl rounded-lg bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-black/10 px-5 py-4"><h2 className="text-xl font-semibold">{title}</h2><button className="grid size-10 place-items-center rounded-lg border border-black/10" onClick={onClose} type="button">x</button></div><div className="grid max-h-[72vh] gap-4 overflow-y-auto p-5">{children}</div></div></div>; }
function Input({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) { return <label className="grid gap-2 text-sm font-medium">{label}<input className="rounded-lg border border-black/10 px-3 py-3 font-normal" value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
function Actions({ disabled, onCancel, onSave }: { disabled?: boolean; onCancel: () => void; onSave: () => void }) { return <div className="flex justify-end gap-2 border-t border-black/10 pt-4"><button className="rounded-lg border border-black/15 px-4 py-2 text-sm font-semibold" onClick={onCancel} type="button">Ləğv et</button><button className="rounded-lg bg-[#34a51d] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={disabled} onClick={onSave} type="button">Yadda saxla</button></div>; }
