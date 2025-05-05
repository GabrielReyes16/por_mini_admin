import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { uploadPhoto, deletePhoto } from "../supabaseStorage";

import 'bootstrap/dist/css/bootstrap.min.css';

const Subidas = () => {
  const [subidas, setSubidas] = useState([]);
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
    document.title = "Subidas - Admin";
    fetchSubidas();
  }, []);

  const fetchSubidas = async () => {
    const { data, error } = await supabase.from("subidas").select("*");
    if (!error) setSubidas(data);
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
      const uploadedUrl = await uploadPhoto(file, form.nombre, "subidas");

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
      ({ error: errorRes } = await supabase
        .from("subidas")
        .update(dataToSave)
        .eq("id", form.id));
    } else {
      ({ error: errorRes } = await supabase.from("subidas").insert([dataToSave]));
    }

    if (errorRes) {
      setError("Error al guardar la subida.");
    } else {
      setSuccess(editMode ? "Subida actualizada con éxito." : "Subida agregada con éxito.");
      setForm({ id: null, nombre: "", descripcion: "", url_foto: "", eje_x: "", eje_y: "" });
      setFile(null);
      setPreview(null);
      setEditMode(false);
      fetchSubidas();
    }
  };

  const handleEdit = (subida) => {
    setForm(subida);
    setEditMode(true);
    setPreview(subida.url_foto);
  };

  const handleDelete = async (id, url_foto) => {
    if (url_foto) await deleteBusPhoto(url_foto);
    await deletePhoto(url_foto);

    fetchSubidas();
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-md-3">
          <div className="bg-light p-4 rounded shadow-sm border h-100">
            <h4 className="text-center mb-4">{editMode ? "Editar Subida" : "Agregar Subida"}</h4>
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
                <label className="form-label" htmlFor="eje x">Eje X</label>
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
                <label className="form-label" htmlFor="eje y">Eje Y</label>
                <input
                  type="text"
                  name="eje_y"
                  className="form-control"
                  value={form.eje_y}
                  onChange={handleChange}
                  required
                />
              </div>
             
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
          <h3 className="mb-4">Subidas registradas</h3>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {subidas.map((subida) => (
              <div key={subida.id} className="col">
                <div className="card h-100 border rounded shadow-sm">
                  
                  <div className="card-body">
                    <h5 className="card-title">{subida.nombre}</h5>
                    <p className="card-text mb-2">
                      <strong>Descripción:</strong> {subida.descripcion}<br />
                      <strong>Eje X:</strong> {subida.eje_x}<br />
                      <strong>Eje Y:</strong> {subida.eje_y}
                    </p>
                    <div className="d-flex justify-content-between">
                      <button className="btn btn-sm btn-warning" onClick={() => handleEdit(subida)}>Editar</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(subida.id, subida.url_foto)}>Eliminar</button>
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

export default Subidas;
