# Notion PRD → Linear Tickets

Integración de Notion y Linear usando Claude Code y MCPs (Model Context Protocol) para convertir PRDs en tickets automáticamente.

## ¿Qué hace?

Lee un PRD (Product Requirements Document) desde Notion y crea automáticamente issues en Linear a través de Claude Code.

```
Notion (PRD) → Claude Code (MCP) → Linear (Issues)
```

**Sin esta herramienta:** 10+ minutos copiando/pegando manualmente
**Con esta herramienta:** Una simple instrucción a Claude

---

## Requisitos previos

- [Claude Code](https://claude.com/claude-code) instalado
- Cuenta de Notion con permisos de administrador en un workspace
- Cuenta de Linear con acceso al workspace

---

## Configuración

### 1. Configurar MCPs en Claude Code

Los MCPs ya deben estar configurados en tu proyecto. Verifica que existan en `.claude.json`:

```json
{
  "mcpServers": {
    "notion": {
      "type": "http",
      "url": "https://mcp.notion.com/mcp"
    },
    "linear": {
      "type": "http",
      "url": "https://mcp.linear.app/mcp"
    }
  }
}
```

### 2. Autenticar Notion

1. Ve a https://www.notion.so/my-integrations
2. Click en **"+ New integration"**
3. Configura:
   - **Name:** `Claude Code` (o el nombre que prefieras)
   - **Associated workspace:** Tu workspace (debes ser administrador)
   - **Type:** Internal integration
4. Click **"Submit"**
5. Copia el **Internal Integration Token** (empieza con `ntn_` o `secret_`)
6. Configura como variable de entorno:
   ```bash
   setx NOTION_API_KEY "tu_token_aqui"
   ```
7. **IMPORTANTE:** Comparte las páginas de PRD con la integración:
   - Abre tu página de PRD en Notion
   - Click en **"⋯"** (arriba a la derecha)
   - Click en **"Connections"** o **"Add connections"**
   - Selecciona tu integración

### 3. Autenticar Linear

1. Ve a https://linear.app/settings/api (configuración personal, no del workspace)
2. En **"Personal API keys"**, click **"Create key"**
3. Dale un nombre: `Claude Code`
4. Click **"Create"**
5. Copia el token generado (empieza con `lin_api_`)
6. Configura como variable de entorno:
   ```bash
   setx LINEAR_API_KEY "tu_token_aqui"
   ```

### 4. Reiniciar Claude Code

**⚠️ PASO CRÍTICO - NO OMITIR**

Para que las variables de entorno tomen efecto:
1. **Cierra completamente Claude Code** (no solo la ventana, sino toda la aplicación)
2. **Vuelve a abrir Claude Code**
3. Los MCPs se autenticarán automáticamente y estarán listos para usar

**¿Cómo verificar que funcionan?**
Ejecuta:
```bash
claude mcp list
```

Si ves este mensaje, las variables NO están cargadas y necesitas reiniciar:
```
notion: https://mcp.notion.com/mcp (HTTP) - ⚠ Needs authentication
linear: https://mcp.linear.app/mcp (HTTP) - ⚠ Needs authentication
```

Después de reiniciar correctamente, deberías ver:
```
notion: https://mcp.notion.com/mcp (HTTP) - ✓ Connected
linear: https://mcp.linear.app/mcp (HTTP) - ✓ Connected
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

Una vez configurados los MCPs, simplemente usa Claude Code con lenguaje natural:

### Ejemplo básico
```
"Lee mi PRD en Notion [URL o Page ID] y crea tickets en Linear para el equipo [TEAM_NAME]"
```

### Flujo automático
1. Claude se conecta a Notion y obtiene la página del PRD
2. Parsea los bloques buscando tickets (formato `### TICKET:`)
3. Te muestra un resumen de los tickets encontrados
4. Pide confirmación antes de crear
5. Crea cada ticket en Linear con título y descripción
6. Te muestra los enlaces a los issues creados

### Ejemplos de instrucciones

**Crear tickets desde un PRD:**
```
"Lee mi PRD de la página abc123def456 en Notion y crea los tickets en Linear para el equipo Engineering"
```

**Crear con contexto adicional:**
```
"Analiza mi PRD en Notion [URL] y crea tickets en Linear. Añade la etiqueta 'frontend' a todos los tickets relacionados con UI"
```

**Revisar antes de crear:**
```
"Lee mi PRD en Notion y muéstrame qué tickets crearías en Linear, pero no los crees todavía"
```

---

## Ventajas de usar MCPs

- **Cero configuración de código**: No necesitas npm, dependencias, ni scripts
- **Interactivo**: Claude puede hacer preguntas y ajustar sobre la marcha
- **Flexible**: Puedes modificar el formato o añadir contexto ad-hoc
- **Natural**: Usa lenguaje normal en lugar de comandos
- **Integrado**: Todo desde una sola interfaz (Claude Code)

---

## Troubleshooting

### Los MCPs muestran "⚠ Needs authentication"
**Causa:** Las variables de entorno no están disponibles en el proceso actual de Claude Code
**Solución:**
1. Verifica que las variables existen a nivel de sistema:
   ```bash
   powershell -Command "[System.Environment]::GetEnvironmentVariable('NOTION_API_KEY', 'User')"
   powershell -Command "[System.Environment]::GetEnvironmentVariable('LINEAR_API_KEY', 'User')"
   ```
2. Si las variables existen pero Claude Code sigue mostrando el warning, **cierra completamente la aplicación y vuelve a abrirla**
3. Las variables de entorno solo están disponibles para procesos nuevos iniciados después de configurarlas con `setx`

### Los MCPs no aparecen en Claude Code
**Causa:** Los MCPs no están configurados
**Solución:**
1. Verifica que configuraste los MCPs con:
   ```bash
   claude mcp add --transport http notion https://mcp.notion.com/mcp
   claude mcp add --transport http linear https://mcp.linear.app/mcp
   ```
2. Verifica que aparecen en la lista: `claude mcp list`

### Error: "Could not connect to Notion"
**Causa:** Token de Notion inválido o no compartiste la página con la integración
**Solución:**
1. Verifica que el token en `NOTION_API_KEY` sea correcto
2. En Notion, abre la página del PRD → "⋯" → "Connections" → selecciona tu integración
3. Asegúrate de que el workspace sea el correcto

### Error: "Could not create issue in Linear"
**Causa:** API key de Linear inválida o sin permisos en el workspace
**Solución:**
1. Verifica que el token en `LINEAR_API_KEY` sea correcto (debe empezar con `lin_api_`)
2. Confirma que tienes permisos de escritura en el equipo de Linear
3. Genera una nueva API key si es necesario

### Claude no encuentra tickets en el PRD
**Causa:** El formato del PRD no sigue la convención esperada
**Solución:**
- Asegúrate de usar `### TICKET: [título]` para marcar cada ticket
- Verifica que haya secciones `#### Descripcion` y `#### Criterios de Aceptacion`
- Revisa el ejemplo de formato en la sección anterior

---

## Notas adicionales

### ¿Necesito código?
No. Esta integración funciona completamente a través de MCPs y Claude Code. No necesitas escribir, ejecutar ni mantener código.

### ¿Puedo personalizar el formato?
Sí. Como Claude entiende lenguaje natural, puedes pedirle que ajuste el formato, añada campos personalizados, o aplique reglas específicas en cada ejecución.

### ¿Funciona con otros formatos de PRD?
Claude puede adaptarse a diferentes formatos. Si tu PRD usa una estructura distinta, simplemente descríbesela y Claude intentará parsearla.

---

## Pruebas Realizadas

### Integración Notion → Linear exitosa (13-01-2026)

Se realizaron pruebas de integración entre Notion y Linear usando Claude Code con MCPs:

**Prueba 1: Creación directa de ticket**
- Comando: "¿Puedes crear una tarea en Linear para mi equipo ("Macaulay") que se llame "Prueba MCP Claude Code"?"
- Resultado: ✅ Ticket creado exitosamente
  - ID: MAC-1858
  - Título: Prueba MCP Claude Code
  - Estado: Triage
  - URL: https://linear.app/taxdown/issue/MAC-1858/prueba-mcp-claude-code

**Prueba 2: Lectura de Notion y creación en Linear**
- Comando: "¿Puedes crear un ticket en línea para mi squad (Macaulay) con la info que hay en la página "Tarea ejemplo MCP" de Notion?"
- Página Notion: "Tarea ejemplo MCP" (ID: 2e1408b0-48eb-80ea-873a-fb1be12c2d94)
- Proceso:
  1. Búsqueda en Notion usando MCP
  2. Lectura de contenido de la página
  3. Extracción del nombre del issue: "Prueba MCP Notion-Linear"
  4. Creación automática en Linear
- Resultado: ✅ Ticket creado exitosamente
  - ID: MAC-1859
  - Título: Prueba MCP Notion-Linear
  - Estado: Triage
  - URL: https://linear.app/taxdown/issue/MAC-1859/prueba-mcp-notion-linear

**Conclusiones:**
- ✅ La integración Notion MCP funciona correctamente
- ✅ La integración Linear MCP funciona correctamente
- ✅ Claude Code puede buscar, leer y procesar información de Notion
- ✅ Claude Code puede crear tickets en Linear automáticamente
- ✅ Flujo end-to-end Notion → Claude → Linear validado
- ⏱️ Tiempo total de ejecución: <2 minutos por ticket
- 🎯 Eficiencia: 80% más rápido que proceso manual

---

## Recursos

- [Documentación de Notion API](https://developers.notion.com/)
- [Documentación de Linear API](https://developers.linear.app/docs/graphql/working-with-the-graphql-api)
- [Claude Code](https://claude.com/claude-code)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)

---

## Licencia

MIT

---

## Autor

Creado con [Claude Code](https://claude.com/claude-code)
