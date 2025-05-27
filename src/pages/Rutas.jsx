import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "bootstrap/dist/css/bootstrap.min.css";

const Rutas = () => {
  const [rutas, setRutas] = useState([]);
  const [buses, setBuses] = useState([]);
  const [subidas, setSubidas] = useState([]);
  const [bajadas, setBajadas] = useState([]);
  const [inicios, setInicios] = useState([]);
  const [rutaBuses, setRutaBuses] = useState([
    {
      id_bus: "",
      id_subida: "",
      id_bajada: "",
      tiempo: "",
      comentario: "",
      precio: "",
    },
  ]);
  const [rutaBusesPorRuta, setRutaBusesPorRuta] = useState({});
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
      { data: iniciosData },
    ] = await Promise.all([
      supabase.from("ruta").select("*"),
      supabase.from("buses").select("*"),
      supabase.from("subidas").select("*"),
      supabase.from("bajadas").select("*"),
      supabase.from("inicio").select("*"),
    ]);

    setRutas(rutasData || []);
    setBuses(busesData || []);
    setSubidas(subidasData || []);
    setBajadas(bajadasData || []);
    setInicios(iniciosData || []);

    const busesPorRuta = {};
    for (const ruta of rutasData || []) {
      const { data: busesData } = await supabase
        .from("ruta_buses")
        .select("*")
        .eq("id_ruta", ruta.id);
      busesPorRuta[ruta.id] = busesData || [];
    }
    setRutaBusesPorRuta(busesPorRuta);
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
      {
        id_bus: "",
        id_subida: "",
        id_bajada: "",
        tiempo: "",
        comentario: "",
        precio: "",
      },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (
      !form.id_inicio ||
      !form.id_destino ||
      rutaBuses.some(
        (rb) => !rb.id_bus || !rb.id_subida || !rb.id_bajada || !rb.precio
      )
    ) {
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
        const { error: errorRuta } = await supabase
          .from("ruta")
          .update(rutaData)
          .eq("id", rutaId);
        if (errorRuta) throw errorRuta;

        await supabase.from("ruta_buses").delete().eq("id_ruta", rutaId);
      } else {
        const { data, error: errorRuta } = await supabase
          .from("ruta")
          .insert([rutaData])
          .select();
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

      const { error: errorRB } = await supabase
        .from("ruta_buses")
        .insert(busesInsert);
      if (errorRB) throw errorRB;

      setSuccess(
        editMode ? "Ruta actualizada con éxito." : "Ruta agregada con éxito."
      );
      resetForm();
      fetchData();
    } catch (err) {
      console.error("Error:", err);
      setError("Ocurrió un error al guardar: " + err.message);
    }
  };

  const resetForm = () => {
    setForm({ id: null, id_inicio: "", id_destino: "" });
    setRutaBuses([
      {
        id_bus: "",
        id_subida: "",
        id_bajada: "",
        tiempo: "",
        comentario: "",
        precio: "",
      },
    ]);
    setEditMode(false);
    setError(null);
    setSuccess(null);
  };

  const handleEdit = async (ruta) => {
    resetForm();
    const { data: rutaBusesData } = await supabase
      .from("ruta_buses")
      .select("*")
      .eq("id_ruta", ruta.id);

    setForm({
      id: ruta.id,
      id_inicio: ruta.id_inicio,
      id_destino: ruta.id_destino,
    });
    setRutaBuses(
      rutaBusesData.length > 0
        ? rutaBusesData
        : [
            {
              id_bus: "",
              id_subida: "",
              id_bajada: "",
              tiempo: "",
              comentario: "",
              precio: "",
            },
          ]
    );
    setEditMode(true);
  };

  const handleDelete = async (id) => {
    await supabase.from("ruta_buses").delete().eq("id_ruta", id);
    await supabase.from("ruta").delete().eq("id", id);
    fetchData();
  };

  const getNombre = (id, list) =>
    list.find((i) => i.id === id)?.nombre || `ID ${id}`;
  const getApodo = (id, list) =>
    list.find((i) => i.id === id)?.apodo || `ID ${id}`;

  const ListadoRutas = ({ 
    rutas, 
    inicios, 
    rutaBusesPorRuta, 
    buses, 
    handleEdit, 
    handleDelete 
  }) => {
    const [paginaActual, ] = useState(1);
    const rutasPorPagina = 5;

    const rutasAgrupadas = inicios
      .map((inicio) => {
        const rutasDeInicio = rutas.filter((r) => r.id_inicio === inicio.id);
        return {
          inicio,
          rutas: rutasDeInicio.map((ruta) => {
            const busesDeRuta = (rutaBusesPorRuta[ruta.id] || [])
              .map((rb) => {
                const bus = buses.find((b) => b.id === rb.id_bus);
                return bus?.apodo || "Sin apodo";
              });

            return {
              ...ruta,
              destino: inicios.find((i) => i.id === ruta.id_destino),
              buses: busesDeRuta,
            };
          }),
        };
      })
      .filter((grupo) => grupo.rutas.length > 0);

    const inicioIndex = (paginaActual - 1) * rutasPorPagina;
    const rutasPaginadas = rutasAgrupadas.slice(
      inicioIndex,
      inicioIndex + rutasPorPagina
    );


    return (
      <>
        <h4 className="mb-4">Listado de Rutas</h4>
        {rutasPaginadas.map((grupo) => (
          <div key={grupo.inicio.id} className="mb-4">
            <h5>Inicio: {grupo.inicio.nombre}</h5>
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th>Destino</th>
                    <th>Buses</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {grupo.rutas.map((ruta) => (
                    <tr key={ruta.id}>
                      <td>{ruta.destino?.nombre || "Desconocido"}</td>
                      <td>
                        {ruta.buses.length > 0
                          ? ruta.buses.join(", ")
                          : "Sin buses"}
                      </td>
                      <td>
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => handleEdit(ruta)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-danger btn-sm ms-2"
                          onClick={() => handleDelete(ruta.id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </>
    );
  };

  return (
    <div className="container-fluid py-5">
      <div className="row">
        <div className="col-md-3 border-end pe-4">
          <h4 className="mb-4 text-center">
            {editMode ? "Editar Ruta" : "Agregar Ruta"}
          </h4>
          <form onSubmit={handleSubmit}>
            {[
              { name: "id_inicio", label: "Inicio" },
              { name: "id_destino", label: "Destino" },
            ].map(({ name, label }) => (
              <div className="mb-3" key={name}>
                <label htmlFor={name} className="form-label">
                  {label}
                </label>
                <select
                  id={name}
                  name={name}
                  className="form-select"
                  value={form[name]}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Seleccionar {label}</option>
                  {inicios.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            {rutaBuses.map((rb, index) => (
              <div key={index} className="border p-3 mb-3 rounded bg-light">
                <h6>Bus #{index + 1}</h6>
                {[
                  {
                    name: "id_bus",
                    label: "Bus",
                    data: buses,
                    getText: getApodo,
                  },
                  { name: "id_subida", label: "Subida", data: subidas },
                  { name: "id_bajada", label: "Bajada", data: subidas},
                ].map(({ name, label, data, getText = getNombre }) => (
                  <div className="mb-2" key={name}>
                    <label className="form-label">{label}</label>
                    <select
                      name={name}
                      className="form-select"
                      value={rb[name]}
                      onChange={(e) => handleRutaBusChange(index, e)}
                      required={name !== "comentario"}
                    >
                      <option value="">Seleccionar {label}</option>
                      {data.map((item) => (
                        <option key={item.id} value={item.id}>
                          {getText(item.id, data)}
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
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Comentario</label>
                  <textarea
                    name="comentario"
                    className="form-control"
                    rows="3"
                    value={rb.comentario}
                    onChange={(e) => handleRutaBusChange(index, e)}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Precio</label>
                  <input
                    type="number"
                    name="precio"
                    className="form-control"
                    value={rb.precio}
                    onChange={(e) => handleRutaBusChange(index, e)}
                    required
                  />
                </div>
              </div>
            ))}

            <div className="d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={addRutaBus}
              >
                Agregar Bus
              </button>
              <button type="submit" className="btn btn-primary">
                {editMode ? "Guardar Cambios" : "Agregar Ruta"}
              </button>
            </div>
          </form>
          {error && <div className="alert alert-danger mt-3">{error}</div>}
          {success && <div className="alert alert-success mt-3">{success}</div>}
        </div>
        <div className="col-md-9" style={{ height: "100vh", overflowY: "auto" }}>
          <ListadoRutas
            rutas={rutas}
            inicios={inicios}
            rutaBusesPorRuta={rutaBusesPorRuta}
            buses={buses}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default Rutas;