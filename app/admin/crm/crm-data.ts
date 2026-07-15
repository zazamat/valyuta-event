export type CrmContact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  lifecycle: string;
  interests: string[];
  source: string;
  consent: "Email+SMS" | "Email" | "SMS" | "Yoxdur";
  events: string[];
  tickets: number;
  spend: number;
  lastActivity: string;
  risk: "Aşağı" | "Orta" | "Yüksək";
};

export type CrmParticipant = {
  id: string;
  contactId: string;
  name: string;
  email: string;
  phone: string;
  event: string;
  ticket: string;
  status: string;
  checkIn: string;
  source: string;
  interests: string;
};

export type AbandonedCheckout = {
  id: string;
  name: string;
  email: string;
  phone: string;
  event: string;
  ticket: string;
  amount: number;
  stage: string;
  reason: string;
  source: string;
  utmCampaign: string;
  lastSeen: string;
  followUp: string;
};

export type CrmSegment = {
  id: string;
  name: string;
  rule: string;
  size: number;
  channel: string;
  sync: string;
  lastSync: string;
};

export type AdAudience = {
  id: string;
  name: string;
  platform: string;
  rule: string;
  size: number;
  matchRate: number;
  consentCoverage: number;
  sync: string;
  lastSync: string;
};

export type AttributionRow = {
  id: string;
  platform: string;
  campaign: string;
  adSet: string;
  ad: string;
  spend: number;
  impressions: number;
  clicks: number;
  visitors: number;
  checkoutStarts: number;
  purchases: number;
  revenue: number;
};

export type DataIssue = {
  id: string;
  type: string;
  severity: "Aşağı" | "Orta" | "Yüksək";
  contact: string;
  issue: string;
  suggestion: string;
  status: string;
};

export const crmContacts: CrmContact[] = [
  {
    id: "CNT-1001",
    name: "Nigar Məmmədova",
    email: "nigar@example.com",
    phone: "+994 50 123 45 67",
    company: "Kapital Bank",
    role: "Product Manager",
    lifecycle: "Müştəri",
    interests: ["AI", "Fintech", "Risk"],
    source: "Meta Ads",
    consent: "Email+SMS",
    events: ["AI & Finance Summit 2026"],
    tickets: 3,
    spend: 195,
    lastActivity: "13 iyul 2026, 11:20",
    risk: "Aşağı",
  },
  {
    id: "CNT-1002",
    name: "Rauf Əliyev",
    email: "rauf@example.com",
    phone: "+994 55 228 10 11",
    company: "Startup Hub",
    role: "Founder",
    lifecycle: "Ödəniş gözləyir",
    interests: ["Startap", "Fintech"],
    source: "LinkedIn Ads",
    consent: "Email",
    events: ["AI & Finance Summit 2026"],
    tickets: 1,
    spend: 50,
    lastActivity: "13 iyul 2026, 10:05",
    risk: "Orta",
  },
  {
    id: "CNT-1003",
    name: "Aysel Quliyeva",
    email: "aysel@example.com",
    phone: "+994 70 441 22 90",
    company: "Growth Lab",
    role: "Marketing Lead",
    lifecycle: "Ləğv edilmiş",
    interests: ["Marketinq", "Data"],
    source: "Google Search",
    consent: "SMS",
    events: ["Marketing Data Lab"],
    tickets: 1,
    spend: 25,
    lastActivity: "12 iyul 2026, 18:40",
    risk: "Yüksək",
  },
  {
    id: "CNT-1004",
    name: "Murad Həsənli",
    email: "murad@fintech.example",
    phone: "+994 51 300 44 20",
    company: "PayTech Lab",
    role: "Partnerships",
    lifecycle: "Lead",
    interests: ["Fintech", "Sponsorluq"],
    source: "Organic",
    consent: "Email+SMS",
    events: ["Fintech Founders Meetup 2025"],
    tickets: 1,
    spend: 0,
    lastActivity: "10 iyul 2026, 15:10",
    risk: "Aşağı",
  },
  {
    id: "CNT-1005",
    name: "Lalə Əhmədova",
    email: "lala@example.com",
    phone: "+994 77 550 19 26",
    company: "Media Group",
    role: "Editor",
    lifecycle: "Prospekt",
    interests: ["AI", "Marketinq"],
    source: "Newsletter",
    consent: "Email",
    events: [],
    tickets: 0,
    spend: 0,
    lastActivity: "9 iyul 2026, 09:30",
    risk: "Orta",
  },
];

export const crmParticipants: CrmParticipant[] = [
  {
    id: "ATT-2081",
    contactId: "CNT-1001",
    name: "Nigar Məmmədova",
    email: "nigar@example.com",
    phone: "+994 50 123 45 67",
    event: "AI & Finance Summit 2026",
    ticket: "VIP",
    status: "Ödənilib",
    checkIn: "Gözləyir",
    source: "Meta Ads",
    interests: "AI, Fintech",
  },
  {
    id: "ATT-2081-B",
    contactId: "CNT-1001",
    name: "Nigar Məmmədova",
    email: "nigar@example.com",
    phone: "+994 50 123 45 67",
    event: "AI & Finance Summit 2026",
    ticket: "Standard",
    status: "Ödənilib",
    checkIn: "Gözləyir",
    source: "Meta Ads",
    interests: "AI, Fintech",
  },
  {
    id: "ATT-2082",
    contactId: "CNT-1002",
    name: "Rauf Əliyev",
    email: "rauf@example.com",
    phone: "+994 55 228 10 11",
    event: "AI & Finance Summit 2026",
    ticket: "Standard",
    status: "Ödəniş gözlənilir",
    checkIn: "Aktiv deyil",
    source: "LinkedIn Ads",
    interests: "Startap",
  },
  {
    id: "ATT-2083",
    contactId: "CNT-1003",
    name: "Aysel Quliyeva",
    email: "aysel@example.com",
    phone: "+994 70 441 22 90",
    event: "Marketing Data Lab",
    ticket: "Online Live",
    status: "Ləğv edilib",
    checkIn: "Bağlı",
    source: "Google Search",
    interests: "Marketinq",
  },
];

export const abandonedCheckouts: AbandonedCheckout[] = [
  {
    id: "ABN-501",
    name: "Rauf Əliyev",
    email: "rauf@example.com",
    phone: "+994 55 228 10 11",
    event: "AI & Finance Summit 2026",
    ticket: "Standard",
    amount: 50,
    stage: "Ödənişə keçdi",
    reason: "Payment timeout",
    source: "LinkedIn Ads",
    utmCampaign: "linkedin_fintech_founders",
    lastSeen: "13 iyul 2026, 10:05",
    followUp: "1-ci xatırlatma göndərilib",
  },
  {
    id: "ABN-502",
    name: "Lalə Əhmədova",
    email: "lala@example.com",
    phone: "+994 77 550 19 26",
    event: "Marketing Data Lab",
    ticket: "Online Live",
    amount: 25,
    stage: "Məlumat yazıldı",
    reason: "Kart məlumatına keçmədi",
    source: "Newsletter",
    utmCampaign: "july_newsletter_data_lab",
    lastSeen: "12 iyul 2026, 21:18",
    followUp: "Gözləyir",
  },
  {
    id: "ABN-503",
    name: "Elvin Qasımov",
    email: "elvin@example.com",
    phone: "+994 50 900 88 10",
    event: "Startup Valuation Workshop",
    ticket: "Standard",
    amount: 35,
    stage: "Bilet seçildi",
    reason: "Form yarımçıq qaldı",
    source: "Meta Ads",
    utmCampaign: "meta_startup_earlybird",
    lastSeen: "11 iyul 2026, 17:42",
    followUp: "Promo təklif uyğun",
  },
];

export const crmSegments: CrmSegment[] = [
  {
    id: "SEG-01",
    name: "AI və Fintech marağı",
    rule: "interests contains AI or Fintech + consent exists",
    size: 184,
    channel: "Email, Meta Custom Audience",
    sync: "Sinxron",
    lastSync: "14 iyul 2026, 09:00",
  },
  {
    id: "SEG-02",
    name: "Yarımçıq checkout",
    rule: "checkout abandoned in last 14 days",
    size: 37,
    channel: "Email, SMS",
    sync: "Yeniləmə lazımdır",
    lastSync: "13 iyul 2026, 18:00",
  },
  {
    id: "SEG-03",
    name: "VIP potensialı",
    rule: "spend >= 100 OR company in finance",
    size: 52,
    channel: "LinkedIn Matched Audiences",
    sync: "Planlaşdırılıb",
    lastSync: "12 iyul 2026, 10:30",
  },
];

export const adAudiences: AdAudience[] = [
  {
    id: "AUD-101",
    name: "Checkout başladı, almadı",
    platform: "Meta",
    rule: "InitiateCheckout - Purchase, 14 gün",
    size: 980,
    matchRate: 71,
    consentCoverage: 86,
    sync: "Aktiv",
    lastSync: "14 iyul 2026, 08:45",
  },
  {
    id: "AUD-102",
    name: "AI/Fintech lookalike",
    platform: "Meta",
    rule: "AI & Fintech alıcılarından 1% lookalike",
    size: 18400,
    matchRate: 64,
    consentCoverage: 92,
    sync: "Aktiv",
    lastSync: "14 iyul 2026, 08:50",
  },
  {
    id: "AUD-103",
    name: "LinkedIn finance leads",
    platform: "LinkedIn",
    rule: "Finance job titles + event page visits",
    size: 2140,
    matchRate: 58,
    consentCoverage: 79,
    sync: "Yoxlama lazımdır",
    lastSync: "13 iyul 2026, 16:20",
  },
];

export const attributionRows: AttributionRow[] = [
  {
    id: "UTM-01",
    platform: "Meta",
    campaign: "AI Finance Awareness",
    adSet: "Bank & Fintech",
    ad: "Speaker teaser",
    spend: 420,
    impressions: 58000,
    clicks: 1240,
    visitors: 960,
    checkoutStarts: 86,
    purchases: 23,
    revenue: 2940,
  },
  {
    id: "UTM-02",
    platform: "LinkedIn",
    campaign: "Fintech Decision Makers",
    adSet: "Founders & PMs",
    ad: "Agenda carousel",
    spend: 650,
    impressions: 24000,
    clicks: 410,
    visitors: 340,
    checkoutStarts: 52,
    purchases: 17,
    revenue: 2105,
  },
  {
    id: "UTM-03",
    platform: "Google",
    campaign: "Event Search",
    adSet: "AI finance keywords",
    ad: "Search text ad",
    spend: 210,
    impressions: 8600,
    clicks: 520,
    visitors: 480,
    checkoutStarts: 34,
    purchases: 9,
    revenue: 875,
  },
  {
    id: "UTM-04",
    platform: "Newsletter",
    campaign: "July CRM digest",
    adSet: "Subscribers",
    ad: "Email CTA",
    spend: 0,
    impressions: 5200,
    clicks: 610,
    visitors: 590,
    checkoutStarts: 31,
    purchases: 12,
    revenue: 1075,
  },
];

export const dataIssues: DataIssue[] = [
  {
    id: "DQ-01",
    type: "Dublikat kontakt",
    severity: "Yüksək",
    contact: "Nigar Məmmədova",
    issue: "Eyni email üzrə 2 iştirakçı profili yaranıb.",
    suggestion: "Kontaktları birləşdir, bilet tarixçəsini saxla.",
    status: "Açıq",
  },
  {
    id: "DQ-02",
    type: "Razılıq çatışmır",
    severity: "Orta",
    contact: "Aysel Quliyeva",
    issue: "Email marketinq razılığı yoxdur.",
    suggestion: "Consent yeniləmə linki göndər.",
    status: "Açıq",
  },
  {
    id: "DQ-03",
    type: "Telefon formatı",
    severity: "Aşağı",
    contact: "Elvin Qasımov",
    issue: "Telefon nömrəsi E.164 formatında saxlanmayıb.",
    suggestion: "+994 formatına normallaşdır.",
    status: "Açıq",
  },
  {
    id: "DQ-04",
    type: "UTM boşluğu",
    severity: "Orta",
    contact: "Lalə Əhmədova",
    issue: "Checkout var, amma utm_content boşdur.",
    suggestion: "Kampaniya link şablonunu yenilə.",
    status: "Açıq",
  },
];

export function money(value: number) {
  return `${value.toLocaleString("az-AZ")} AZN`;
}
