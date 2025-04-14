import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { uploadPhoto, deletePhoto } from "../supabaseStorage"; // Usamos las funciones reutilizables
import 'bootstrap/dist/css/bootstrap.min.css';

const Bajadas = () => {
  const [bajadas, setBajadas] = useState([]);
  const [form, setForm] = useState({
    id: null,
    nombre: "",
    descripcion: "",
    url_foto: "",
    eje_x: "",
    eje_y: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    document.title = "Bajadas - Admin";
    fetchBajadas();
  }, []);

  const fetchBajadas = async () => {
    const { data, error } = await supabase.from("bajadas").select("*");
    if (!error) setBajadas(data);
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

    // Si hay una nueva foto, subimos la foto
    if (file) {
      if (editMode && urlFoto) await deletePhoto(urlFoto); // Eliminamos la foto anterior si estamos editando
      const uploadedUrl = await uploadPhoto(file, form.nombre, "bajadas"); 
      if (!uploadedUrl) {
        setError("Error subiendo la foto.");
        return;
      }
      urlFoto = uploadedUrl;
    }

    const dataToSave = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      eje_x: form.eje_x,
      eje_y: form.eje_y,
      url_foto: urlFoto,
    };

    let errorRes;
    if (editMode) {
      // Actualizamos el registro de la bajada
      ({ error: errorRes } = await supabase
        .from("bajadas")
        .update(dataToSave)
        .eq("id", form.id));
    } else {
      // Insertamos un nuevo registro de bajada
      ({ error: errorRes } = await supabase.from("bajadas").insert([dataToSave]));
    }

    if (errorRes) {
      setError("Error al guardar la bajada.");
    } else {
      setSuccess(editMode ? "Bajada actualizada con éxito." : "Bajada agregada con éxito.");
      setForm({ id: null, nombre: "", descripcion: "", url_foto: "", eje_x: "", eje_y: "" });
      setFile(null);
      setPreview(null);
      setEditMode(false);
      fetchBajadas();
    }
  };

  const handleEdit = (bajada) => {
    setForm(bajada);
    setEditMode(true);
    setPreview(bajada.url_foto);
  };

  const handleDelete = async (id, url_foto) => {
    if (url_foto) await deletePhoto(url_foto); // Eliminamos la foto asociada al registro
    await supabase.from("bajadas").delete().eq("id", id);
    fetchBajadas();
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-md-3">
          <div className="bg-light p-4 rounded shadow-sm border h-100">
            <h4 className="text-center mb-4">{editMode ? "Editar Bajada" : "Agregar Bajada"}</h4>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label" htmlFor="nombre">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  className="form-control"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="descripcion">Descripción</label>
                <textarea
                  name="descripcion"
                  className="form-control"
                  value={form.descripcion}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="eje_x">Eje X</label>
                <input
                  type="text"
                  name="eje_x"
                  className="form-control"
                  value={form.eje_x}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="eje_y">Eje Y</label>
                <input
                  type="text"
                  name="eje_y"
                  className="form-control"
                  value={form.eje_y}
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
                  <img src={preview} alt="Preview" className="img-thumbnail" width={150} />
                </div>
              )}
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              <div className="d-flex justify-content-center gap-3 mt-3">
                <button type="submit" className="btn btn-primary px-4">
                  {editMode ? "Actualizar" : "Agregar"}
                </button>
                {editMode && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    onClick={() => {
                      setEditMode(false);
                      setForm({ id: null, nombre: "", descripcion: "", url_foto: "", eje_x: "", eje_y: "" });
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

        <div className="col-md-9" style={{ maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}>
          <h3 className="mb-4">Bajadas registradas</h3>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {bajadas.map((bajada) => (
              <div key={bajada.id} className="col">
                <div className="card h-100 border rounded shadow-sm">
                  <img
                    src={bajada.url_foto}
                    className="card-img-top"
                    alt={bajada.nombre}
                    style={{ height: "160px", objectFit: "cover" }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{bajada.nombre}</h5>
                    <p className="card-text mb-2">
                      <strong>Descripción:</strong> {bajada.descripcion}<br />
                      <strong>Eje X:</strong> {bajada.eje_x}<br />
                      <strong>Eje Y:</strong> {bajada.eje_y}
                    </p>
                    <div className="d-flex justify-content-between">
                      <button className="btn btn-sm btn-warning" onClick={() => handleEdit(bajada)}>Editar</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(bajada.id, bajada.url_foto)}>Eliminar</button>
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

export default Bajadas;
