import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import 'bootstrap/dist/css/bootstrap.min.css';

const DataParadas = () => {
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [fileAB, setFileAB] = useState(null);
  const [fileBA, setFileBA] = useState(null);

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    const { data, error } = await supabase.from("buses").select("*");
    if (error) {
      console.error("❌ Error cargando buses:", error.message);
    } else {
      setBuses(data);
    }
  };

  const handleBusSelect = (e) => {
    const busId = parseInt(e.target.value);
    const selected = buses.find((bus) => bus.id === busId);
    setSelectedBus(selected);
    setFileAB(null);
    setFileBA(null);
    console.log("📌 Bus seleccionado:", selected);
  };

  const handleFileChange = (e, direction) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/json") {
      alert("Solo se permiten archivos .json");
      return;
    }
    if (direction === "ab") setFileAB(file);
    if (direction === "ba") setFileBA(file);
  };

  const handleUpload = async (direction) => {
    const file = direction === "ab" ? fileAB : fileBA;
    if (!file || !selectedBus) {
      alert("Selecciona un bus y un archivo válido");
      return;
    }

    const folder = direction;
    const apodo = selectedBus.apodo;
    const fileName = `${apodo}.${direction}.json`;
    const path = `${folder}/${fileName}`;

    // Si hay archivo anterior, eliminarlo
    const previousUrl = direction === "ab" ? selectedBus.url_ab : selectedBus.url_ba;
    if (previousUrl) {
      const pathToDelete = previousUrl.split("/storage/v1/object/public/por-mini/")[1];
      console.log("🗑️ Eliminando archivo anterior:", pathToDelete);
      await supabase.storage.from("buses").remove([pathToDelete]);
    }

    // Subir nuevo archivo
    console.log("📤 Subiendo nuevo archivo:", path);
    const { error: uploadError } = await supabase.storage
      .from("por-mini")
      .upload(path, file, {
        contentType: "application/json",
        upsert: true
      });

    if (uploadError) {
      console.error("❌ Error subiendo archivo:", uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("por-mini").getPublicUrl(path);
    const publicUrl = publicUrlData.publicUrl;
    console.log(`✅ Archivo subido correctamente: ${publicUrl}`);

    // Actualizar campo en base de datos
    const updateField = direction === "ab" ? { url_ab: publicUrl } : { url_ba: publicUrl };
    const { error: updateError } = await supabase
      .from("buses")
      .update(updateField)
      .eq("id", selectedBus.id);

    if (updateError) {
      console.error("❌ Error actualizando la URL del archivo:", updateError.message);
    } else {
      console.log("✅ Base de datos actualizada correctamente.");
      fetchBuses(); // recarga para reflejar los cambios
    }
  };

  return (
    <div className="container mt-4">
      <h3>🚌 Administrar Paradas</h3>

      <div className="form-group my-3">
        <label>Selecciona un bus:</label>
        <select className="form-control" onChange={handleBusSelect} defaultValue="">
          <option value="" disabled>-- Selecciona un bus --</option>
          {buses.map((bus) => (
            <option key={bus.id} value={bus.id}>
              {bus.apodo}
            </option>
          ))}
        </select>
      </div>

      {selectedBus && (
        <>
          <div className="mb-3">
            <label>📂 Archivo AB (.json)</label>
            <input type="file" accept=".json" onChange={(e) => handleFileChange(e, "ab")} />
            <button className="btn btn-primary btn-sm ml-2" onClick={() => handleUpload("ab")}>
              Subir AB
            </button>
            {selectedBus.url_ab && <p className="mt-2">🌐 <a href={selectedBus.url_ab} target="_blank" rel="noreferrer">Ver archivo AB actual</a></p>}
          </div>

          <div className="mb-3">
            <label>📂 Archivo BA (.json)</label>
            <input type="file" accept=".json" onChange={(e) => handleFileChange(e, "ba")} />
            <button className="btn btn-primary btn-sm ml-2" onClick={() => handleUpload("ba")}>
              Subir BA
            </button>
            {selectedBus.url_ba && <p className="mt-2">🌐 <a href={selectedBus.url_ba} target="_blank" rel="noreferrer">Ver archivo BA actual</a></p>}
          </div>
        </>
      )}
    </div>
  );
};

export default DataParadas;
