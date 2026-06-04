import type { Part } from "../dict";

export const weather: Part = {
  es: {
    weather: {
      titleForecast: "🌤 Pronóstico — {dest}",
      titleHistorical: "📜 Tiempo histórico — {dest}",
      titlePriorYear: "📅 Promedio últimos {years} años en estas fechas — {dest}",
      tipForecast: "Pronóstico real de Open-Meteo para los próximos días.",
      tipHistorical: "Lo que ocurrió realmente en estas fechas, según el archivo histórico ERA5.",
      tipPriorYear:
        "Promedio día a día de los últimos {years} años (datos satelitales ERA5). Da una idea realista de qué esperar, mejor que un único año que puede ser atípico.",
      subtitlePriorYear:
        "Promedio día por día de los últimos {years} años (datos ERA5). Más robusto que un único año atípico.",
      loadingAria: "Cargando datos de Open-Meteo…",
      loadError: "No se pudo cargar ({error}). Las normales climáticas del gráfico siguen disponibles.",
      cardTip: "{date} — máx {max}°, mín {min}°",
      cardTipRain: "{date} — máx {max}°, mín {min}° · {prob}% de probabilidad de lluvia",
      tempTip: "Mínima / máxima promedio del día",
      stdevTip: "Variación típica entre años: cuánto suele cambiar la máxima de ese día de un año a otro.",
      rainTip: "Lluvia promedio acumulada en el día",
      rainProbTipPriorYear:
        "Probabilidad de lluvia: en el {prob}% de los últimos {years} años llovió este día (más de 1 mm).",
      rainProbTip: "Probabilidad de lluvia ese día: {prob}%.",
      rainProbLabel: "{prob}% prob. lluvia",
    },
  },
  pt: {
    weather: {
      titleForecast: "🌤 Previsão — {dest}",
      titleHistorical: "📜 Tempo histórico — {dest}",
      titlePriorYear: "📅 Média dos últimos {years} anos nestas datas — {dest}",
      tipForecast: "Previsão real da Open-Meteo para os próximos dias.",
      tipHistorical: "O que de fato ocorreu nestas datas, segundo o arquivo histórico ERA5.",
      tipPriorYear:
        "Média dia a dia dos últimos {years} anos (dados de satélite ERA5). Dá uma ideia realista do que esperar, melhor que um único ano que pode ser atípico.",
      subtitlePriorYear:
        "Média dia a dia dos últimos {years} anos (dados ERA5). Mais robusto que um único ano atípico.",
      loadingAria: "Carregando dados da Open-Meteo…",
      loadError: "Não foi possível carregar ({error}). As normais climáticas do gráfico continuam disponíveis.",
      cardTip: "{date} — máx {max}°, mín {min}°",
      cardTipRain: "{date} — máx {max}°, mín {min}° · {prob}% de probabilidade de chuva",
      tempTip: "Mínima / máxima média do dia",
      stdevTip: "Variação típica entre anos: quanto a máxima desse dia costuma mudar de um ano para outro.",
      rainTip: "Chuva média acumulada no dia",
      rainProbTipPriorYear:
        "Probabilidade de chuva: em {prob}% dos últimos {years} anos choveu neste dia (mais de 1 mm).",
      rainProbTip: "Probabilidade de chuva nesse dia: {prob}%.",
      rainProbLabel: "{prob}% prob. chuva",
    },
  },
  en: {
    weather: {
      titleForecast: "🌤 Forecast — {dest}",
      titleHistorical: "📜 Historical weather — {dest}",
      titlePriorYear: "📅 Average of the last {years} years on these dates — {dest}",
      tipForecast: "Real Open-Meteo forecast for the coming days.",
      tipHistorical: "What actually happened on these dates, according to the ERA5 historical archive.",
      tipPriorYear:
        "Day-by-day average of the last {years} years (ERA5 satellite data). Gives a realistic idea of what to expect, better than a single year that may be atypical.",
      subtitlePriorYear:
        "Day-by-day average of the last {years} years (ERA5 data). More robust than a single atypical year.",
      loadingAria: "Loading Open-Meteo data…",
      loadError: "Could not load ({error}). The chart's climate normals are still available.",
      cardTip: "{date} — high {max}°, low {min}°",
      cardTipRain: "{date} — high {max}°, low {min}° · {prob}% rain chance",
      tempTip: "Daily average low / high",
      stdevTip: "Typical year-to-year variation: how much that day's high tends to change from one year to the next.",
      rainTip: "Average accumulated rain for the day",
      rainProbTipPriorYear:
        "Rain chance: in {prob}% of the last {years} years it rained on this day (more than 1 mm).",
      rainProbTip: "Rain chance that day: {prob}%.",
      rainProbLabel: "{prob}% rain chance",
    },
  },
};
