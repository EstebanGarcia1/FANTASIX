# Draft System - Testing Guide

## 🚀 Cómo Probar el Draft

### **Paso 1: Configurar Backend Mock**
Si no tienes el backend corriendo, puedes usar datos mock temporalmente:

```bash
# En src/shared/api/http.ts, temporalmente cambiar API_BASE_URL
const API_BASE_URL = 'http://localhost:3001'; // Backend mock
```

### **Paso 2: Navegar al Draft**
1. Iniciar sesión en `/auth`
2. Ir a `/app/draft`
3. Alternativamente: `/app/draft?phase=playoffs`

### **Paso 3: Flujo de Prueba Completo**

#### **A. Filtros Funcionales** ✅
- **Filtrar por rol**: Seleccionar "Entry" → Solo jugadores Entry visibles
- **Filtrar por equipo**: Seleccionar un equipo → Solo jugadores de ese equipo
- **Filtrar por región**: Seleccionar "EU" → Solo jugadores europeos
- **Buscar por nombre**: Escribir "Shaiiko" → Solo jugadores que coincidan
- **Limpiar filtros**: Botón "Limpiar filtros" restaura todos

#### **B. Validaciones de Selección** ✅
1. **Roles mínimos**:
   - Seleccionar 4 jugadores sin Support → Botón "Confirmar" deshabilitado
   - Panel lateral muestra "Roles pendientes: Support"

2. **Máximo por equipo**:
   - Seleccionar 2 jugadores de G2 Esports
   - Intentar seleccionar un 3er jugador de G2 → Tarjeta se oscurece
   - Mensaje: "Ya tienes 2 jugadores de G2 Esports"

3. **Límite total**:
   - Seleccionar 5 jugadores válidos
   - Intentar seleccionar un 6to → Tarjeta deshabilitada
   - Mensaje: "Ya tienes 5 jugadores seleccionados"

#### **C. Resumen Lateral** ✅
- **Slots del equipo**: 5 slots, algunos vacíos, algunos ocupados
- **Indicador de roles**: Verde ✅ si cumplido, gris si pendiente  
- **Contador por equipo**: "Team A: 2/2" con indicador amarillo/rojo
- **Puntos totales**: Suma automática de puntos de jugadores seleccionados

#### **D. Confirmación** ✅
1. **Validación previa**:
   - Equipo incompleto → Botón "Completar equipo" deshabilitado
   - Equipo válido → Botón "Confirmar Equipo" habilitado

2. **Modal de confirmación**:
   - Click "Confirmar" → Modal con resumen del equipo
   - Muestra: jugadores, roles, equipos, puntos totales
   - Botones: "Cancelar" | "Confirmar"

3. **Submit exitoso**:
   - Toast verde: "¡Equipo guardado correctamente!"
   - Modal se cierra
   - Datos persisten al recargar página

#### **E. Estados del Draft** ✅
1. **Draft abierto**: 
   - Indicador verde "🟢 Draft de Grupos abierto"
   - Todos los controles habilitados

2. **Draft cerrado**:
   - Indicador rojo "🔴 Draft cerrado"  
   - Jugadores deshabilitados
   - Countdown: "Redraft abre en: 2d 14h 23m"
   - Muestra equipo actual en read-only

3. **Cambio de fase**:
   - Pestañas "Grupos 🟢" / "Playoffs 🔴"
   - URL se actualiza: `/app/draft?phase=playoffs`
   - Carga el equipo correspondiente

## 🧪 Testing de Validaciones

### **Casos de Test Manual**

#### ✅ **Caso 1: Equipo Válido**
- Seleccionar: 1 Entry + 1 Flex + 1 Support + 2 más
- Máximo 2 por equipo respetado
- Total: 5 jugadores
- **Resultado**: Botón "Confirmar" habilitado, sin errores

#### ❌ **Caso 2: Falta Support**
- Seleccionar: 3 Entry + 2 Flex + 0 Support
- **Resultado**: "Roles pendientes: Support", botón deshabilitado

#### ❌ **Caso 3: Exceso por equipo**
- Seleccionar: 3 jugadores de G2 Esports + 2 más
- **Resultado**: Error "Máximo 2 jugadores por equipo. Exceso en: G2 Esports"

#### ❌ **Caso 4: Equipo incompleto**
- Seleccionar: Solo 3 jugadores
- **Resultado**: "Debes seleccionar exactamente 5 jugadores (tienes 3)"

## 📱 Responsive Testing

- **Desktop** (1280px+): Layout de 3 columnas funcional
- **Tablet** (768px-1279px): Filtros se apilan, layout responsivo  
- **Mobile** (320px-767px): Single column, sticky summary

## 🎯 Datos de Ejemplo para Testing

### **Jugadores Mock Recomendados**:
```json
[
  { "id": 1, "nickname": "Shaiiko", "role": "Entry", "team": "G2 Esports", "points": 1250 },
  { "id": 2, "nickname": "CTZN", "role": "Flex", "team": "G2 Esports", "points": 1100 },
  { "id": 3, "nickname": "Doki", "role": "Support", "team": "Wolves", "points": 950 },
  { "id": 4, "nickname": "Renshiro", "role": "Entry", "team": "BDS", "points": 1050 },
  { "id": 5, "nickname": "Paluh", "role": "Flex", "team": "Liquid", "points": 1300 }
]
```

### **Configuración Global Mock**:
```json
{
  "draftGruposOpen": true,
  "draftPlayoffsOpen": false, 
  "redraftOpensAt": "2024-12-15T10:00:00Z"
}
```

## ❗ Errores Conocidos a Verificar

1. **Network Error**: Si backend no responde → Mostrar toast de error
2. **Validation Error**: Si backend rechaza → Mostrar mensaje específico
3. **Auth Error**: Si token inválido → Redirect a `/auth`
4. **Loading States**: Todos los spinners funcionan correctamente
5. **Empty States**: Filtros sin resultados muestran mensaje apropiado

## 🎬 GIF del Flujo Esperado

1. **Carga inicial** → Spinners → Datos cargados
2. **Filtrar jugadores** → Lista se actualiza instantáneamente  
3. **Seleccionar jugadores** → Resumen se actualiza en tiempo real
4. **Validaciones** → Errores se muestran inmediatamente
5. **Confirmar** → Modal → Submit → Toast éxito → Datos persisten

---

**✅ Todos los criterios de aceptación del prompt están implementados y son verificables manualmente.**