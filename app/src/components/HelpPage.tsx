type Props = { onBack: () => void; onDiscover: () => void };

export function HelpPage({ onBack, onDiscover }: Props) {
  return (
    <div className="help-page">
      <button className="back-button" onClick={onBack}>← Volver</button>

      <header className="help-hero">
        <h1>❓ Ayuda</h1>
        <p>Todo lo que necesitás saber para usar Viajes y entender los datos de clima.</p>
      </header>

      <section className="help-section">
        <h2>🧭 ¿Cómo funciona?</h2>
        <ol className="help-steps">
          <li><strong>Descubrir:</strong> elegís el mes en que querés viajar y movés los filtros (clima, presupuesto, horas de vuelo, regiones). Te ordenamos 620 destinos del mejor al peor clima para ese mes.</li>
          <li><strong>Crear viaje:</strong> tocás <em>“+ Crear viaje”</em> en un destino y se arma solo, con fechas según el mes elegido. Sin formularios.</li>
          <li><strong>Planificar:</strong> en el viaje cargás itinerario, presupuesto, gastos del grupo y checklist. Exportás al calendario o a PDF, y compartís por link.</li>
        </ol>
        <p>Todo se guarda <strong>solo en tu navegador</strong> (no hay cuentas ni servidor). Si borrás los datos del navegador, se pierden: por eso conviene compartir el link como respaldo.</p>
      </section>

      <section className="help-section">
        <h2>🌡 Cómo leer el clima</h2>
        <p>Para cada destino mostramos el <strong>clima típico</strong> mes a mes. Estos son los términos que vas a ver:</p>
        <div className="help-defs">
          <div className="help-def">
            <h3>Temperatura (mín – máx)</h3>
            <p>La <strong>mínima</strong> suele darse de madrugada y la <strong>máxima</strong> al mediodía. El “promedio” es el punto medio del día. Ej.: <em>12° – 24°</em> significa noches frescas y tardes agradables.</p>
          </div>
          <div className="help-def">
            <h3>Lluvia (mm en el mes)</h3>
            <p>Los <strong>milímetros (mm)</strong> miden cuánta lluvia cae en <em>todo el mes</em> (no por día). Como referencia:</p>
            <ul>
              <li><strong>&lt; 30 mm</strong> → mes seco ☀️</li>
              <li><strong>30–100 mm</strong> → lluvia moderada 🌦</li>
              <li><strong>100–200 mm</strong> → lluvioso 🌧</li>
              <li><strong>&gt; 200 mm</strong> → muy lluvioso 🌧🌧</li>
            </ul>
            <p>Más mm = más días de lluvia o lluvias más intensas. En el filtro, llevá el slider hacia ☀️ para ver solo destinos secos en ese mes.</p>
          </div>
          <div className="help-def">
            <h3>Temperatura del mar</h3>
            <p>Cuánto está el agua. Desde <strong>~24°</strong> se siente cálida para nadar sin traje; por debajo de 20° suele estar fría.</p>
          </div>
          <div className="help-def">
            <h3>Horas de sol</h3>
            <p>Promedio de horas de sol por día en el mes. Más horas = días más despejados y largos.</p>
          </div>
        </div>
      </section>

      <section className="help-section">
        <h2>🌟 El “rating” del mes</h2>
        <p>Combinamos temperatura y lluvia para decirte, de un vistazo, qué tan recomendable es cada destino en el mes elegido:</p>
        <ul className="help-ratings">
          <li><span className="rating-pill rating-ideal">🌟 Ideal</span> Clima muy cómodo para ese destino.</li>
          <li><span className="rating-pill rating-good">✅ Bueno</span> Buen clima, con algún detalle menor.</li>
          <li><span className="rating-pill rating-ok">⚠ Aceptable</span> Se puede, pero hay calor, frío o lluvia a tener en cuenta.</li>
          <li><span className="rating-pill rating-avoid">❌ Evitar</span> Mes poco recomendable por temperatura o lluvia.</li>
        </ul>
        <p>Si ajustás tu temperatura o lluvia ideal en los filtros, el rating se recalcula a tu gusto.</p>
      </section>

      <section className="help-section">
        <h2>📊 “Típico” vs “real” (promedio 5 años)</h2>
        <p>En la página del destino vas a ver dos cosas distintas:</p>
        <ul>
          <li><strong>Clima típico (normales):</strong> los gráficos de barras y líneas con el promedio histórico de cada mes. Sirve para comparar destinos.</li>
          <li><strong>Clima real día a día:</strong> el <strong>promedio de los últimos 5 años</strong> en esas fechas exactas, con datos satelitales <strong>ERA5</strong> (Open-Meteo). Da una idea más fiel de qué esperar que un solo año, que puede ser atípico.</li>
        </ul>
        <p>Mostramos ~10 días salteados (uno cada 3) para que veas cómo viene el mes completo. Tres cosas que aparecen ahí:</p>
        <ul>
          <li><strong>El ícono ☀️🌤⛅🌦🌧:</strong> refleja la <em>probabilidad de lluvia</em> de ese día, no un pronóstico exacto. Si ves ☀️ con 0 mm, es un día que casi siempre salió seco.</li>
          <li><strong>“% prob. lluvia”:</strong> en cuántos de los últimos años llovió ese día. Ej.: <em>20%</em> = llovió 1 de cada 5 años (o sea, casi siempre estuvo seco). No es cuánta lluvia, es qué tan probable.</li>
          <li><strong>± (desvío):</strong> cuánto suele variar ese día de un año a otro. Ej.: <em>28° ±3</em> = la máxima rondó los 28°, moviéndose unos 3° entre años.</li>
        </ul>
      </section>

      <section className="help-section">
        <h2>💰 Presupuesto y gastos</h2>
        <ul>
          <li><strong>Presupuesto:</strong> tu estimación antes de viajar (rango en dólares). Te mostramos el total y cuánto sale por persona.</li>
          <li><strong>Gastos:</strong> lo que realmente vas gastando. Anotás quién pagó qué, lo dividimos entre los viajeros y te decimos cómo saldar las cuentas.</li>
        </ul>
      </section>

      <section className="help-section">
        <h2>✈️ Para argentinos</h2>
        <p>Cada destino indica el tiempo de vuelo desde <strong>Buenos Aires (EZE)</strong> y la visa: <strong>Sin visa</strong>, <strong>E-visa</strong> (online) o <strong>Visa requerida</strong>. Es orientativo; confirmá siempre con el consulado.</p>
      </section>

      <div className="help-cta">
        <button className="button-primary" onClick={onDiscover}>🌎 Empezar a descubrir destinos</button>
      </div>

      <p className="help-foot">Fuente de clima: <a href="https://open-meteo.com" target="_blank" rel="noreferrer">Open-Meteo</a> (Forecast + archivo ERA5). Gratis y sin keys.</p>
    </div>
  );
}
