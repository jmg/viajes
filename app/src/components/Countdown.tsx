import type { Trip } from "../types";
import { autoStatus, daysUntilEnd, daysUntilStart } from "../lib/status";
import { useT } from "../i18n";

type Props = { trip: Trip };

export function Countdown({ trip }: Props) {
  const t = useT();
  const status = autoStatus(trip);
  if (status === "past") {
    const daysAgo = -daysUntilEnd(trip);
    return <span className="countdown past">{daysAgo === 1 ? t("countdown.backDay", { n: daysAgo }) : t("countdown.backDays", { n: daysAgo })}</span>;
  }
  if (status === "in-progress") {
    const left = daysUntilEnd(trip);
    return <span className="countdown live">{left === 1 ? t("countdown.inProgressOne", { n: left }) : t("countdown.inProgress", { n: left })}</span>;
  }
  const d = daysUntilStart(trip);
  if (d === 0) return <span className="countdown soon">{t("countdown.leavesToday")}</span>;
  if (d === 1) return <span className="countdown soon">{t("countdown.tomorrow")}</span>;
  if (d < 30) return <span className="countdown soon">{t("countdown.daysToGo", { n: d })}</span>;
  return <span className="countdown upcoming">{t("countdown.daysToGo", { n: d })}</span>;
}
