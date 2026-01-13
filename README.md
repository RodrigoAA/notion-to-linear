# Notion PRD → Linear Tickets

Automatización que lee un PRD (Product Requirements Document) desde Notion y crea automáticamente tickets en Linear.

## ¿Qué hace?

Convierte user stories y tareas de un documento en Notion en issues de Linear con un solo comando.

```
Notion (PRD) → Parser → Linear (Issues)
```

**Sin esta herramienta:** 10+ minutos copiando/pegando manualmente
**Con esta herramienta:** 10 segundos ejecutando `npm run dev`

---

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/RodrigoAA/notion-to-linear.git
cd notion-to-linear

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus API keys (ver sección siguiente)
```

---

## Configuración

### 1. Obtener API Key de Notion

1. Ve a https://www.notion.so/my-integrations
2. Click en **"+ New integration"**
3. Configura:
   - **Name:** `PRD to Linear` (o el nombre que prefieras)
   - **Associated workspace:** Tu workspace
   - **Type:** Internal integration
4. Click **"Submit"**
5. Copia el **Internal Integration Secret** (empieza con `secret_`)
6. **IMPORTANTE:** Comparte la página del PRD con la integración:
   - Abre tu página de PRD en Notion
   - Click en **"..."** (arriba a la derecha)
   - Click en **"Add connections"**
   - Selecciona tu integración

**Obtener Page ID:**
El Page ID está en la URL de tu página de Notion:
```
https://www.notion.so/Tu-Pagina-abc123def456...
                                ^^^^^^^^^^^^^^^^
                                Este es el Page ID
```

### 2. Obtener API Key de Linear

1. Ve a https://linear.app/settings/api
2. En **"Personal API keys"**, click **"Create key"**
3. Configura:
   - **Label:** `notion-prd-automation`
   - **Permisos:**
     - Issues: Read & Write
     - Projects: Read
     - Teams: Read
4. Click **"Create"**
5. **COPIA EL TOKEN INMEDIATAMENTE** (solo se muestra una vez)

**Obtener Team ID:**

Ejecuta este comando con tu API key:
```bash
curl -X POST https://api.linear.app/graphql \
  -H "Authorization: TU_LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ teams { nodes { id name key } } }"}'
```

Respuesta:
```json
{
  "data": {
    "teams": {
      "nodes": [
        {
          "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",  ← Este es tu TEAM_ID
          "name": "Engineering",
          "key": "ENG"
        }
      ]
    }
  }
}
```

### 3. Configurar .env

Edita el archivo `.env`:
```env
NOTION_API_KEY=secret_tu_token_de_notion
NOTION_PAGE_ID=abc123def456...
LINEAR_API_KEY=lin_api_tu_token_de_linear
LINEAR_TEAM_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
# LINEAR_PROJECT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  # Opcional
```

---

## Formato del PRD en Notion

Tu página de Notion debe seguir este formato:

```markdown
# Nombre del Proyecto

## Contexto
Descripción general del problema o necesidad

## Tickets

### TICKET: Implementar login
#### Descripcion
El usuario debe poder iniciar sesión con email y contraseña.

#### Criterios de Aceptacion
- [ ] Validar formato de email
- [ ] Mostrar error si credenciales inválidas
- [ ] Redirigir al dashboard tras login exitoso

---

### TICKET: Crear página de perfil
#### Descripcion
El usuario puede ver y editar su información personal.

#### Criterios de Aceptacion
- [ ] Mostrar foto de perfil
- [ ] Permitir editar nombre y bio
- [ ] Guardar cambios en la base de datos

---

### TICKET: Añadir notificaciones por email
#### Descripcion
...
```

### Reglas importantes:

| Elemento | Descripción |
|----------|-------------|
| `### TICKET: [título]` | **Obligatorio.** Marca el inicio de un nuevo ticket |
| `#### Descripcion` | Contenido que irá en el cuerpo del issue |
| `#### Criterios de Aceptacion` | Lista de checkboxes o bullets que se agregan a la descripción |
| `---` (divider) | Separador visual opcional (se ignora) |

---

## Uso

```bash
npm run dev
```

**Flujo:**
1. ✅ Carga configuración desde `.env`
2. ✅ Se conecta a Notion y obtiene la página
3. ✅ Parsea los bloques buscando tickets
4. ✅ Muestra lista de tickets encontrados
5. ⏸️ **Espera confirmación** (presiona Enter para continuar)
6. ✅ Crea cada ticket en Linear
7. ✅ Muestra resumen final

**Ejemplo de salida:**
```
=== Notion PRD to Linear Tickets ===

Configuration loaded successfully

Fetching PRD from Notion page: abc123def456...
Found 45 blocks

Parsed 3 tickets:
  1. Implementar login
  2. Crear página de perfil
  3. Añadir notificaciones por email

Press Enter to create tickets in Linear, or Ctrl+C to cancel...

Creating tickets in Linear...
Creating ticket: Implementar login
  -> Created: ENG-123
Creating ticket: Crear página de perfil
  -> Created: ENG-124
Creating ticket: Añadir notificaciones por email
  -> Created: ENG-125

=== Done! Created 3/3 tickets ===
```

---

## Estructura del Código

```
src/
├── index.ts                    # Script principal - orquesta el flujo
├── config/
│   └── env.ts                  # Carga y valida variables de entorno
├── services/
│   ├── notion-service.ts       # Cliente de Notion - obtiene bloques
│   └── linear-service.ts       # Cliente de Linear - crea issues
├── parsers/
│   └── prd-parser.ts           # Parsea bloques de Notion → tickets
└── types/
    └── index.ts                # Interfaces TypeScript
```

### Archivos clave:

- **`prd-parser.ts`**: Lógica que identifica tickets y extrae información
- **`linear-service.ts`**: Crea issues en Linear con título y descripción
- **`notion-service.ts`**: Maneja paginación de bloques de Notion
- **`env.ts`**: Valida que todas las API keys estén configuradas

---

## Alternativa: Usar MCPs

Si usas **Claude Code**, puedes usar los MCPs oficiales en lugar de este script:

### Configurar MCPs

1. Edita `~/.claude/settings.local.json`:
```json
{
  "mcpServers": {
    "notion": {
      "url": "https://mcp.notion.com/mcp"
    },
    "linear": {
      "url": "https://mcp.linear.app/mcp"
    }
  }
}
```

2. Reinicia Claude Code
3. Autoriza los MCPs cuando te lo pida

### Usar con Claude

```
Tú: "Lee mi PRD en Notion (página abc123) y crea tickets en Linear"
Claude: [usa Notion MCP] → [parsea] → [usa Linear MCP] ✅
```

**Ventajas de MCPs:**
- No necesitas ejecutar scripts
- Claude hace todo interactivamente
- Más flexible para cambios ad-hoc

**Ventajas del script:**
- Portable (funciona sin Claude)
- Repetible y automatizable
- Control total del formato

---

## Troubleshooting

### Error: "Missing required environment variables"
**Causa:** No has configurado el archivo `.env`
**Solución:** Copia `.env.example` a `.env` y completa las API keys

### Error: "No tickets found"
**Causa:** El formato del PRD no es correcto
**Solución:** Asegúrate de usar `### TICKET: [título]` para cada ticket

### Error: "Failed to create issue"
**Causa:** API key de Linear inválida o sin permisos
**Solución:** Genera una nueva API key con permisos de Write en Issues

### Error: "Notion API error"
**Causa:** No compartiste la página con la integración
**Solución:** En Notion, abre la página → "..." → "Add connections" → selecciona tu integración

---

## Licencia

MIT

---

## Contribuciones

Pull requests bienvenidos. Para cambios grandes, abre un issue primero.

---

## Autor

Creado con [Claude Code](https://claude.com/claude-code)
