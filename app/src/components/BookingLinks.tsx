import type { Trip } from "../types";
import {
  googleFlightsUrl, skyscannerUrl, wayAwayUrl, bookingUrl,
  getYourGuideUrl, insuranceUrl, esimUrl, carRentalUrl,
} from "../lib/booking";
import { track } from "../lib/analytics";
import { useT } from "../i18n";

type Props = { trip: Trip };

export function BookingLinks({ trip }: Props) {
  const t = useT();
  const origin = trip.origin || "Buenos Aires";
  const first = trip.destinations[0] ?? "";
  const click = (platform: string) => track("booking_click", { platform });

  return (
    <div className="booking-links">
      <p className="settings-hint">{t("booking.hint")}</p>

      <div className="booking-section">
        <h3>{t("booking.flights")}</h3>
        <div className="booking-row">
          <a className="booking-link" href={googleFlightsUrl(origin, first, trip.startDate)} target="_blank" rel="noreferrer sponsored" onClick={() => click("google_flights")}>
            {t("booking.googleFlights", { origin, dest: first })}
          </a>
          <a className="booking-link" href={skyscannerUrl(first)} target="_blank" rel="noreferrer sponsored" onClick={() => click("skyscanner")}>
            {t("booking.skyscanner")}
          </a>
          <a className="booking-link" href={wayAwayUrl(origin, first)} target="_blank" rel="noreferrer sponsored" onClick={() => click("wayaway")}>
            {t("booking.wayaway")}
          </a>
        </div>
      </div>

      {trip.destinations.map((dest) => (
        <div className="booking-section" key={dest}>
          <h3>🏨 {dest}</h3>
          <div className="booking-row">
            <a className="booking-link" href={bookingUrl(dest, trip.startDate, trip.endDate)} target="_blank" rel="noreferrer sponsored" onClick={() => click("booking")}>
              {t("booking.hotels")}
            </a>
            <a className="booking-link" href={getYourGuideUrl(dest)} target="_blank" rel="noreferrer sponsored" onClick={() => click("getyourguide")}>
              {t("booking.tours")}
            </a>
            <a className="booking-link" href={carRentalUrl(dest, trip.startDate, trip.endDate)} target="_blank" rel="noreferrer sponsored" onClick={() => click("car_rental")}>
              {t("booking.cars")}
            </a>
          </div>
        </div>
      ))}

      <div className="booking-section">
        <h3>{t("booking.essentials")}</h3>
        <div className="booking-essentials">
          <a className="booking-essential" href={insuranceUrl(trip.startDate, trip.endDate)} target="_blank" rel="noreferrer sponsored" onClick={() => click("insurance")}>
            <span className="booking-essential-icon">🛡️</span>
            <span className="booking-essential-text">
              <strong>{t("booking.insurance")}</strong>
              <small>{t("booking.insuranceDesc")}</small>
            </span>
          </a>
          <a className="booking-essential" href={esimUrl(first)} target="_blank" rel="noreferrer sponsored" onClick={() => click("esim")}>
            <span className="booking-essential-icon">📶</span>
            <span className="booking-essential-text">
              <strong>{t("booking.esim")}</strong>
              <small>{t("booking.esimDesc")}</small>
            </span>
          </a>
        </div>
      </div>

      <p className="booking-disclosure">{t("booking.disclosure")}</p>
    </div>
  );
}
