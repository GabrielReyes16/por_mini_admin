// HomeScreen.tsx
import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { supabase } from '../lib/supabase'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../App'

interface Inicio {
  id: number
  nombre: string
  url_foto: string
}

interface Ruta {
  id: number
  id_inicio: number
  id_destino: number
}

interface RutaBus {
  id: number
  id_ruta: number
  id_bus: number
  tiempo: string
  comentario: string
  precio: number
  bus: {
    apodo: string
    url_foto: string
  }
}

interface RutaConBuses extends Ruta {
  buses: RutaBus[]
}

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Home'>>()
  const [inicios, setInicios] = useState<Inicio[]>([])
  const [inicioSeleccionado, setInicioSeleccionado] = useState<number | null>(null)
  const [destinoSeleccionado, setDestinoSeleccionado] = useState<number | null>(null)
  const [rutasConBuses, setRutasConBuses] = useState<RutaConBuses[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null)

  useEffect(() => {
    fetchInicios()
  }, [])

  useEffect(() => {
    if (inicioSeleccionado && destinoSeleccionado) {
      fetchRutasYBuses()
    }
  }, [inicioSeleccionado, destinoSeleccionado])

  const fetchInicios = async () => {
    const { data, error } = await supabase.from('inicio').select('*')
    if (data) setInicios(data)
    if (error) console.error(error)
  }

  const fetchRutasYBuses = async () => {
    setLoading(true)

    const { data: rutas, error: errorRutas } = await supabase
      .from('ruta')
      .select('*')
      .eq('id_inicio', inicioSeleccionado)
      .eq('id_destino', destinoSeleccionado)

    if (errorRutas) {
      console.error(errorRutas)
      setLoading(false)
      return
    }

    const rutasConBuses: RutaConBuses[] = []

    for (const ruta of rutas) {
      const { data: buses, error: errorBuses } = await supabase
        .from('ruta_buses')
        .select('id, id_ruta, id_bus, tiempo, comentario, precio, bus: buses(apodo, url_foto)')
        .eq('id_ruta', ruta.id)

      if (errorBuses) {
        console.error(errorBuses)
        continue
      }

      rutasConBuses.push({
        ...ruta,
        buses: (buses || []).map((bus) => ({
          ...bus,
          bus: Array.isArray(bus.bus) ? bus.bus[0] : bus.bus,
        })),
      })
    }

    setRutasConBuses(rutasConBuses)
    setLoading(false)
  }

  const handleCardPress = (id: number) => {
    setExpandedCardId(expandedCardId === id ? null : id)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Desde</Text>
      <Picker
        selectedValue={inicioSeleccionado}
        onValueChange={(value) => setInicioSeleccionado(value)}
      >
        <Picker.Item label="Selecciona un inicio" value={null} />
        {inicios.map((inicio) => (
          <Picker.Item key={inicio.id} label={inicio.nombre} value={inicio.id} />
        ))}
      </Picker>

      <Text style={styles.title}>Hasta</Text>
      <Picker
        selectedValue={destinoSeleccionado}
        onValueChange={(value) => setDestinoSeleccionado(value)}
      >
        <Picker.Item label="Selecciona un destino" value={null} />
        {inicios.map((destino) => (
          <Picker.Item key={destino.id} label={destino.nombre} value={destino.id} />
        ))}
      </Picker>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={rutasConBuses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const apodos = item.buses.map((bus) => bus.bus?.apodo || 'Sin apodo').join(' - ')
            const precioTotal = item.buses.reduce((acc, bus) => acc + bus.precio, 0)

            return (
              <TouchableOpacity onPress={() => handleCardPress(item.id)}>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>{apodos} (S/{precioTotal.toFixed(2)})</Text>

                  {expandedCardId === item.id && (
                    <View style={{ marginTop: 10 }}>
                      {item.buses.map((bus) => (
                        <View key={bus.id} style={{ marginBottom: 20 }}>
                          <Text style={styles.busApodo}>{bus.bus?.apodo || 'Sin apodo'}</Text>
                          {bus.bus?.url_foto && (
                            <Image
                              source={{ uri: bus.bus.url_foto }}
                              style={styles.busFoto}
                            />
                          )}
                          <Text>Comentario: {bus.comentario}</Text>
                          <Text>Tiempo: {bus.tiempo}</Text>
                          <Text>Precio: S/{bus.precio}</Text>
                        </View>
                      ))}
                      <Text style={{ fontWeight: 'bold', marginTop: 10 }}>
                        Precio total: S/{precioTotal.toFixed(2)}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )
          }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 60,
    backgroundColor: 'white',
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 16,
  },
  card: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 6,
    fontSize: 16,
  },
  busApodo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  busFoto: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
    resizeMode: 'cover',
  },
})
