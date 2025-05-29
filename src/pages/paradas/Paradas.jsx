import { useEffect, useState } from "react";
import useParadas from "./useParadas";
import MapaSelector from "../../components/MapaSelector";
import 'bootstrap/dist/css/bootstrap.min.css';

const Paradas = () => {
  // State for the selected bus ID for filtering the stops list.
  const [selectedBusFilter, setSelectedBusFilter] = useState(""); 
  // New state for the selected direction filter (e.g., "ab" or "ba").
  const [selectedDirectionFilter, setSelectedDirectionFilter] = useState("");

  // Destructure values and functions from the custom useParadas hook.
  // We now pass both selectedBusFilter and selectedDirectionFilter to the hook.
  const {
    paradas,
    buses,
    selectedBusDetails, // New: details of the currently selected bus (for inicio_a/b)
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
    setForm,
    fetchParadas 
  } = useParadas(selectedBusFilter, selectedDirectionFilter); // Pass both filters

  // Effect to set the document title when the component mounts.
  useEffect(() => {
    document.title = "Paradas - Admin";
  }, []);

  // Handler for when the bus filter dropdown changes.
  const handleBusFilterChange = (e) => {
    setSelectedBusFilter(e.target.value);
    // When the bus changes, reset the direction filter to avoid inconsistencies.
    setSelectedDirectionFilter(""); 
  };

  // Handler for when the direction filter dropdown changes.
  const handleDirectionFilterChange = (e) => {
    setSelectedDirectionFilter(e.target.value);
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
                  <MapaSelector setCoords={(coords) => {
                    setForm(prev => ({
                      ...prev,
                      eje_x: coords.lat.toString(),
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

                {/* Direction Radio Buttons */}
                <div className="mb-3">
                <label className="form-label">Dirección</label>
                <div className="form-check">
                  <input
                  type="radio"
                  name="direction"
                  className="form-check-input"
                  id="directionAB"
                  checked={form.ab && !form.ba}
                  onChange={() => {
                    setForm(prev => ({
                    ...prev,
                    ab: true,
                    ba: false
                    }));
                  }}
                  />
                  <label className="form-check-label" htmlFor="directionAB">
                  Desde A hasta B
                  </label>
                </div>
                <div className="form-check">
                  <input
                  type="radio"
                  name="direction"
                  className="form-check-input"
                  id="directionBA"
                  checked={form.ba && !form.ab}
                  onChange={() => {
                    setForm(prev => ({
                    ...prev,
                    ab: false,
                    ba: true
                    }));
                  }}
                  />
                  <label className="form-check-label" htmlFor="directionBA">
                  Desde B hasta A
                  </label>
                </div>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {/* Form Action Buttons */}
              <div className="d-flex justify-content-center gap-3 mt-3">
                <button 
                  type="submit" 
                  className="btn btn-primary px-4" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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
                    onClick={resetForm}
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
            <div className="ms-5 flex-grow-1">
              <select
                className="form-select form-select-sm"
                value={selectedBusFilter}
                onChange={handleBusFilterChange}
              >
                <option value="">Todas las Rutas</option>
                {buses.map((bus) => (
                  <option key={bus.id} value={bus.id}>
                    {bus.apodo}
                  </option>
                ))}
              </select>
            </div>

            {/* New: Direction Filter Dropdown (conditionally rendered) */}
            {selectedBusFilter && selectedBusDetails && (
              <div className="flex-grow-1 ms-3">
                <select
                  className="form-select form-select-sm"
                  value={selectedDirectionFilter}
                  onChange={handleDirectionFilterChange}
                >
                  <option value="">Todas las Direcciones</option>
                  {selectedBusDetails.inicio_a && selectedBusDetails.inicio_b && (
                    <>
                      <option value="ab">
                         {selectedBusDetails.inicio_a} - {selectedBusDetails.inicio_b}
                      </option>
                      <option value="ba">
                         {selectedBusDetails.inicio_b} - {selectedBusDetails.inicio_a}
                      </option>
                    </>
                  )}
                </select>
              </div>
            )}
            
            <small className="text-muted ms-3">Total: {paradas.length} paradas</small>
          </div>
          
          {/* Conditional Rendering for Loading, Empty States, and Stops List */}
          {loading && paradas.length === 0 ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-2 text-muted">Cargando paradas...</p>
            </div>
          ) : paradas.length === 0 && (selectedBusFilter !== "" || selectedDirectionFilter !== "") ? (
            // Message when no stops are found for the selected filtered route/direction
            <div className="text-center py-5">
                <div className="text-muted">
                    <i className="fas fa-map-marker-alt fa-3x mb-3"></i>
                    <p>No hay paradas registradas para la ruta/dirección seleccionada.</p>
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
                          <button 
                            className="btn btn-sm btn-warning" 
                            onClick={() => handleEdit(parada)}
                            disabled={loading}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-danger" 
                            onClick={() => handleDelete(parada.id)}
                            disabled={loading}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>

                      <div className="mb-2">
                        <small className="text-muted">Bus:</small>
                        <div className="fw-semibold text-primary">
                          {parada.buses?.apodo} - {parada.buses?.nombre}
                        </div>
                      </div>

                      {(parada.eje_x || parada.eje_y) && (
                        <div className="mb-2">
                          <small className="text-muted">Coordenadas:</small>
                          <div className="small font-monospace">
                            X: {parada.eje_x || 'N/A'}, Y: {parada.eje_y || 'N/A'}
                          </div>
                        </div>
                      )}

                      {parada.comentario && (
                        <div className="mb-2">
                          <small className="text-muted">Comentario:</small>
                          <div className="small">{parada.comentario}</div>
                        </div>
                      )}
                      
                      {/* New: Display ab/ba status */}
                      <div className="mb-2">
                        <small className="text-muted">Dirección:</small>
                        <div className="small">
                          {parada.ab && <span className="badge bg-success me-1">A &rarr; B</span>}
                          {parada.ba && <span className="badge bg-info">B &rarr; A</span>}
                          {!parada.ab && !parada.ba && <span className="badge bg-secondary">N/A</span>}
                        </div>
                      </div>

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
