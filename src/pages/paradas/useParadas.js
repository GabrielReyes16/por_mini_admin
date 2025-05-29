import { useState, useEffect, useCallback } from "react"; // Import useCallback
import { supabase } from "../../supabaseClient";

// The hook now accepts 'busId' as a parameter, which will be used for filtering.
const useParadas = (busId) => {
  const [paradas, setParadas] = useState([]);
  const [buses, setBuses] = useState([]);
  const [form, setFormState] = useState({ // Renamed internal setter to setFormState for clarity
    id: null,
    id_bus: "",
    eje_x: "",
    eje_y: "",
    nombre: "",
    comentario: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Memoize fetchParadas to prevent unnecessary re-creations,
  // which helps with useEffect dependencies.
  const fetchParadas = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("paraderos")
        .select(`
          *,
          buses (
            id,
            apodo,
            nombre
          )
        `);
      
      // Conditionally apply the filter based on the provided busId.
      // If busId is an empty string (from "Todas las Rutas"), the filter is skipped.
      if (busId) { // An empty string "" is falsy, so this correctly skips the filter
        query = query.eq('id_bus', busId);
      }

      // Apply ordering regardless of filter
      query = query.order('nombre', { ascending: true }); 

      const { data, error } = await query;
      
      if (!error) {
        setParadas(data);
      } else {
        setError("Error al cargar las paradas.");
        console.error("Error fetching paradas:", error);
      }
    } catch (err) {
      setError("Error al cargar las paradas.");
      console.error("Catch error fetching paradas:", err);
    } finally {
      setLoading(false);
    }
  }, [busId]); // Re-create fetchParadas only when busId changes

  // Fetch all buses once when the hook mounts.
  const fetchBuses = async () => {
    try {
      const { data, error } = await supabase
        .from("buses")
        .select("id, apodo, nombre")
        .order('apodo', { ascending: true });
      
      if (!error) {
        setBuses(data);
      } else {
        console.error("Error al cargar buses:", error);
      }
    } catch (err) {
      console.error("Catch error loading buses:", err);
    }
  };

  // Effect to fetch buses only once on initial mount.
  useEffect(() => {
    fetchBuses();
  }, []);

  // Effect to fetch paradas whenever the busId filter changes.
  // This includes the initial load when busId is an empty string.
  useEffect(() => {
    fetchParadas();
  }, [fetchParadas]); // Dependency on fetchParadas (which itself depends on busId due to useCallback)

  // Handler for form input changes.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  // Exposed setter for the form state, primarily used by MapaSelector.
  const setForm = (updater) => {
    setFormState(updater);
  };

  // Handler for form submission (Add or Update).
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Basic form validations.
    if (!form.id_bus || !form.nombre) {
      setError("Por favor complete todos los campos obligatorios.");
      setLoading(false);
      return;
    }

    if (form.eje_x && isNaN(parseFloat(form.eje_x))) {
      setError("El eje X debe ser un número válido.");
      setLoading(false);
      return;
    }

    if (form.eje_y && isNaN(parseFloat(form.eje_y))) {
      setError("El eje Y debe ser un número válido.");
      setLoading(false);
      return;
    }

    // Prepare data for Supabase, converting types as necessary.
    const dataToSave = {
      id_bus: parseInt(form.id_bus), // Convert to integer
      eje_x: form.eje_x ? parseFloat(form.eje_x) : null, // Convert to float or null
      eje_y: form.eje_y ? parseFloat(form.eje_y) : null, // Convert to float or null
      nombre: form.nombre.trim(),
      comentario: form.comentario.trim() || null, // Set to null if empty after trim
    };

    try {
      let errorRes;
      if (editMode) {
        // Update existing stop
        ({ error: errorRes } = await supabase
          .from("paraderos")
          .update(dataToSave)
          .eq("id", form.id));
      } else {
        // Insert new stop
        ({ error: errorRes } = await supabase
          .from("paraderos")
          .insert([dataToSave]));
      }

      if (errorRes) {
        setError("Error al guardar la parada: " + errorRes.message);
        console.error("Supabase save error:", errorRes);
      } else {
        setSuccess(editMode ? "Parada actualizada con éxito." : "Parada agregada con éxito.");
        resetForm(); // Clear the form
        fetchParadas(); // Re-fetch paradas to update the list with the new/updated item
      }
    } catch (err) {
      setError("Error al guardar la parada.");
      console.error("Catch error saving parada:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handler to set the form for editing a specific stop.
  const handleEdit = (parada) => {
    setFormState({
      id: parada.id,
      id_bus: parada.id_bus.toString(), // Convert to string for select input
      eje_x: parada.eje_x ? parada.eje_x.toString() : "", // Convert to string or empty
      eje_y: parada.eje_y ? parada.eje_y.toString() : "", // Convert to string or empty
      nombre: parada.nombre,
      comentario: parada.comentario || "",
    });
    setEditMode(true); // Enable edit mode
    setError(null);
    setSuccess(null);
  };

  // Handler to delete a stop.
  const handleDelete = async (id) => {
    // IMPORTANT: Avoid using window.confirm in production if you need custom UI.
    // For this environment, it's kept as per original code.
    if (!window.confirm("¿Está seguro de que desea eliminar esta parada?")) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("paraderos")
        .delete()
        .eq("id", id);

      if (error) {
        setError("Error al eliminar la parada: " + error.message);
        console.error("Supabase delete error:", error);
      } else {
        setSuccess("Parada eliminada con éxito.");
        fetchParadas(); // Re-fetch paradas to update the list
      }
    } catch (err) {
      setError("Error al eliminar la parada.");
      console.error("Catch error deleting parada:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to reset the form to its initial empty state.
  const resetForm = () => {
    setFormState({
      id: null,
      id_bus: "",
      eje_x: "",
      eje_y: "",
      nombre: "",
      comentario: "",
    });
    setEditMode(false); // Exit edit mode
    setError(null);
    setSuccess(null);
  };

  // Return all states and functions that the component needs to consume.
  return {
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
    setForm,
    fetchParadas, // Explicitly return fetchParadas
  };
};

export default useParadas;
