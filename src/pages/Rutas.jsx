import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import 'bootstrap/dist/css/bootstrap.min.css';

const Rutas = () => {
  const [rutas, setRutas] = useState([]);
  const [buses, setBuses] = useState([]);
  const [subidas, setSubidas] = useState([]);
  const [bajadas, setBajadas] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [inicios, setInicios] = useState([]);
  const [rutaBuses, setRutaBuses] = useState([]); // Para almacenar los buses por ruta
  const [form, setForm] = useState({
    id: null,
    id_inicio: "",
    id_destino: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    document.title = "Rutas - Admin";
    fetchData();
  }, []);

  const fetchData = async () => {
    const [
      { data: rutasData },
      { data: busesData },
      { data: subidasData },
      { data: bajadasData },
      { data: destinosData },
      { data: iniciosData },
    ] = await Promise.all([
      supabase.from("ruta").select("*"),
      supabase.from("buses").select("*"),
      supabase.from("subidas").select("*"),
      supabase.from("bajadas").select("*"),
      supabase.from("destino").select("*"),
      supabase.from("inicio").select("*"),
    ]);

    setRutas(rutasData || []);
    setBuses(busesData || []);
    setSubidas(subidasData || []);
    setBajadas(bajadasData || []);
    setDestinos(destinosData || []);
    setInicios(iniciosData || []);

    // Obtener los buses asociados a cada ruta
    const { data: rutaBusesData } = await supabase.from("ruta_buses").select("*");
    setRutaBuses(rutaBusesData || []);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRutaBusChange = (index, e) => {
    const { name, value } = e.target;
    setRutaBuses((prev) => {
      const updated = [...prev];
      updated[index][name] = value;
      return updated;
    });
  };

  const addRutaBus = () => {
    setRutaBuses([
      ...rutaBuses,
      { id_bus: "", id_subida: "", id_bajada: "", tiempo: "", comentario: "", precio: "" },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.id_inicio || !form.id_destino || rutaBuses.some((rb) => !rb.id_bus || !rb.id_subida || !rb.id_bajada || !rb.precio)) {
      setError("Todos los campos deben estar completos.");
      return;
    }

    try {
      let rutaId = form.id;

      const rutaData = {
        id_inicio: parseInt(form.id_inicio),
        id_destino: parseInt(form.id_destino),
      };

      if (editMode && rutaId) {
        const { error: errorRuta } = await supabase.from("ruta").update(rutaData).eq("id", rutaId);
        if (errorRuta) throw errorRuta;

        await supabase.from("ruta_buses").delete().eq("id_ruta", rutaId);
      } else {
        const { data, error: errorRuta } = await supabase.from("ruta").insert([rutaData]).select();
        if (errorRuta) throw errorRuta;
        rutaId = data[0].id;
      }

      const busesInsert = rutaBuses.map((rb) => ({
        id_ruta: rutaId,
        id_bus: parseInt(rb.id_bus),
        id_subida: parseInt(rb.id_subida),
        id_bajada: parseInt(rb.id_bajada),
        tiempo: rb.tiempo?.trim(),
        comentario: rb.comentario?.trim(),
        precio: parseFloat(rb.precio) || 0,
      }));

      const { error: errorRB } = await supabase.from("ruta_buses").insert(busesInsert);
      if (errorRB) throw errorRB;

      setSuccess(editMode ? "Ruta actualizada con éxito." : "Ruta agregada con éxito.");
      resetForm();
      fetchData();
    } catch (err) {
      console.error("Error:", err);
      setError("Ocurrió un error al guardar: " + err.message);
    }
  };

  const resetForm = () => {
    setForm({ id: null, id_inicio: "", id_destino: "" });
    setRutaBuses([{ id_bus: "", id_subida: "", id_bajada: "", tiempo: "", comentario: "", precio: "" }]);
    setEditMode(false);
    setError(null);
    setSuccess(null);
  };

  const handleEdit = async (ruta) => {
    setForm({
      id: ruta.id,
      id_inicio: ruta.id_inicio,
      id_destino: ruta.id_destino,
    });

    const rutaBusesData = await supabase.from("ruta_buses").select("*").eq("id_ruta", ruta.id);
    setRutaBuses(rutaBusesData.data || []);
    setEditMode(true);
  };

  const handleDelete = async (id) => {
    await supabase.from("ruta_buses").delete().eq("id_ruta", id);
    await supabase.from("ruta").delete().eq("id", id);
    fetchData();
  };

  const getNombre = (id, list) => list.find((i) => i.id === id)?.nombre || `ID ${id}`;
  const getApodo = (id, list) => list.find((i) => i.id === id)?.apodo || `ID ${id}`;

  return (
    <div className="container-fluid py-5">
      <div className="row">
        <div className="col-md-3 border-end pe-4">
          <h4 className="mb-4 text-center">{editMode ? "Editar Ruta" : "Agregar Ruta"}</h4>
          <form onSubmit={handleSubmit}>
            {[{ name: "id_inicio", label: "Inicio", data: inicios }, { name: "id_destino", label: "Destino", data: destinos }]
              .map(({ name, label, data }) => (
                <div className="mb-3" key={name}>
                  <label htmlFor={name} className="form-label">{label}</label>
                  <select
                    id={name}
                    name={name}
                    className="form-select"
                    value={form[name]}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Seleccionar {label}</option>
                    {data.map(item => (
                      <option key={item.id} value={item.id}>{item.nombre}</option>
                    ))}
                  </select>
                </div>
              ))}

            {rutaBuses.map((rb, index) => (
              <div key={index} className="border p-3 mb-3 rounded bg-light">
                <h6>Bus #{index + 1}</h6>
                {[{ name: "id_bus", label: "Bus", data: buses, getText: getApodo },
                  { name: "id_subida", label: "Subida", data: subidas },
                  { name: "id_bajada", label: "Bajada", data: bajadas }]
                  .map(({ name, label, data, getText }) => (
                    <div className="mb-2" key={name}>
                      <label className="form-label">{label}</label>
                      <select
                        name={name}
                        className="form-select"
                        value={rb[name]}
                        onChange={(e) => handleRutaBusChange(index, e)}
                        required
                      >
                        <option value="">Seleccionar {label}</option>
                        {data.map(item => (
                          <option key={item.id} value={item.id}>
                            {getText ? getText(item.id, data) : item.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                <div className="mb-2">
                  <label className="form-label">Tiempo</label>
                  <input
                    type="text"
                    name="tiempo"
                    className="form-control"
                    value={rb.tiempo}
                    onChange={(e) => handleRutaBusChange(index, e)}
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Comentario</label>
                  <textarea
                    name="comentario"
                    className="form-control"
                    rows="2"
                    value={rb.comentario}
                    onChange={(e) => handleRutaBusChange(index, e)}
                    required
                  ></textarea>
                </div>
                <div className="mb-2">
                  <label className="form-label">Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    name="precio"
                    className="form-control"
                    value={rb.precio}
                    onChange={(e) => handleRutaBusChange(index, e)}
                    required
                  />
                </div>
              </div>
            ))}
            <div className="text-center mb-3">
              <button type="button" className="btn btn-secondary btn-sm" onClick={addRutaBus}>Agregar otro bus</button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="d-flex justify-content-center gap-2 mt-4">
              <button type="submit" className="btn btn-primary px-4">
                {editMode ? "Actualizar" : "Agregar"}
              </button>
              {editMode && (
                <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="col-md-9 ps-4" style={{ maxHeight: "80vh", overflowY: "auto" }}>
          <h4 className="mb-4">Rutas Registradas</h4>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {rutas.map((ruta) => (
              <div key={ruta.id} className="col">
                <div className="card border rounded shadow-sm h-100">
                  <div className="card-body">
                    <h5 className="card-title">
                      De {getNombre(ruta.id_inicio, inicios)} a {getNombre(ruta.id_destino, destinos)}
                    </h5>
                    <p className="card-text">
                      <strong>Precio por bus:</strong> {ruta.precio}
                    </p>

                    {/* Mostrar los buses asociados a la ruta */}
                    <div className="mb-3">
                      <h6>Buses asociados:</h6>
                      {rutaBuses
                        .filter((rb) => rb.id_ruta === ruta.id)
                        .map((rb, index) => (
                          <div key={index} className="mb-2">
                            <strong>Bus:</strong> {getApodo(rb.id_bus, buses)}<br />
                            <strong>Subida:</strong> {getNombre(rb.id_subida, subidas)}<br />
                            <strong>Bajada:</strong> {getNombre(rb.id_bajada, bajadas)}<br />
                            <strong>Precio:</strong> {rb.precio}<br />
                          </div>
                        ))}
                    </div>

                    <div className="d-flex justify-content-between mt-3">
                      <button className="btn btn-outline-warning btn-sm" onClick={() => handleEdit(ruta)}>
                        Editar
                      </button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(ruta.id)}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rutas;
