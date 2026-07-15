//· @yestoall/dev-flags ·
// Gating de herramientas solo-dev por whitelist de dispositivo, compartido
// entre las apps de yestoall. Todas comparten vendor (com.yestoall.*), así que
// el IDFV de iOS es el mismo en todas: un dispositivo añadido aquí queda
// habilitado en todas las apps (tras rebuild — la whitelist va compilada en
// el binario). El id es estable mientras alguna app del vendor siga instalada.
//
// Cada app define su flag base de debug (`__DEV__`, APP_VARIANT…), por eso
// esto es una factory: createDevFlags({ isDebug }) → { useDevTools }.

import { useEffect, useState } from "react"
import { Platform } from "react-native"
import * as Application from "expo-application"

// UUIDs de dispositivos del desarrollador. Bootstrap en cada app: un
// long-press discreto copia el id al portapapeles (ver README).
export const DEV_DEVICE_IDS: string[] = [
  "CA69BCD9-18B1-4813-ADCE-836527A67E0D", // iPhone de Nacho (IDFV vendor com.yestoall)
]

// id estable del dispositivo por proveedor. iOS: IDFV; Android: Android ID.
// Puede ser null en algunos simuladores/entornos.
export const getDeviceId = async (): Promise<string | null> => {
  try {
    if (Platform.OS === "ios") {
      return await Application.getIosIdForVendorAsync()
    }
    if (Platform.OS === "android") {
      return Application.getAndroidId()
    }
  } catch {
    return null
  }
  return null
}

export interface DevFlagsOptions {
  // flag base de la app: __DEV__, isDebugBuild… Si es true, las dev tools
  // están siempre activas y no se consulta la whitelist.
  isDebug: boolean
  // whitelist alternativa; por defecto la compartida DEV_DEVICE_IDS.
  deviceIds?: string[]
}

// Crea el hook useDevTools de la app: true en debug, o si el dispositivo está
// en la whitelist. Arranca en `false` y se resuelve de forma asíncrona
// (resuelve el id una sola vez).
export const createDevFlags = ({
  isDebug,
  deviceIds = DEV_DEVICE_IDS,
}: DevFlagsOptions) => {
  const useDevTools = (): boolean => {
    const [enabled, setEnabled] = useState<boolean>(isDebug)

    useEffect(() => {
      if (isDebug) return // ya está activo, no hace falta resolver el id
      let active = true
      getDeviceId().then((id) => {
        if (active && id && deviceIds.includes(id)) setEnabled(true)
      })
      return () => {
        active = false
      }
    }, [])

    return enabled
  }

  return { useDevTools }
}
