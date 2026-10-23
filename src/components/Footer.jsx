const CONTACT = {
  phone: "+91 00000 00000",
  email: "support@example.com",
  hours: "Mon–Sat, 9–6",
};

export default function Footer() {
  return (
    <footer className="mt-24 border-t-2 border-ink px-6 py-10 md:px-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 text-xl md:flex-row md:items-baseline md:justify-between">
        <span className="font-bold tracking-tight">Gasveno</span>
        <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="tabular-nums hover:underline">
          {CONTACT.phone}
        </a>
        <a href={`mailto:${CONTACT.email}`} className="hover:underline">
          {CONTACT.email}
        </a>
        <span className="italic text-ink/60">{CONTACT.hours}</span>
      </div>
    </footer>
  );
}