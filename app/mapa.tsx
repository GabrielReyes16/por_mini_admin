import { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { supabase } from "../lib/supabase";

type Subida = {
  id: number;
  nombre: string;
  descripcion?: string;
  eje_x: number;
  eje_y: number;
};

export default function MapaScreen() {
  const [subidas, setSubidas] = useState<Subida[]>([]);
  const [selectedSubida, setSelectedSubida] = useState<Subida | null>(null);

  useEffect(() => {
    fetchSubidas();
  }, []);

  const fetchSubidas = async () => {
    const { data, error } = await supabase.from("subidas").select("*");
    if (error) {
      console.error("Error al obtener subidas:", error);
    } else {
      const parsed = data.map((item) => ({
        ...item,
        eje_x: parseFloat(item.eje_x),
        eje_y: parseFloat(item.eje_y),
      }));
      setSubidas(parsed);
    }
  };

  return (
    <View style={styles.container}>
      {selectedSubida && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>{selectedSubida.nombre}</Text>
          {selectedSubida.descripcion && (
            <Text style={styles.infoDesc}>{selectedSubida.descripcion}</Text>
          )}
        </View>
      )}

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: subidas[0]?.eje_x || -12.0464,
          longitude: subidas[0]?.eje_y || -77.0428,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {subidas.map((subida) => (
          <Marker
            key={subida.id}
            coordinate={{
              latitude: subida.eje_x,
              longitude: subida.eje_y,
            }}
            onPress={() => setSelectedSubida(subida)}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  infoContainer: {
    backgroundColor: "white",
    padding: 12,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    position: "absolute",
    width: "100%",
    zIndex: 1,
  },
  infoTitle: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
  },
  infoDesc: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
    marginTop: 4,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
