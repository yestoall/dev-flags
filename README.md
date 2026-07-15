# @yestoall/dev-flags

Gating de herramientas solo-dev por whitelist de dispositivo, compartido entre
las apps de yestoall (QVO, Citas, …). En builds de debug las dev tools están
siempre activas; en producción (App Store / TestFlight) solo en los
dispositivos cuyo UUID esté en `DEV_DEVICE_IDS`.

Como todas las apps comparten vendor (`com.yestoall.*`), el IDFV de iOS es el
mismo en todas: un dispositivo añadido aquí queda habilitado en todas las apps
(tras rebuild — la whitelist va compilada en el binario).

## Instalación

```bash
bun add github:yestoall/dev-flags
```

Se distribuye el fuente TypeScript directamente; Metro/Expo lo transpila sin
build step. Peer deps: `react`, `react-native`, `expo-application`.

## Uso

Cada app crea un adaptador fino (p. ej. `src/utils/devFlags.ts`) inyectando su
flag base de debug:

```ts
import { createDevFlags } from "@yestoall/dev-flags"
import { isDebugBuild } from "@/utils/appVariant" // o __DEV__

export { getDeviceId, DEV_DEVICE_IDS } from "@yestoall/dev-flags"
export const { useDevTools } = createDevFlags({ isDebug: isDebugBuild })
```

Y el resto del código gatea con el hook:

```tsx
const devTools = useDevTools()
// ...
...(devTools ? [/* opciones solo-dev */] : [])
```

## Bootstrap de un dispositivo nuevo

1. Cada app expone un gesto discreto (long-press en la versión, en el HUD…)
   que llama a `getDeviceId()` y copia el UUID al portapapeles. Inofensivo si
   lo descubre alguien: es un id anónimo.
2. Añadir el UUID a `DEV_DEVICE_IDS` en `src/index.ts` y push.
3. En cada app: `bun update @yestoall/dev-flags` (repinea el commit en el
   lockfile) y rebuild.

## Notas

- iOS usa IDFV (`getIosIdForVendorAsync`); Android usa Android ID. El IDFV
  cambia si se desinstalan **todas** las apps del vendor del dispositivo.
- `getDeviceId()` puede devolver `null` en algunos simuladores/entornos.
