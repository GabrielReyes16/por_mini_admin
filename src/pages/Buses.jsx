import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { uploadPhoto, deletePhoto } from "../supabaseStorage"; // <-- actualizado
import 'bootstrap/dist/css/bootstrap.min.css';

const Buses = () => {
  const [buses, setBuses] = useState([]);
  const [form, setForm] = useState({
    id: null,
    nombre: "",
    apodo: "",
    color: "",
    url_foto: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    document.title = "Buses - Admin";
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    const { data, error } = await supabase.from("buses").select("*");
    if (!error) setBuses(data);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "foto") {
      const file = files[0];
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    let urlFoto = form.url_foto;

    if (file) {
      if (editMode && urlFoto) await deletePhoto(urlFoto);
      const uploadedUrl = await uploadPhoto(file, form.nombre, "buses"); // <-- carpeta específica
      if (!uploadedUrl) {
        setError("Error subiendo la foto.");
        return;
      }
      urlFoto = uploadedUrl;
    }

    const dataToSave = {
      nombre: form.nombre,
      apodo: form.apodo,
      color: form.color,
      url_foto: urlFoto,
    };

    let errorRes;
    if (editMode) {
      ({ error: errorRes } = await supabase
        .from("buses")
        .update(dataToSave)
        .eq("id", form.id));
    } else {
      ({ error: errorRes } = await supabase.from("buses").insert([dataToSave]));
    }

    if (errorRes) {
      setError("Error al guardar el bus.");
    } else {
      setSuccess(editMode ? "Bus actualizado con éxito." : "Bus agregado con éxito.");
      setForm({ id: null, nombre: "", apodo: "", color: "", url_foto: "" });
      setFile(null);
      setPreview(null);
      setEditMode(false);
      fetchBuses();
    }
  };

  const handleEdit = (bus) => {
    setForm(bus);
    setEditMode(true);
    setPreview(bus.url_foto);
  };

  const handleDelete = async (id, url_foto) => {
    if (url_foto) await deletePhoto(url_foto); // <-- actualizado
    await supabase.from("buses").delete().eq("id", id);
    fetchBuses();
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Columna fija para el formulario */}
        <div className="col-md-3">
          <div className="bg-light p-4 rounded shadow-sm border sticky-top" style={{ top: "1rem" }}>
            <h4 className="text-center mb-3">{editMode ? "Editar Bus" : "Agregar Bus"}</h4>
            <form onSubmit={handleSubmit}>
              <div className="mb-2">
                <label className="form-label" htmlFor="nombre" >Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  className="form-control"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-2">
                <label className="form-label" htmlFor="apodo" >Apodo</label>
                <input
                  type="text"
                  name="apodo"
                  className="form-control"
                  value={form.apodo}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-2">
                <label className="form-label" htmlFor="color">Color</label>
                <input
                  type="text"
                  name="color"
                  className="form-control"
                  value={form.color}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="foto">Foto</label>
                <input
                  type="file"
                  name="foto"
                  className="form-control"
                  accept="image/*"
                  onChange={handleChange}
                />
              </div>
              {preview && (
                <div className="text-center mb-3">
                  <img src={preview} alt="Preview" className="img-thumbnail" width={120} />
                </div>
              )}
              {error && <div className="alert alert-danger py-1">{error}</div>}
              {success && <div className="alert alert-success py-1">{success}</div>}
              <div className="d-grid gap-2 mt-3">
                <button type="submit" className="btn btn-primary">
                  {editMode ? "Actualizar" : "Agregar"}
                </button>
                {editMode && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setEditMode(false);
                      setForm({ id: null, nombre: "", apodo: "", color: "", url_foto: "" });
                      setFile(null);
                      setPreview(null);
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
        </div>

        {/* Columna scrollable de buses */}
        <div className="col-md-9" style={{ maxHeight: "calc(100vh - 2rem)", overflowY: "auto" }}>
          <h3 className="mb-4">Buses registrados</h3>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {buses.map((bus) => (
              <div key={bus.id} className="col">
                <div className="card h-100 shadow-sm border rounded">
                  {bus.url_foto && (
                    <img
                      src={bus.url_foto}
                      className="card-img-top"
                      alt={bus.nombre}
                      style={{ height: "160px", objectFit: "cover" }}
                    />
                  )}
                  <div className="card-body">
                    <h5 className="card-title">{bus.nombre}</h5>
                    <p className="card-text mb-3">
                      <strong>Apodo:</strong> {bus.apodo}<br />
                      <strong>Color:</strong> {bus.color}
                    </p>
                    <div className="d-flex justify-content-between">
                      <button className="btn btn-sm btn-warning" onClick={() => handleEdit(bus)}>
                        Editar
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(bus.id, bus.url_foto)}>
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

export default Buses;
