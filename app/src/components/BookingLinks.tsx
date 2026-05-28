import type { Trip } from "../types";
import type { Settings } from "../lib/settings";
import { googleFlightsUrl, skyscannerUrl, bookingUrl, getYourGuideUrl } from "../lib/booking";

type Props = { trip: Trip; settings: Settings };

export function BookingLinks({ trip, settings }: Props) {
  const origin = trip.origin || settings.originCity;
  const noAffiliates = !settings.skyscannerAffiliate && !settings.bookingAffiliate;

  return (
    <div className="booking-links">
      <p className="settings-hint">
        Links directos para reservar, con fechas y destinos ya cargados. Si configurás tus IDs de afiliado
        (Configuración), los links de Booking/Skyscanner los incluyen y podés generar comisiones.
      </p>

      <div className="booking-section">
        <h3>✈️ Vuelos</h3>
        <div className="booking-row">
          <a className="booking-link" href={googleFlightsUrl(origin, trip.destinations[0] ?? "", trip.startDate)} target="_blank" rel="noreferrer">
            Google Flights ({origin} → {trip.destinations[0]}) ↗
          </a>
          <a className="booking-link" href={skyscannerUrl(trip.destinations[0] ?? "", settings.skyscannerAffiliate)} target="_blank" rel="noreferrer">
            Skyscanner ↗
          </a>
        </div>
      </div>

      {trip.destinations.map((dest) => (
        <div className="booking-section" key={dest}>
          <h3>🏨 {dest}</h3>
          <div className="booking-row">
            <a className="booking-link" href={bookingUrl(dest, trip.startDate, trip.endDate, settings.bookingAffiliate)} target="_blank" rel="noreferrer">
              Hoteles en Booking.com ↗
            </a>
            <a className="booking-link" href={getYourGuideUrl(dest)} target="_blank" rel="noreferrer">
              Tours en GetYourGuide ↗
            </a>
          </div>
        </div>
      ))}

      {noAffiliates && (
        <p className="settings-hint">
          💡 Tip: estos links funcionan sin afiliado. Para monetizar, cargá tus IDs de afiliado en Configuración.
        </p>
      )}
    </div>
  );
}
