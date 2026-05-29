# Guía de Contribución

¡Gracias por tu interés en contribuir a la herramienta de Metas de Matriculados UDES!

## Antes de empezar

1. **Fork el repositorio**
2. **Clona tu fork** — `git clone https://github.com/tu-usuario/metas-matriculados-udes.git`
3. **Crea una rama** — `git checkout -b feature/mi-feature` o `git checkout -b fix/mi-bug`

## Flujo de contribución

### 1. Cambios pequenos (errores tipográficos, fixes menores)
```bash
git checkout -b fix/descripcion-corta
# Realiza cambios
git add .
git commit -m "fix: descripción del cambio"
git push origin fix/descripcion-corta
# Abre PR
```

### 2. Features nuevas
```bash
git checkout -b feature/descripcion
# Documenta cambios en README.md si es relevante
git add .
git commit -m "feat: descripción clara"
git push origin feature/descripcion
# Abre PR con descripción detallada
```

### 3. Actualizaciones de datos
Contacta primero abriendo una **Issue** para discutir cambios de datos:
- Nuevos programas
- Actualización de históricos
- Cambios en competencia

## Convenciones de commit

Usa [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: agrega nueva funcionalidad
fix: corrige un bug
docs: actualiza documentación
refactor: refactoriza código sin cambiar funcionalidad
perf: mejora de rendimiento
test: agrega o actualiza tests
chore: cambios en build, deps, etc.
```

## Pruebas

Antes de abrir PR:

1. **Abre localmente** — `npx http-server`
2. **Prueba en navegadores** — Chrome, Firefox, Safari, Edge
3. **Modo móvil** — DevTools responsive design (640px ancho)
4. **Funcionalidad PDF** — Verifica export en todos los navegadores

## Estilo de código

### HTML
- Usa indentación de 2 espacios
- IDs/clases en camelCase
- Comenta secciones grandes

### CSS
- Variables CSS en `:root`
- Mobile-first media queries
- Clases con nombres descriptivos

### JavaScript
- Formato [Prettier](https://prettier.io/) compatible
- Funciones con JSDoc breves
- Nombres descriptivos (no `x`, `y`, `temp`)
- `const` por defecto, `let` si es necesario

## Reportar bugs

Abre una **Issue** con:
1. **Descripción clara** — Qué está mal
2. **Pasos para reproducir** — Cómo lo encontraste
3. **Resultado esperado** — Qué debería pasar
4. **Resultado actual** — Qué pasó en su lugar
5. **Capturas de pantalla** — Si es relevante
6. **Entorno** — Browser, SO, versión

### Ejemplo

```
## Bug: PDF no descarga en Firefox

**Descripción**: Al intentar exportar meta a PDF en Firefox, no ocurre nada

**Pasos**:
1. Abre metas-matriculados-udes en Firefox
2. Selecciona Medicina, Bucaramanga, Sem. A
3. Haz clic en botón "Descargar PDF"

**Esperado**: Se descarga archivo PDF

**Actual**: No pasa nada, sin mensajes de error

**Entorno**: 
- Firefox 120.0
- Windows 11
- 1920x1080
```

## Solicitudes de features

Abre una **Issue** con etiqueta `enhancement`:

```
## Feature: Importar datos desde Google Sheets

Permitiría actualizar datos sin editar el código, directamente desde un 
spreadsheet compartido. Facilita que Autorregulación y Mercadeo actualicen 
datos en tiempo real.

## Alternativas consideradas

1. Archivo JSON estático (requiere codificación)
2. Base de datos (excesivo para uso interno)
3. Google Sheets API (mantiene datos centralizados)
```

## Revisión de código

Los maintainers revisarán tu PR en máximo 5 días hábiles. 

Esperamos:
- ✅ Cambios claros y enfocados (no mezcles features)
- ✅ Funcionamiento en navegadores principales
- ✅ Responsive design probado
- ✅ Commit messages claros
- ✅ README actualizado si hay cambios de usuario

## Licencia

Al contribuir, aceptas que tu código se distribuya bajo licencia **MIT**.

---

¿Preguntas? Abre una **Discussion** o contacta a Leonardo Andrés Pinto.

**¡Gracias por mejorar esta herramienta! 🎓**
