# ⚡ Inicio rápido - 2 minutos

## Opción 1: Abrir directamente (más rápido)
```bash
# Windows
start index.html

# macOS
open index.html

# Linux
xdg-open index.html
```

## Opción 2: Servir localmente (recomendado)

### Con Python (incluido en Windows/Mac/Linux)
```bash
cd metas-matriculados-udes
python -m http.server 8000
# Luego abre: http://localhost:8000
```

### Con Node.js / npm
```bash
npm install -g http-server
cd metas-matriculados-udes
http-server
# Luego abre: http://localhost:8080
```

### Con Docker
```bash
docker run -p 8000:80 -v $(pwd):/usr/share/nginx/html nginx:latest
# Luego abre: http://localhost:8000
```

---

## Primer uso

1. **Elige campus** — Bucaramanga, Cúcuta, Valledupar o Bogotá
2. **Selecciona programa** — Pregrado, especialización, maestría o doctorado
3. **Elige semestre** — A o B
4. **Mira la meta** — Número grande azul
5. **Revisa indicadores** — Histórico, cupo, punto de equilibrio
6. **Ve tendencias** — Histograma 2019-2025
7. **Exporta a PDF** — (Disponible pronto)

---

## Archivos clave

| Archivo | Propósito |
|---------|-----------|
| `index.html` | Página principal |
| `css/style.css` | Estilos y diseño |
| `js/app.js` | Lógica de metas y cálculos |
| `js/pdf-export.js` | Exportación a PDF |
| `README.md` | Documentación completa |

---

## Solución de problemas

### "No carga la página"
- Asegúrate de servir con servidor local (no es suficiente abrir HTML directamente)
- Verifica que el puerto no esté en uso (8000, 8080)

### "Falta CSS o JS"
- Limpia el cache del navegador (Ctrl+Shift+Del)
- Verifica que carpetas `css/` y `js/` existan
- Abre Consola (F12) para ver errores

### "PDF no descarga"
- Usa navegador moderno (Chrome, Firefox, Edge, Safari)
- Asegúrate que pdfMake cargó desde CDN
- Abre Consola para ver errores

---

## Próximos pasos

1. **Compartir con el equipo** → Sube a GitHub
2. **Actualizar datos** → Edita `js/app.js` con nuevos programas
3. **Personalizar colores** → Modifica variables CSS
4. **Integrar en Google Sites** → Usa embed HTML

---

**¿Necesitas ayuda?** Lee [README.md](README.md) o abre una Issue en GitHub.
