import type { Trip } from "../types";
import { googleFlightsUrl, skyscannerUrl, bookingUrl, getYourGuideUrl } from "../lib/booking";
import { track } from "../lib/analytics";
import { useT } from "../i18n";

type Props = { trip: Trip };

export function BookingLinks({ trip }: Props) {
  const t = useT();
  const origin = trip.origin || "Buenos Aires";
  const click = (platform: string) => track("booking_click", { platform });

  return (
    <div className="booking-links">
      <p className="settings-hint">
        {t("booking.hint")}
      </p>

      <div className="booking-section">
        <h3>{t("booking.flights")}</h3>
        <div className="booking-row">
          <a className="booking-link" href={googleFlightsUrl(origin, trip.destinations[0] ?? "", trip.startDate)} target="_blank" rel="noreferrer" onClick={() => click("google_flights")}>
            {t("booking.googleFlights", { origin, dest: trip.destinations[0] ?? "" })}
          </a>
          <a className="booking-link" href={skyscannerUrl(trip.destinations[0] ?? "")} target="_blank" rel="noreferrer" onClick={() => click("skyscanner")}>
            {t("booking.skyscanner")}
          </a>
        </div>
      </div>

      {trip.destinations.map((dest) => (
        <div className="booking-section" key={dest}>
          <h3>🏨 {dest}</h3>
          <div className="booking-row">
            <a className="booking-link" href={bookingUrl(dest, trip.startDate, trip.endDate)} target="_blank" rel="noreferrer" onClick={() => click("booking")}>
              {t("booking.hotels")}
            </a>
            <a className="booking-link" href={getYourGuideUrl(dest)} target="_blank" rel="noreferrer" onClick={() => click("getyourguide")}>
              {t("booking.tours")}
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
