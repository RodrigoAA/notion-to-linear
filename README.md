# Notion PRD → Linear Tickets

Integración de Notion y Linear con Claude Code para gestionar PRDs y tickets automáticamente.

```
Idea → PRD (Notion) → Proyecto + Tickets (Linear)
```

---

## Flujo de Trabajo

| Paso | Acción | Quién |
|------|--------|-------|
| 1. **Solicitud** | Pides crear un PRD para una funcionalidad | Tú |
| 2. **Contexto** | Claude busca reuniones relevantes en Notion | Claude |
| 3. **Discovery** | Claude hace preguntas para completar info | Claude |
| 4. **PRD** | Claude crea el PRD en Notion | Claude |
| 5. **Revisión** | Revisas y apruebas el PRD | Tú |
| 6. **Linear** | Claude crea proyecto + tickets + relaciones + asignaciones | Claude |

### Comandos

```bash
# Flujo completo
"Crea un PRD para [funcionalidad]"

# Solo PRD
"Crea un PRD en Notion para [funcionalidad], no crees tickets"

# Solo tickets (PRD ya existe)
"Crea proyecto y tickets en Linear desde este PRD: [URL]"
```

---

## Squad Macaulay

**Equipo en Linear:** `Macaulay`

| Nombre | Rol | Asignaciones |
|--------|-----|--------------|
| Rodri Avilés | Product Manager | PRD, Analytics |
| Rafa Vergara | Tech Lead | Arquitectura, Deploy |
| Pablo Rego | Product Designer | Diseño UI/UX |
| Aitor Fernández | Tax Lead | Lógica fiscal |
| Javi Nogales | Backend | APIs, BD |
| Robert Hernandez | Frontend | Componentes UI |
| Alberto Polidura | AI Scientist | IA, Modelos |

### Reuniones (contexto automático)

Claude busca automáticamente en la [BD de reuniones](https://www.notion.so/fdc8ac0b2b25449b9b5ed652d6678955) por palabras clave relacionadas con la funcionalidad.

**Tipos relevantes:** Diseño, Planning, Grooming, Commitment

```bash
# También puedes indicar reuniones específicas
"Crea un PRD basándote en la reunión 'Diseño modal CSAT'"
```

---

## Configuración

### 1. Variables de entorno

```bash
# Notion: https://www.notion.so/my-integrations → Create integration
setx NOTION_API_KEY "ntn_xxx"

# Linear: https://linear.app/settings/api → Create key
setx LINEAR_API_KEY "lin_api_xxx"
```

### 2. Reiniciar Claude Code

Cierra y abre Claude Code para que cargue las variables.

```bash
# Verificar conexión
claude mcp list
# Debe mostrar: ✓ Connected
```

### 3. Compartir páginas en Notion

Abre cada página/BD → ⋯ → Connections → Selecciona tu integración.

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| MCPs muestran "⚠ Needs authentication" | Reinicia Claude Code completamente |
| "Could not connect to Notion" | Verifica token y que compartiste la página |
| "Could not create issue in Linear" | Verifica API key y permisos en el equipo |

---

## Recursos

- [Claude Code](https://claude.com/claude-code)
- [Notion API](https://developers.notion.com/)
- [Linear API](https://developers.linear.app/)
- [MCP](https://modelcontextprotocol.io/)
