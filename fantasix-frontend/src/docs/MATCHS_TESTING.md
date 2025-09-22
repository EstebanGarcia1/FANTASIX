# PR #5 - Matches & Calendar Implementation Guide

## 📁 File Structure

Aquí tienes todos los archivos que necesitas crear/actualizar para implementar el sistema de Matches & Calendar:

### 1. Entities Layer
```
src/entities/matches/
├── types.ts          # ✅ Creado - Tipos base para matches, bracket, filtros
└── api.ts            # ✅ Creado - Adaptadores backend → frontend
```

### 2. Features Layer  
```
src/features/matches/
├── components/
│   ├── MatchCard.tsx           # ✅ Creado - Card reutilizable de partido
│   ├── MatchesTabs.tsx         # ✅ Creado - Tabs Agenda/Resultados
│   └── MiniBracket.tsx         # ✅ Creado - Bracket colapsable
├── hooks/
│   ├── useMatches.ts           # ✅ Creado - Hook principal matches
│   ├── useMiniBracket.ts       # ✅ Creado - Hook para bracket
│   └── useUserHighlight.ts     # ✅ Creado - Resaltado de equipos del usuario
└── utils/
    └── matchTime.ts            # ✅ Creado - Utilidades de tiempo y formato
```

### 3. Page Implementation
```
src/app/(private)/app/matches/
└── page.tsx                    # ✅ Creado - Página principal
```

### 4. Shared API Updates
```
src/shared/api/
└── hooks.ts                    # ✅ Actualizado - Agregados hooks de matches
```

### 5. Global Styles Updates
```
src/app/
└── globals.css                 # ✅ Actualizado - Estilos para matches y bracket
```

### 6. Tests (Opcional)
```
src/features/matches/
├── components/__tests__/
│   └── MatchCard.test.tsx      # ✅ Creado - Tests unitarios
└── utils/__tests__/
    └── matchTime.test.ts       # ✅ Creado - Tests de utilidades
```

## 🚀 Installation Steps

### Step 1: Crear la estructura de carpetas
```bash
# Desde la raíz del proyecto
mkdir -p src/entities/matches
mkdir -p src/features/matches/components
mkdir -p src/features/matches/hooks
mkdir -p src/features/matches/utils
mkdir -p src/features/matches/components/__tests__
mkdir -p src/features/matches/utils/__tests__
mkdir -p src/app/\(private\)/app/matches
```

### Step 2: Copiar archivos base
1. **src/entities/matches/types.ts** - Tipos principales
2. **src/entities/matches/api.ts** - Capa de API
3. **src/features/matches/utils/matchTime.ts** - Utilidades de tiempo

### Step 3: Implementar hooks
1. **src/features/matches/hooks/useMatches.ts** - Hook principal
2. **src/features/matches/hooks/useMiniBracket.ts** - Hook bracket
3. **src/features/matches/hooks/useUserHighlight.ts** - Hook resaltado

### Step 4: Crear componentes
1. **src/features/matches/components/MatchCard.tsx** - Componente card
2. **src/features/matches/components/MatchesTabs.tsx** - Componente tabs
3. **src/features/matches/components/MiniBracket.tsx** - Componente bracket

### Step 5: Implementar página
1. **src/app/(private)/app/matches/page.tsx** - Página principal

### Step 6: Actualizar archivos existentes
1. **src/shared/api/hooks.ts** - Agregar exports de matches
2. **src/app/globals.css** - Agregar estilos específicos

### Step 7: Tests (Opcional)
1. **src/features/matches/components/__tests__/MatchCard.test.tsx**
2. **src/features/matches/utils/__tests__/matchTime.test.ts**

## 🔧 Backend Integration

### Endpoints esperados:
```
GET /api/matches?scope=upcoming&page=1&size=20
GET /api/matches?scope=recent&page=1&size=20  
GET /api/bracket/{tournamentId}
GET /config  # Para obtener tournamentId activo
GET /fantasy/my-team?phase=group  # Para resaltado
```

### Response formats:
- Ver `src/entities/matches/api.ts` para estructura esperada
- Adaptadores incluidos para transformar datos backend → frontend

## 🎯 Features Implementadas

### ✅ Core Features
- **Agenda**: Lista de próximos partidos ordenados ASC por fecha
- **Resultados**: Lista de partidos finalizados ordenados DESC por fecha  
- **Mini-Bracket**: Estructura colapsable con rounds y matches
- **Countdown**: Timer en tiempo real para partidos próximos
- **Estados**: Correcto manejo de loading, empty, error
- **Responsive**: Layout adaptativo mobile → desktop

### ✅ Advanced Features  
- **User Highlight**: Resalta partidos donde el usuario tiene jugadores
- **Live Matches**: Banner para partidos en vivo
- **Auto-refresh**: Actualización automática de partidos próximos
- **External Links**: Enlaces a páginas oficiales de partidos
- **Map Scores**: Visualización de resultados por mapa
- **Timezone**: Formato consistente Europe/Madrid

### ✅ UX Details
- **Loading States**: Skeletons realistas durante carga
- **Empty States**: Mensajes específicos por contexto  
- **Error Handling**: Retry y toast notifications
- **Pagination**: Load more pattern para grandes listas
- **Accessibility**: Contraste, semántica, navegación por teclado

## 🧪 Testing

### Unit Tests Incluidos:
- **MatchCard**: Renderizado en diferentes estados
- **matchTime utilities**: Formateo, countdown, status
- **API adapters**: Transformación backend → frontend

### Manual Testing Checklist:
- [ ] Agenda carga partidos upcoming ordenados ASC
- [ ] Resultados carga partidos recent ordenados DESC  
- [ ] Mini-bracket se expande/contrae correctamente
- [ ] Countdown se actualiza en tiempo real
- [ ] Estados loading/empty/error funcionan
- [ ] User highlight resalta equipos correctos
- [ ] Links externos abren en nueva pestaña
- [ ] Auto-refresh funciona en agenda
- [ ] Responsive layout en mobile/tablet/desktop
- [ ] Dark mode compatible

## 🔄 Migration Notes

### Si ya tienes `/app/matches/page.tsx`:
```bash
# Respaldar contenido actual
cp src/app/\(private\)/app/matches/page.tsx src/app/\(private\)/app/matches/page.tsx.backup

# Reemplazar con nueva implementación
# (usar el contenido del artefact matches_page)
```

### Actualización de imports existentes:
Si ya tienes hooks de matches en otros archivos:
```typescript
// Antes
import { useMatches } from '../api/hooks';

// Después  
import { useMatches } from '../features/matches/hooks/useMatches';
```

## 🚦 Integration with Existing Features

### Draft System:
- Los matches pueden enlazar a jugadores via Team ID
- User highlight usa la fantasy team activa para resaltar

### Players System:  
- Links bidireccionales: match → players, players → matches
- Integración con estadísticas de rendimiento por partido

### Leaderboard:
- Resultados de matches pueden triggear actualización de puntos
- Integración con cálculo de fantasy points

## 📋 TODO/Future Enhancements

### Phase 2 Features:
- [ ] Live score updates via WebSocket
- [ ] Detailed match statistics view
- [ ] Predictions/betting integration
- [ ] Match history per team/player
- [ ] Calendar export (iCal)
- [ ] Push notifications for favorite teams

### Performance Optimizations:
- [ ] Virtual scrolling for large match lists
- [ ] Image lazy loading for team logos
- [ ] Service Worker caching for offline
- [ ] GraphQL integration for optimized queries

## 🐛 Troubleshooting

### Common Issues:

**1. Matches not loading:**
```typescript
// Check API endpoint in network tab
// Verify backend response format matches api.ts adapters
```

**2. Countdown not updating:**
```typescript
// Ensure useEffect cleanup in MatchCard
// Check system time and timezone settings
```

**3. User highlight not working:**
```typescript
// Verify fantasy team data structure
// Check team ID matching logic in useUserHighlight
```

**4. Bracket empty state:**
```typescript
// Confirm bracket endpoint exists
// Check tournament ID in config
// Verify error handling in useMiniBracket
```

## 📊 Analytics Events

### Recommended tracking:
```typescript
// Page views
analytics.track('matches_page_viewed', { tab: 'upcoming' });

// Interactions  
analytics.track('match_card_clicked', { matchId, teamA, teamB });
analytics.track('bracket_expanded', { tournamentId });
analytics.track('external_link_clicked', { matchId, url });

// User engagement
analytics.track('countdown_watched', { matchId, timeRemaining });
analytics.track('user_highlight_shown', { matchId, playerCount });
```

## 🎨 Design System Usage

### Components utilizados:
- `Card` - Contenedores principales
- `Button` - Acciones y navegación  
- `Avatar` - Logos de equipos
- `Skeleton` - Estados de carga
- `Modal` - Futuras funcionalidades
- `EmptyState` - Estados vacíos
- `LoadingSpinner` - Indicadores de carga

### Tokens de diseño:
- Colors: `brand-*`, `siege-*`, status colors
- Spacing: Tailwind scale standard
- Typography: `text-*` hierarchy
- Shadows: `shadow-*` elevation
- Borders: `border-*` consistency

## 🔐 Security Considerations

### API Security:
- Todos los endpoints usan autenticación JWT
- Rate limiting en endpoints de matches
- Input sanitization en filtros

### Client Security:
- External links use `rel="noopener noreferrer"`
- XSS protection en user-generated content
- No sensitive data in localStorage

## 📈 Performance Metrics

### Target Metrics:
- **Initial Load**: < 2s para primera carga
- **Tab Switch**: < 500ms cambio de tab
- **Auto-refresh**: < 1s actualización silenciosa
- **Bracket Expand**: < 300ms animación suave

### Monitoring:
```typescript
// Core Web Vitals tracking
performance.mark('matches-page-start');
performance.mark('matches-page-interactive');
performance.measure('matches-page-load', 'matches-page-start', 'matches-page-interactive');
```

---

**🎯 Con esta implementación, el sistema de Matches & Calendar está completo y listo para integración con el backend. Todos los criterios de aceptación del prompt están cubiertos.**