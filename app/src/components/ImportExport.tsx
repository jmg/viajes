import { useRef, useState } from "react";
import type { Trip } from "../types";

type Props = {
  trips: Trip[];
  onImport: (trips: Trip[], mode: "merge" | "replace") => void;
};

export function ImportExport({ trips, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const downloadAll = () => {
    const blob = new Blob([JSON.stringify(trips, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `viajes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = async (mode: "merge" | "replace") => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Seleccioná un archivo JSON primero.");
      return;
    }
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error("El archivo no contiene un array de viajes.");
      // minimal validation
      for (const t of data) {
        if (!t.id || !t.title || !t.startDate || !t.endDate) {
          throw new Error("Algún viaje no tiene los campos obligatorios.");
        }
      }
      onImport(data as Trip[], mode);
      setInfo(`Importados ${data.length} viajes (${mode === "merge" ? "agregados" : "reemplazaron todo"}).`);
      setError(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al leer el archivo.";
      setError(msg);
      setInfo(null);
    }
  };

  return (
    <div className="import-export">
      <section>
        <h3>Exportar</h3>
        <p>Descargá todos los viajes como JSON para backup o para mover a otra máquina.</p>
        <button className="button-secondary" onClick={downloadAll}>
          ⬇ Descargar {trips.length} viajes
        </button>
      </section>

      <section>
        <h3>Importar</h3>
        <p>Subí un JSON exportado de esta app.</p>
        <input ref={fileRef} type="file" accept="application/json" />
        <div className="form-actions">
          <button className="button-secondary" onClick={() => handleFile("merge")}>Agregar a los existentes</button>
          <button className="button-secondary" onClick={() => handleFile("replace")}>Reemplazar todo</button>
        </div>
        {error && <p className="form-error">{error}</p>}
        {info && <p className="form-info">{info}</p>}
      </section>
    </div>
  );
}
