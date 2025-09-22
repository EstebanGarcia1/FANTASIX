# PR #3 - Leaderboard & Rankings - Testing Guide

## 🚀 Funcionalidades Implementadas

### ✅ **Leaderboard Global Completo**
- **Ranking paginado** (50 usuarios por página) con `keepPreviousData`
- **Búsqueda por username** con debounce 300ms sincronizado a URL
- **Filtros por fase** (grupos/playoffs) persistidos en URL
- **Top 3 destacado** con medallas oro/plata/bronce + accesibilidad
- **Empates correctos** mostrando "=7" para posiciones empatadas
- **Ir a mi posición** con cálculo automático de página y scroll
- **Ver equipos** habilitado solo cuando draft cerrado

### ✅ **Estados y UX**
- **Loading states** con skeleton de 10 filas
- **Empty states** para resultados vacíos
- **Error handling** con toast + botón retry
- **Responsive design** mobile/desktop
- **Accesibilidad completa** con navegación por teclado y aria-labels

### ✅ **Integración Backend**
- **API client** reutilizando httpClient existente
- **React Query** con invalidación inteligente de cache
- **Feature flag** `NEXT_PUBLIC_ENABLE_VIEW_TEAMS` para desarrollo
- **Mock data** cuando backend no disponible

---

## 🧪 Guía de Testing Manual

### **Paso 1: Configurar Environment**

```bash
# 1. Verificar que el backend esté corriendo en localhost:3000
# 2. Si no hay backend, habilitar flag para mocks:
echo "NEXT_PUBLIC_ENABLE_VIEW_TEAMS=false" >> .env.local

# 3. Iniciar frontend
npm run dev
```

### **Paso 2: Flujo Completo de Testing**

#### **A. Navegación y URLs ✅**
1. **Ir a** `/app/leaderboard`
2. **Verificar URL base** sin parámetros
3. **Cambiar a fase playoffs** → URL debe mostrar `?phase=playoffs`
4. **Cambiar página** → URL debe mostrar `?page=2`
5. **Buscar "test"** → URL debe mostrar `?q=test`
6. **Combinado** → `?phase=playoffs&page=2&q=test`
7. **Recargar página** → Estado debe persistir desde URL

#### **B. Búsqueda y Filtros ✅**
1. **Escribir en buscador** → Debounce 300ms (no busca hasta parar de escribir)
2. **Buscar username** → Lista se filtra
3. **Limpiar búsqueda** → Vuelve a mostrar todos
4. **Búsqueda sin resultados** → Mensaje "No hay resultados"
5. **Cambiar fase con búsqueda activa** → Mantiene filtro

#### **C. Paginación ✅**
1. **Páginas > 1** → Botones anterior/siguiente habilitados
2. **Página 1** → Botón "Anterior" deshabilitado
3. **Última página** → Botón "Siguiente" deshabilitado
4. **Números de página** → Máximo 5 visibles, centrados alrededor de actual
5. **keepPreviousData** → Al cambiar página, datos anteriores visibles hasta cargar nuevos

#### **D. Ranking y Posiciones ✅**
1. **Top 3** → Medallas 🥇🥈🥉 con estilos diferenciados
2. **Empates** → Misma posición con "=7" en posiciones empatadas
3. **Puntos** → Formato con separadores de miles (1,250)
4. **Tendencias** → Iconos ▲▼● para subida/bajada/igual (si disponible)

#### **E. "Ir a Mi Posición" ✅**
1. **Si hay posición** → Botón habilitado con "Tu posición: #127"
2. **Click botón** → Navega a página correcta (ej: página 3 para posición 127)
3. **Misma página** → Solo hace scroll y resalta fila
4. **Sin posición** → Botón deshabilitado con tooltip

#### **F. Ver Equipos (Draft Status) ✅**
1. **Draft abierto** → Botón "Draft abierto" deshabilitado + tooltip
2. **Draft cerrado** → Botón "Ver equipo" habilitado
3. **Click ver equipo** → Drawer lateral con:
   - Usuario y avatar
   - 5 jugadores con roles, equipos, puntos
   - Total de puntos
   - Fecha de creación
4. **Cerrar drawer** → ESC o botón cerrar

#### **G. Estados Especiales ✅**
1. **Loading inicial** → Skeleton de 10 filas
2. **Error de red** → Card de error + botón "Intentar de nuevo"
3. **Sin resultados** → Empty state con mensaje apropiado
4. **Feature flag OFF** → Mock data en drawer, mensaje desarrollo

---

## 📱 Testing Responsive

### **Mobile (320px-768px)**
- ✅ Tabla se adapta ocultando columna "Tendencia"
- ✅ Header con selector de fase se apila verticalmente
- ✅ Búsqueda y botones se adaptan
- ✅ Drawer ocupa pantalla completa
- ✅ Paginación solo muestra anterior/siguiente

### **Desktop (1280px+)**
- ✅ Tabla completa con todas las columnas
- ✅ Números de página visibles
- ✅ Layout de 3 columnas funcional
- ✅ Drawer lateral (max-width: 28rem)

---

## 🧩 Testing de Integración

### **Con Draft System**
1. **Crear equipo** en `/app/draft`
2. **Ir a leaderboard** → Debe aparecer en ranking
3. **Cambiar equipo** → Puntos deben actualizarse
4. **Cache invalidation** → Datos sincronizados automáticamente

### **Con Config Global**
1. **Draft abierto** → config.draftGruposOpen = true
2. **Draft cerrado** → config.draftGruposOpen = false
3. **Fase activa** → config.activePhase como default

---

## ⚡ Performance Testing

### **React Query Optimizaciones**
- ✅ `keepPreviousData: true` → No flickering al cambiar página
- ✅ `staleTime: 30s` → No re-fetch innecesarios
- ✅ Prefetch en "Ir a mi posición"
- ✅ Invalidación selectiva de queries

### **Debounce y UX**
- ✅ 300ms debounce → No spam de requests
- ✅ URL sincronizada → State persistente
- ✅ Loading states → Feedback visual inmediato

---

## 🔧 Limitaciones Actuales

### **Backend Endpoints**
- `/fantasy/leaderboard` debe devolver estructura específica
- `/fantasy/team?userId=X&phase=Y` o `/fantasy/teams/:userId` para equipos
- Feature flag controla si usar mocks o API real

### **Datos Mock**
- Cuando `NEXT_PUBLIC_ENABLE_VIEW_TEAMS=false`
- Posiciones y equipos generados dinámicamente
- Trending indicators simulados

### **Futuras Mejoras**
- Tab "Mi Liga" → Próximamente (placeholder implementado)
- Trending real desde backend
- Avatares de equipos/logos reales
- Filtros adicionales (región, etc.)

---

## 🎯 Criterios de Aceptación Validados

✅ **Tabla Global** con posición, usuario, puntos, paginación y búsqueda  
✅ **Top 3** destacados con estilos oro/plata/bronce  
✅ **Empates** muestran misma posición con "="  
✅ **Ir a mi posición** navega y enfoca fila correcta  
✅ **Ver equipo** abre drawer con 5 jugadores si draft cerrado  
✅ **Estados** loading/empty/error completamente cubiertos  
✅ **Accesibilidad** navegación teclado + aria-labels  
✅ **Responsive** mobile y desktop funcionales  
✅ **URL persistence** filtros y paginación en URL  

---

## 🚨 Testing Rápido (5 minutos)

```bash
# 1. Leaderboard básico
✅ /app/leaderboard → Carga tabla
✅ Cambiar fase → URL actualizada
✅ Buscar "test" → Filtrado funcional

# 2. Paginación
✅ Página 2 → URL ?page=2
✅ Anterior/Siguiente → Navegación

# 3. Ver equipo (si draft cerrado)
✅ Click "Ver equipo" → Drawer
✅ ESC → Cierra drawer

# 4. Responsive
✅ Mobile → Tabla adaptada
✅ Desktop → Layout completo
```

**🎉 Si estos 4 puntos funcionan, la implementación está completa y operativa.**