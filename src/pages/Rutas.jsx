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

  const [form, setForm] = useState({
    id: null,
    id_bus: "",
    id_subida: "",
    id_bajada: "",
    id_destino: "",
    id_inicio: "",
    precio: "",
    tiempo: "",
    comentario: "",
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
      { data: rutasData, error: rutasError },
      { data: busesData },
      { data: subidasData },
      { data: bajadasData },
      { data: destinosData },
      { data: iniciosData }
    ] = await Promise.all([
      supabase.from("ruta").select("*"),
      supabase.from("buses").select("*"),
      supabase.from("subidas").select("*"),
      supabase.from("bajadas").select("*"),
      supabase.from("destino").select("*"),
      supabase.from("inicio").select("*"),
    ]);

    if (rutasError) {
      console.error("Error cargando rutas:", rutasError);
    }

    setRutas(rutasData || []);
    setBuses(busesData || []);
    setSubidas(subidasData || []);
    setBajadas(bajadasData || []);
    setDestinos(destinosData || []);
    setInicios(iniciosData || []);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.id_bus || !form.id_subida || !form.id_bajada || !form.id_inicio || !form.id_destino) {
      setError("Todos los campos de selección deben estar completos.");
      return;
    }

    const dataToSave = {
      id_bus: form.id_bus ? parseInt(form.id_bus) : null,
      id_subida: form.id_subida ? parseInt(form.id_subida) : null,
      id_bajada: form.id_bajada ? parseInt(form.id_bajada) : null,
      id_destino: form.id_destino ? parseInt(form.id_destino) : null,
      id_inicio: form.id_inicio ? parseInt(form.id_inicio) : null,
      precio: form.precio ? parseFloat(form.precio) : null,
      tiempo: form.tiempo?.trim(),
      comentario: form.comentario?.trim(),
    };

    if (editMode) dataToSave.id = form.id;

    // Mostrar datos antes de enviar
    console.log("Datos que se enviarán a Supabase:", dataToSave);

    let errorRes;
    if (editMode) {
      const { error } = await supabase
        .from("ruta")
        .update(dataToSave)
        .eq("id", form.id);
      errorRes = error;
    } else {
      const { error } = await supabase
        .from("ruta")
        .insert([dataToSave]);
      errorRes = error;
    }

    if (errorRes) {
      console.error("Error al guardar:", errorRes);
      setError("Error al guardar la ruta: " + errorRes.message);
    } else {
      setSuccess(editMode ? "Ruta actualizada con éxito." : "Ruta agregada con éxito.");
      setForm({
        id: null,
        id_bus: "",
        id_subida: "",
        id_bajada: "",
        id_destino: "",
        id_inicio: "",
        precio: "",
        tiempo: "",
        comentario: "",
      });
      setEditMode(false);
      fetchData();
    }
  };

  const handleEdit = (ruta) => {
    console.log("Editando ruta:", ruta);
    setForm(ruta);
    setEditMode(true);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("ruta").delete().eq("id", id);
    if (error) {
      console.error("Error al eliminar:", error);
    } else {
      fetchData();
    }
  };

  const getNombre = (id, list) => {
    const item = list.find((i) => i.id === id);
    return item ? item.nombre : `ID ${id}`;
  };

  const getApodo = (id, list) => {
    const item = list.find((i) => i.id === id);
    return item ? item.apodo : `ID ${id}`;
  }

  return (
    <div className="container-fluid py-5">
      <div className="row">
        <div className="col-md-3 border-end pe-4">
          <h4 className="mb-4 text-center">{editMode ? "Editar Ruta" : "Agregar Ruta"}</h4>
          <form onSubmit={handleSubmit}>
            {[{ name: "id_bus", label: "Bus", data: buses },
              { name: "id_subida", label: "Subida", data: subidas },
              { name: "id_bajada", label: "Bajada", data: bajadas },
              { name: "id_destino", label: "Destino", data: destinos },
              { name: "id_inicio", label: "Inicio", data: inicios }].map(({ name, label, data }) => (
              <div className="mb-3" key={name}>
                <label htmlFor={name} className="form-label">{label}</label>
                <select
                  id={name}
                  name={name}
                  className="form-select"
                  value={form[name]}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar {label}</option>
                  {data.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <div className="mb-3">
              <label htmlFor="precio" className="form-label">Precio</label>
              <input
                type="number"
                id="precio"
                name="precio"
                step="0.01"
                className="form-control"
                value={form.precio}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="tiempo" className="form-label">Tiempo</label>
              <input
                type="text"
                id="tiempo"
                name="tiempo"
                className="form-control"
                value={form.tiempo}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="comentario" className="form-label">Comentario</label>
              <textarea
                id="comentario"
                name="comentario"
                className="form-control"
                rows="3"
                value={form.comentario}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <div className="d-flex justify-content-center gap-2 mt-4">
              <button type="submit" className="btn btn-primary px-4">
                {editMode ? "Actualizar" : "Agregar"}
              </button>
              {editMode && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setForm({
                      id: null,
                      id_bus: "",
                      id_subida: "",
                      id_bajada: "",
                      id_destino: "",
                      id_inicio: "",
                      precio: "",
                      tiempo: "",
                      comentario: "",
                    });
                    setEditMode(false);
                    setError(null);
                    setSuccess(null);
                  }}
                >
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
                      <strong>Bus:</strong> {getApodo(ruta.id_bus, buses)}<br />
                      <strong>Subida:</strong> {getNombre(ruta.id_subida, subidas)}<br />
                      <strong>Bajada:</strong> {getNombre(ruta.id_bajada, bajadas)}<br />
                      <strong>Precio:</strong> {ruta.precio}<br />
                      <strong>Tiempo:</strong> {ruta.tiempo}<br />
                      <strong>Comentario:</strong> {ruta.comentario}
                    </p>
                    <div className="d-flex justify-content-between">
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => handleEdit(ruta)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(ruta.id)}
                      >
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
