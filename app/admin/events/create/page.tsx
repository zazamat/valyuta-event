import { AdminShell } from "../../admin-shell";
import type { ReactNode } from "react";

const inputClass = "rounded-lg border border-black/10 bg-white px-3 py-3";
const labelClass = "grid gap-2 text-sm";

function Fieldset({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-black/10 bg-white p-5">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm text-[#68736c]">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function CreateEventPage() {
  return (
    <AdminShell
      activeLabel="Tədbir yarat"
      action={
        <div className="flex flex-wrap gap-2">
          <button className="rounded-lg border border-black/10 bg-white px-4 py-3 text-sm font-semibold">
            Qaralama saxla
          </button>
          <button className="rounded-lg bg-[#34a51d] px-4 py-3 text-sm font-semibold text-white">
            Yayına ver
          </button>
        </div>
      }
      description="Tədbir səhifəsində görünəcək bütün məlumatları buradan strukturlaşdırılmış formada əlavə et."
      title="Tədbir yarat"
    >
      <div className="grid gap-5">
        <Fieldset
          description="Public tədbir səhifəsinin əsas başlıq və hero hissəsi."
          title="Əsas məlumatlar"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <label className={`${labelClass} md:col-span-2`}>
              Tədbir adı
              <input className={inputClass} defaultValue="AI & Finance Summit 2026" />
            </label>
            <label className={labelClass}>
              Slug / URL
              <input className={inputClass} defaultValue="ai-finance-summit-2026" />
            </label>
            <label className={labelClass}>
              Kateqoriya
              <select className={inputClass}>
                <option>AI, Fintech</option>
                <option>Startap</option>
                <option>Marketinq</option>
                <option>HR</option>
              </select>
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              Qısa təsvir
              <textarea
                className="min-h-24 rounded-lg border border-black/10 bg-white px-3 py-3"
                defaultValue="Bankçılıq, investisiya və fintech komandaları üçün süni intellektin real tətbiqləri."
              />
            </label>
            <label className={`${labelClass} md:col-span-2`}>
              Geniş təsvir
              <textarea
                className="min-h-32 rounded-lg border border-black/10 bg-white px-3 py-3"
                defaultValue="Tədbir maliyyə sektorunda AI tətbiqlərini, risk idarəetməsini, fintech məhsullarını və data əsaslı qərarverməni bir araya gətirir."
              />
            </label>
          </div>
        </Fieldset>

        <div className="grid gap-5 lg:grid-cols-2">
          <Fieldset title="Vaxt, format və məkan">
            <div className="grid gap-3 md:grid-cols-2">
              <label className={labelClass}>
                Başlama tarixi
                <input className={inputClass} defaultValue="18 Sentyabr 2026" />
              </label>
              <label className={labelClass}>
                Saat
                <input className={inputClass} defaultValue="10:00-17:30" />
              </label>
              <label className={labelClass}>
                Format
                <select className={inputClass}>
                  <option>Hibrid</option>
                  <option>Fiziki</option>
                  <option>Onlayn</option>
                </select>
              </label>
              <label className={labelClass}>
                Status
                <select className={inputClass}>
                  <option>Satış aktivdir</option>
                  <option>Qaralama</option>
                  <option>Bitmiş tədbir</option>
                </select>
              </label>
              <label className={`${labelClass} md:col-span-2`}>
                Məkan adı
                <input className={inputClass} defaultValue="Baku Convention Center" />
              </label>
              <label className={`${labelClass} md:col-span-2`}>
                Xəritə / ünvan
                <input className={inputClass} defaultValue="Bakı, Azərbaycan" />
              </label>
              <label className={`${labelClass} md:col-span-2`}>
                Online giriş linki
                <input className={inputClass} placeholder="Zoom/Vimeo/YouTube linki" />
              </label>
            </div>
          </Fieldset>

          <Fieldset
            description="Cover və qalereya şəkilləri sonradan R2/S3 storage-a yüklənəcək."
            title="Foto və video"
          >
            <div className="grid gap-3">
              <label className={labelClass}>
                Cover şəkli
                <input className={inputClass} type="file" />
              </label>
              <label className={labelClass}>
                Foto qalereya
                <input className={inputClass} multiple type="file" />
              </label>
              <label className={labelClass}>
                Video linki
                <input
                  className={inputClass}
                  defaultValue="https://youtube.com/watch?v=demo"
                />
              </label>
              <label className={labelClass}>
                Replay linki
                <input className={inputClass} placeholder="Vimeo/replay linki" />
              </label>
            </div>
          </Fieldset>
        </div>

        <Fieldset
          description="Agenda public səhifədə proqram bölməsi kimi görünəcək."
          title="Proqram / agenda"
        >
          <div className="grid gap-3">
            {[1, 2, 3].map((item) => (
              <div
                className="grid gap-3 rounded-lg bg-[#f5f7f6] p-4 md:grid-cols-[110px_1fr_1.5fr]"
                key={item}
              >
                <input className={inputClass} defaultValue={item === 1 ? "10:00" : ""} />
                <input
                  className={inputClass}
                  defaultValue={item === 1 ? "Qeydiyyat və networking" : ""}
                  placeholder="Sessiya adı"
                />
                <input
                  className={inputClass}
                  defaultValue={
                    item === 1 ? "İştirakçıların qarşılanması və QR check-in." : ""
                  }
                  placeholder="Qısa təsvir"
                />
              </div>
            ))}
          </div>
          <button className="mt-4 rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-semibold">
            Sessiya əlavə et
          </button>
        </Fieldset>

        <Fieldset
          description="Hər spikerin məlumatı public səhifədə ayrıca kart kimi göstəriləcək."
          title="Spikerlər"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {[1, 2].map((speaker) => (
              <div className="rounded-lg bg-[#f5f7f6] p-4" key={speaker}>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className={labelClass}>
                    Ad soyad
                    <input
                      className={inputClass}
                      defaultValue={speaker === 1 ? "Leyla Həsənova" : ""}
                    />
                  </label>
                  <label className={labelClass}>
                    Vəzifə
                    <input
                      className={inputClass}
                      defaultValue={speaker === 1 ? "Chief Data Officer" : ""}
                    />
                  </label>
                  <label className={labelClass}>
                    Şirkət
                    <input className={inputClass} defaultValue={speaker === 1 ? "Valyuta.az" : ""} />
                  </label>
                  <label className={labelClass}>
                    LinkedIn
                    <input className={inputClass} placeholder="linkedin.com/in/..." />
                  </label>
                  <label className={`${labelClass} md:col-span-2`}>
                    Mövzu
                    <input className={inputClass} placeholder="Çıxış mövzusu" />
                  </label>
                  <label className={`${labelClass} md:col-span-2`}>
                    Bio
                    <textarea className="min-h-24 rounded-lg border border-black/10 bg-white px-3 py-3" />
                  </label>
                  <label className={`${labelClass} md:col-span-2`}>
                    Şəkil
                    <input className={inputClass} type="file" />
                  </label>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-semibold">
            Spiker əlavə et
          </button>
        </Fieldset>

        <Fieldset
          description="Sponsorlar səviyyəyə görə qruplaşdırılacaq: Baş sponsor, Gold, Silver, Media Partner və s."
          title="Sponsorlar və tərəfdaşlar"
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {[1, 2].map((sponsor) => (
              <div className="rounded-lg bg-[#f5f7f6] p-4" key={sponsor}>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className={labelClass}>
                    Sponsor adı
                    <input
                      className={inputClass}
                      defaultValue={sponsor === 1 ? "Valyuta.az" : ""}
                    />
                  </label>
                  <label className={labelClass}>
                    Səviyyə
                    <select className={inputClass}>
                      <option>Baş sponsor</option>
                      <option>Gold</option>
                      <option>Silver</option>
                      <option>Media Partner</option>
                    </select>
                  </label>
                  <label className={labelClass}>
                    Sayt linki
                    <input className={inputClass} defaultValue={sponsor === 1 ? "valyuta.az" : ""} />
                  </label>
                  <label className={labelClass}>
                    Logo
                    <input className={inputClass} type="file" />
                  </label>
                  <label className={`${labelClass} md:col-span-2`}>
                    Təsvir
                    <textarea className="min-h-20 rounded-lg border border-black/10 bg-white px-3 py-3" />
                  </label>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-semibold">
            Sponsor əlavə et
          </button>
        </Fieldset>

        <div className="grid gap-5 lg:grid-cols-2">
          <Fieldset title="Bilet satışı">
            <div className="grid gap-3">
              <label className={labelClass}>
                Bilet növü
                <input className={inputClass} defaultValue="Standard" />
              </label>
              <div className="grid gap-3 md:grid-cols-3">
                <label className={labelClass}>
                  Qiymət
                  <input className={inputClass} defaultValue="50" inputMode="numeric" />
                </label>
                <label className={labelClass}>
                  Limit
                  <input className={inputClass} defaultValue="300" inputMode="numeric" />
                </label>
                <label className={labelClass}>
                  İştirak
                  <select className={inputClass}>
                    <option>Fiziki</option>
                    <option>Onlayn</option>
                    <option>Hibrid</option>
                  </select>
                </label>
              </div>
              <label className={labelClass}>
                Promo kod icazəsi
                <select className={inputClass}>
                  <option>Aktiv</option>
                  <option>Deaktiv</option>
                </select>
              </label>
            </div>
          </Fieldset>

          <Fieldset title="SEO və yayımlama">
            <div className="grid gap-3">
              <label className={labelClass}>
                SEO title
                <input className={inputClass} defaultValue="AI & Finance Summit 2026 - vEvent" />
              </label>
              <label className={labelClass}>
                Meta description
                <textarea
                  className="min-h-20 rounded-lg border border-black/10 bg-white px-3 py-3"
                  defaultValue="Maliyyə və fintech komandaları üçün AI tədbiri."
                />
              </label>
              <label className={labelClass}>
                Publish status
                <select className={inputClass}>
                  <option>Qaralama</option>
                  <option>Yayında</option>
                  <option>Arxiv</option>
                </select>
              </label>
            </div>
          </Fieldset>
        </div>
      </div>
    </AdminShell>
  );
}
