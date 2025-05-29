import { useEffect, useState } from "react"; // Import useState
import useParadas from "./useParadas";
import MapaSelector from "../../components/MapaSelector";
import 'bootstrap/dist/css/bootstrap.min.css';

const Paradas = () => {
  // State to hold the currently selected bus ID for filtering the stops list.
  // Initialized to an empty string to represent "Todas las Rutas" (All Routes).
  const [selectedBusFilter, setSelectedBusFilter] = useState(""); 

  // Destructure values and functions from the custom useParadas hook.
  // We pass selectedBusFilter to the hook so it can filter the stops.
  const {
    paradas,
    buses,
    form,
    editMode,
    error,
    success,
    loading,
    handleChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    setForm, // This setForm is the one exported by the hook, used for map coordinates
    fetchParadas // Exported to allow manual re-fetching if needed (e.g., after CRUD operations)
  } = useParadas(selectedBusFilter); // Pass the filter state to the hook

  // Effect to set the document title when the component mounts.
  useEffect(() => {
    document.title = "Paradas - Admin";
  }, []);

  // Handler for when the bus filter dropdown changes.
  // It updates the selectedBusFilter state, which in turn will trigger
  // the data fetching in the useParadas hook.
  const handleBusFilterChange = (e) => {
    setSelectedBusFilter(e.target.value);
    // The actual fetching of paradas based on this filter is handled
    // by a useEffect inside the useParadas hook that watches selectedBusFilter.
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Left Column: Add/Edit Stop Form */}
        <div className="col-md-4">
          <div className="bg-light p-4 rounded shadow-sm border h-100">
            <h4 className="text-center mb-4">
              {editMode ? "Editar Parada" : "Agregar Parada"}
            </h4>
            <form onSubmit={handleSubmit}>
              {/* Bus Selection for the Form */}
              <div className="mb-3">
                <label className="form-label" htmlFor="id_bus">
                  Bus <span className="text-danger">*</span>
                </label>
                <select
                  name="id_bus"
                  className="form-select"
                  id="id_bus"
                  value={form.id_bus}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione un bus</option>
                  {/* Map through the 'buses' array to populate options */}
                  {buses.map((bus) => (
                    <option key={bus.id} value={bus.id}>
                      {bus.apodo} - {bus.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stop Name Input */}
              <div className="mb-3">
                <label className="form-label" htmlFor="nombre">
                  Nombre de la Parada <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  className="form-control"
                  id="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Plaza de Armas"
                  required
                />
              </div>

              {/* Coordinates (Latitude and Longitude) Inputs */}
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label" htmlFor="eje_x">
                      Coordenada X (Latitud)
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="eje_x"
                      className="form-control"
                      id="eje_x"
                      value={form.eje_x}
                      onChange={handleChange}
                      placeholder="-12.0464"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label" htmlFor="eje_y">
                      Coordenada Y (Longitud)
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="eje_y"
                      className="form-control"
                      id="eje_y"
                      value={form.eje_y}
                      onChange={handleChange}
                      placeholder="-77.0428"
                    />
                  </div>
                </div>
              </div>

              {/* Map Selector for Coordinates */}
              <div className="mb-3">
                <label className="form-label">
                  Seleccionar ubicación en el mapa
                </label>
                <small className="text-muted d-block mb-2">
                  Haz clic en el mapa para seleccionar las coordenadas automáticamente
                </small>
                <div className="border rounded">
                  {/* MapaSelector component to pick coordinates */}
                  <MapaSelector setCoords={(coords) => {
                    // Update form state with selected coordinates from the map
                    setForm(prev => ({
                      ...prev,
                      eje_x: coords.lat.toString(), // Ensure coordinates are strings for input fields
                      eje_y: coords.lng.toString()
                    }));
                  }} />
                </div>
              </div>

              {/* Comment Textarea */}
              <div className="mb-3">
                <label className="form-label" htmlFor="comentario">
                  Comentario
                </label>
                <textarea
                  name="comentario"
                  className="form-control"
                  id="comentario"
                  rows="3"
                  value={form.comentario}
                  onChange={handleChange}
                  placeholder="Información adicional sobre la parada..."
                />
              </div>

              {/* Error and Success Messages */}
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              {/* Form Action Buttons */}
              <div className="d-flex justify-content-center gap-3 mt-3">
                <button 
                  type="submit" 
                  className="btn btn-primary px-4" 
                  disabled={loading} // Disable button when loading
                >
                  {loading ? (
                    <>
                      {/* Spinner for loading state */}
                      <output className="spinner-border spinner-border-sm me-2" aria-label="Cargando"></output>
                      {editMode ? "Actualizando..." : "Agregando..."}
                    </>
                  ) : (
                    editMode ? "Actualizar" : "Agregar"
                  )}
                </button>
                {editMode && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    onClick={resetForm} // Reset form and exit edit mode
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: List of Registered Stops */}
        <div className="col-md-8" style={{ maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="mb-0">Paradas registradas</h3>
            {/* Bus Filter Dropdown for the List */}
            <div className="flex-grow-1 ms-3">
              <select
                className="form-select form-select-sm"
                value={selectedBusFilter}
                onChange={handleBusFilterChange}
              >
                <option value="">Todas las Rutas</option> {/* Option to show all stops */}
                {buses.map((bus) => (
                  <option key={bus.id} value={bus.id}>
                    {bus.apodo} - {bus.nombre}
                  </option>
                ))}
              </select>
            </div>
            <small className="text-muted ms-3">Total: {paradas.length} paradas</small>
          </div>
          
          {/* Conditional Rendering for Loading, Empty States, and Stops List */}
          {loading && paradas.length === 0 ? (
            // Loading spinner when data is being fetched and no stops are loaded yet
            <div className="text-center py-5">
              <output className="spinner-border text-primary">
                <span className="visually-hidden">Cargando...</span>
              </output>
              <p className="mt-2 text-muted">Cargando paradas...</p>
            </div>
          ) : paradas.length === 0 && selectedBusFilter !== "" ? (
            // Message when no stops are found for the selected filtered route
            <div className="text-center py-5">
                <div className="text-muted">
                    <i className="fas fa-map-marker-alt fa-3x mb-3"></i>
                    <p>No hay paradas registradas para esta ruta.</p>
                </div>
            </div>
          ) : paradas.length === 0 ? (
            // Message when no stops are registered at all (no filter applied or no stops exist)
            <div className="text-center py-5">
              <div className="text-muted">
                <i className="fas fa-map-marker-alt fa-3x mb-3"></i>
                <p>No hay paradas registradas.</p>
              </div>
            </div>
          ) : (
            // Display the list of stops in cards
            <div className="row row-cols-1 row-cols-lg-2 g-4">
              {paradas.map((parada) => (
                <div key={parada.id} className="col">
                  <div className="card h-100 border rounded shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-1">{parada.nombre}</h5>
                        <div className="d-flex gap-2">
                          {/* Edit Button */}
                          <button 
                            className="btn btn-sm btn-warning" 
                            onClick={() => handleEdit(parada)}
                            disabled={loading}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          {/* Delete Button */}
                          <button 
                            className="btn btn-sm btn-danger" 
                            onClick={() => handleDelete(parada.id)}
                            disabled={loading}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>

                      {/* Bus Information */}
                      <div className="mb-2">
                        <small className="text-muted">Bus:</small>
                        <div className="fw-semibold text-primary">
                          {parada.buses?.apodo} - {parada.buses?.nombre}
                        </div>
                      </div>

                      {/* Coordinates Information */}
                      {(parada.eje_x || parada.eje_y) && (
                        <div className="mb-2">
                          <small className="text-muted">Coordenadas:</small>
                          <div className="small font-monospace">
                            X: {parada.eje_x || 'N/A'}, Y: {parada.eje_y || 'N/A'}
                          </div>
                        </div>
                      )}

                      {/* Comment Information */}
                      {parada.comentario && (
                        <div className="mb-2">
                          <small className="text-muted">Comentario:</small>
                          <div className="small">{parada.comentario}</div>
                        </div>
                      )}

                      {/* Creation Date */}
                      <div className="mt-2">
                        <small className="text-muted">
                          Creado: {new Date(parada.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Paradas;
