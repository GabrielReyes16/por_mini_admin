import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabaseClient";

// The hook now accepts 'busId' and 'directionFilter' as parameters.
const useParadas = (busId, directionFilter) => {
  const [paradas, setParadas] = useState([]);
  const [buses, setBuses] = useState([]);
  // New state to store details of the currently selected bus,
  // specifically for 'inicio_a' and 'inicio_b' for the direction filter options.
  const [selectedBusDetails, setSelectedBusDetails] = useState(null); 
  const [form, setFormState] = useState({
    id: null,
    id_bus: "",
    eje_x: "",
    eje_y: "",
    nombre: "",
    comentario: "",
    // Assuming 'ab' and 'ba' are boolean fields in your 'paraderos' table
    // and should be part of the form if you want to manage them during add/edit.
    // If not, you might remove them from the form state.
    ab: false, 
    ba: false,
  });
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // Memoized function to fetch paradas based on busId and directionFilter.
  const fetchParadas = useCallback(async () => {
    setLoading(true);
    setError(null); // Clear previous errors
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
      
      // Conditionally apply the bus filter.
      if (busId) {
        query = query.eq('id_bus', busId);
      }

      // Conditionally apply the direction filter based on 'ab' or 'ba' fields.
      if (directionFilter === "ab") {
        query = query.eq('ab', true);
      } else if (directionFilter === "ba") {
        query = query.eq('ba', true);
      }

      // Apply ordering regardless of other filters.
      query = query.order('nombre', { ascending: true }); 

      const { data, error } = await query;
      
      if (!error) {
        setParadas(data);
      } else {
        setError("Error al cargar las paradas: " + error.message);
        console.error("Error fetching paradas:", error);
      }
    } catch (err) {
      setError("Error al cargar las paradas.");
      console.error("Catch error fetching paradas:", err);
    } finally {
      setLoading(false);
    }
  }, [busId, directionFilter]); // Dependencies for useCallback

  // Fetch all buses once when the hook mounts.
  // Now also selecting 'inicio_a' and 'inicio_b'.
  const fetchBuses = async () => {
    try {
      const { data, error } = await supabase
        .from("buses")
        .select("id, apodo, nombre, inicio_a, inicio_b") // Include new fields
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

  // Effect to update selectedBusDetails whenever the busId or buses list changes.
  useEffect(() => {
    if (busId && buses.length > 0) {
      const bus = buses.find(b => b.id.toString() === busId);
      setSelectedBusDetails(bus || null);
    } else {
      setSelectedBusDetails(null); // Clear details if no bus is selected
    }
  }, [busId, buses]); // Dependencies for this effect

  // Effect to fetch paradas whenever the busId or directionFilter changes.
  useEffect(() => {
    fetchParadas();
  }, [fetchParadas]); // Dependency on memoized fetchParadas

  // Handler for form input changes.
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Handle checkboxes for 'ab' and 'ba' if they are part of the form
    setFormState((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
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
      id_bus: parseInt(form.id_bus),
      eje_x: form.eje_x ? parseFloat(form.eje_x) : null,
      eje_y: form.eje_y ? parseFloat(form.eje_y) : null,
      nombre: form.nombre.trim(),
      comentario: form.comentario.trim() || null,
      ab: form.ab, // Include 'ab' field
      ba: form.ba, // Include 'ba' field
    };

    try {
      let errorRes;
      if (editMode) {
        ({ error: errorRes } = await supabase
          .from("paraderos")
          .update(dataToSave)
          .eq("id", form.id));
      } else {
        ({ error: errorRes } = await supabase
          .from("paraderos")
          .insert([dataToSave]));
      }

      if (errorRes) {
        setError("Error al guardar la parada: " + errorRes.message);
        console.error("Supabase save error:", errorRes);
      } else {
        setSuccess(editMode ? "Parada actualizada con éxito." : "Parada agregada con éxito.");
        resetForm();
        fetchParadas(); // Re-fetch paradas to update the list
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
      id_bus: parada.id_bus.toString(),
      eje_x: parada.eje_x ? parada.eje_x.toString() : "",
      eje_y: parada.eje_y ? parada.eje_y.toString() : "",
      nombre: parada.nombre,
      comentario: parada.comentario || "",
      ab: parada.ab || false, // Populate ab
      ba: parada.ba || false, // Populate ba
    });
    setEditMode(true);
    setError(null);
    setSuccess(null);
  };

  // Handler to delete a stop.
  const handleDelete = async (id) => {
    // IMPORTANT: Use a custom modal for confirmation in production.
    // For this environment, window.confirm is used as per previous code.
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
      ab: false,
      ba: false,
    });
    setEditMode(false);
    setError(null);
    setSuccess(null);
  };

  // Return all states and functions that the component needs to consume.
  return {
    paradas,
    buses,
    selectedBusDetails, // Return the new state
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
    fetchParadas,
  };
};

export default useParadas;
