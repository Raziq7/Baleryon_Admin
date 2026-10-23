/**
 * Global GIF-based loader for the admin portal.
 *
 * `<Loader />` renders the full-page loading state (page loads, auth
 * checks). `<InlineLoader />` renders a small spinner for buttons/inline
 * async states (form submissions, shipment/status updates, Delhivery
 * calls) so the layout never jumps while an action is in flight.
 *
 * The GIF asset lives at `/public/loader.gif` — replace that one file to
 * change the loader everywhere.
 */
const Loader = () => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="bg-white w-full min-h-screen flex flex-col justify-center items-center gap-3"
    >
      <img
        src="/loader.gif"
        alt="Loading"
        width={96}
        height={96}
        draggable={false}
        className="select-none rounded-full"
      />
      <span className="sr-only">Loading…</span>
    </div>
  );
};

export function InlineLoader({
  size = 18,
  label,
  className = "",
}: {
  size?: number;
  label?: string;
  className?: string;
}) {
  return (
    <span
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`inline-flex items-center gap-2 ${className}`}
    >
      <img
        src="/loader.gif"
        alt="Loading"
        width={size}
        height={size}
        draggable={false}
        className="select-none rounded-full"
      />
      {label && <span>{label}</span>}
      <span className="sr-only">Loading…</span>
    </span>
  );
}

export default Loader;
