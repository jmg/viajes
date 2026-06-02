import type { Trip } from "../types";
import { googleFlightsUrl, skyscannerUrl, bookingUrl, getYourGuideUrl } from "../lib/booking";
import { track } from "../lib/analytics";

type Props = { trip: Trip };

export function BookingLinks({ trip }: Props) {
  const origin = trip.origin || "Buenos Aires";
  const click = (platform: string) => track("booking_click", { platform });

  return (
    <div className="booking-links">
      <p className="settings-hint">
        Links directos para reservar, con tus fechas y destinos ya cargados.
      </p>

      <div className="booking-section">
        <h3>✈️ Vuelos</h3>
        <div className="booking-row">
          <a className="booking-link" href={googleFlightsUrl(origin, trip.destinations[0] ?? "", trip.startDate)} target="_blank" rel="noreferrer" onClick={() => click("google_flights")}>
            Google Flights ({origin} → {trip.destinations[0]}) ↗
          </a>
          <a className="booking-link" href={skyscannerUrl(trip.destinations[0] ?? "")} target="_blank" rel="noreferrer" onClick={() => click("skyscanner")}>
            Skyscanner ↗
          </a>
        </div>
      </div>

      {trip.destinations.map((dest) => (
        <div className="booking-section" key={dest}>
          <h3>🏨 {dest}</h3>
          <div className="booking-row">
            <a className="booking-link" href={bookingUrl(dest, trip.startDate, trip.endDate)} target="_blank" rel="noreferrer" onClick={() => click("booking")}>
              Hoteles en Booking.com ↗
            </a>
            <a className="booking-link" href={getYourGuideUrl(dest)} target="_blank" rel="noreferrer" onClick={() => click("getyourguide")}>
              Tours en GetYourGuide ↗
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
