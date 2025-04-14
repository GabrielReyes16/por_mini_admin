import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { uploadPhoto, deletePhoto } from "../supabaseStorage"; // Importamos las funciones actualizadas
import 'bootstrap/dist/css/bootstrap.min.css';

const Destinos = () => {
  const [destinos, setDestinos] = useState([]);
  const [form, setForm] = useState({
    id: null,
    nombre: "",
    url_foto: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    document.title = "Destinos - Admin";
    fetchDestinos();
  }, []);

  const fetchDestinos = async () => {
    const { data, error } = await supabase.from("destino").select("*");
    if (!error) setDestinos(data);
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
      if (editMode && urlFoto) await deletePhoto(urlFoto); // Llamamos a la nueva función para borrar la foto anterior
      const uploadedUrl = await uploadPhoto(file, form.nombre, "destinos"); // Usamos la nueva función para subir la foto
      if (!uploadedUrl) {
        setError("Error subiendo la foto.");
        return;
      }
      urlFoto = uploadedUrl;
    }

    const dataToSave = {
      nombre: form.nombre,
      url_foto: urlFoto,
    };

    let errorRes;
    if (editMode) {
      ({ error: errorRes } = await supabase
        .from("destino")
        .update(dataToSave)
        .eq("id", form.id));
    } else {
      ({ error: errorRes } = await supabase.from("destino").insert([dataToSave]));
    }

    if (errorRes) {
      setError("Error al guardar el destino.");
    } else {
      setSuccess(editMode ? "Destino actualizado con éxito." : "Destino agregado con éxito.");
      setForm({ id: null, nombre: "", url_foto: "" });
      setFile(null);
      setPreview(null);
      setEditMode(false);
      fetchDestinos();
    }
  };

  const handleEdit = (destino) => {
    setForm(destino);
    setEditMode(true);
    setPreview(destino.url_foto);
  };

  const handleDelete = async (id, url_foto) => {
    if (url_foto) await deletePhoto(url_foto); // Llamamos a la función de eliminación de la foto
    await supabase.from("destino").delete().eq("id", id);
    fetchDestinos();
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-md-3">
          <div className="bg-light p-4 rounded shadow-sm border h-100">
            <h4 className="text-center mb-4">{editMode ? "Editar Destino" : "Agregar Destino"}</h4>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label" htmlFor="nombre">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  className="form-control"
                  id="nombre"
                  value={form.nombre}
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
                  id="foto"
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
                      setForm({ id: null, nombre: "", url_foto: "" });
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
          <h3 className="mb-4">Destinos registrados</h3>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {destinos.map((destino) => (
              <div key={destino.id} className="col">
                <div className="card h-100 border rounded shadow-sm">
                  <img
                    src={destino.url_foto}
                    className="card-img-top"
                    alt={destino.nombre}
                    style={{ height: "160px", objectFit: "cover" }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{destino.nombre}</h5>
                    <div className="d-flex justify-content-between">
                      <button className="btn btn-sm btn-warning" onClick={() => handleEdit(destino)}>Editar</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(destino.id, destino.url_foto)}>Eliminar</button>
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

export default Destinos;
