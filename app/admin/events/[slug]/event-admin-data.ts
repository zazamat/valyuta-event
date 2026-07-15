import { attendees, buyerTickets, events, orders, promoCodes } from "../../../data/demo";

export type AdminEvent = (typeof events)[number] & {
  description?: string;
  media?: {
    photos?: Array<{ title: string; url: string }>;
    pressLinks?: Array<{ title: string; url: string }>;
    videos?: Array<{ title: string; provider: string; url: string; embedUrl: string }>;
  };
  organizer?: { name: string; description: string; email: string; phone: string };
  policies?: string[];
  registrationQuestions?: string[];
  speakers?: Array<{
    name: string;
    role: string;
    company: string;
    bio: string;
    topic: string;
    linkedin: string;
    photo: string;
  }>;
  sponsors?: Array<{
    name: string;
    tier: string;
    website: string;
    description: string;
    logo: string;
  }>;
};

export function findEvent(slug: string) {
  return events.find((item) => item.slug === slug) as AdminEvent | undefined;
}

export function percent(value: number, total: number) {
  return Math.min(Math.round((value / Math.max(total, 1)) * 100), 100);
}

export function getEventAdminContext(event: AdminEvent) {
  const eventAttendees = attendees.filter((item) => item.event === event.title);
  const eventOrders = orders.filter((item) => item.event === event.title);
  const eventTickets = buyerTickets.filter((item) => item.event === event.title);
  const eventPromoCodes = promoCodes.filter((item) => item.event === event.title);
  const checkedIn = eventTickets.filter((item) => item.checkInStatus === "checked_in").length;
  const revenue = eventOrders.reduce((sum, item) => {
    const amount = Number.parseFloat(item.amount);
    return Number.isNaN(amount) ? sum : sum + amount;
  }, 0);

  return {
    checkedIn,
    eventAttendees,
    eventOrders,
    eventPromoCodes,
    eventTickets,
    progress: percent(event.sold, event.capacity),
    remaining: Math.max(event.capacity - event.sold, 0),
    revenue,
  };
}

export const attendeeColumns = [
  { key: "id", label: "ID", width: "120px" },
  { key: "name", label: "İştirakçı", width: "190px" },
  { key: "email", label: "Email", width: "220px" },
  { key: "phone", label: "Telefon", width: "170px" },
  { key: "ticket", label: "Bilet", width: "140px" },
  { key: "status", label: "Status", width: "150px", badge: true },
  { key: "interests", label: "Maraqlar", width: "180px" },
  { key: "source", label: "Mənbə", width: "150px" },
  { key: "action", label: "Əməliyyat", width: "190px" },
];

export const orderColumns = [
  { key: "id", label: "Sifariş ID", width: "130px" },
  { key: "attendee", label: "Alıcı", width: "190px" },
  { key: "email", label: "Email", width: "220px" },
  { key: "phone", label: "Telefon", width: "170px" },
  { key: "ticket", label: "Bilet", width: "140px" },
  { key: "amount", label: "Məbləğ", width: "120px" },
  { key: "status", label: "Ödəniş statusu", width: "160px", badge: true },
  { key: "action", label: "Əməliyyat", width: "190px" },
];

export function buildAttendeeRows(event: AdminEvent) {
  return getEventAdminContext(event).eventAttendees.map((attendee) => ({
    ...attendee,
    action: "Profilə bax / Düzəliş et",
  }));
}

export function buildOrderRows(event: AdminEvent) {
  const { eventAttendees, eventOrders } = getEventAdminContext(event);

  return eventOrders.map((order) => {
    const matchedAttendee = eventAttendees.find(
      (attendee) => attendee.phone === order.phone || attendee.name === order.attendee,
    );

    return {
      ...order,
      action: "Sifarişə bax / Qəbz",
      email: matchedAttendee?.email ?? "Email qeyd olunmayıb",
    };
  });
}
