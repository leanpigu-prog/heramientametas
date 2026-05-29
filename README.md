# 🎓 Herramienta de Metas de Matriculados - UDES 2026

Aplicación interactiva para fijar y gestionar metas de matriculados en primer curso por programa académico en la Universidad de Santander (UDES).

## 📋 Características

✅ **Interfaz interactiva** — Selectores dinámicos por campus, programa, semestre y año de corte  
✅ **Metodología de 5 condiciones** — Basada en históricos, demanda competitiva, cupos y promedios adaptativos  
✅ **Análisis de mercado** — Comparación con competencia privada (SNIES 2021-2024)  
✅ **Visualización de tendencias** — Histograma interactivo 2019-2025 por semestre  
✅ **Exportación a PDF** — Reportes individuales y consolidados con pdfmake  
✅ **90 programas incluidos** — 4 campus: Bucaramanga, Cúcuta, Valledupar, Bogotá  

---

## 🚀 Inicio rápido

### Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/metas-matriculados-udes.git
   cd metas-matriculados-udes
   ```

2. **Abre en navegador**
   ```bash
   # Windows
   start index.html
   
   # macOS
   open index.html
   
   # Linux
   xdg-open index.html
   ```

3. **O sirve localmente (recomendado)**
   ```bash
   # Con Python 3
   python -m http.server 8000
   
   # Con Node.js / http-server
   npx http-server
   ```
   Luego accede a `http://localhost:8000`

---

## 📁 Estructura del proyecto

```
metas-matriculados-udes/
├── index.html              # Página principal
├── css/
│   └── style.css           # Estilos (separados del HTML)
├── js/
│   ├── app.js              # Lógica principal de la aplicación
│   └── pdf-export.js       # Módulo de exportación a PDF
├── data/
│   └── [datos.json]        # Fuentes de datos (futuro)
├── README.md               # Este archivo
├── LICENSE                 # Licencia del proyecto
└── .gitignore              # Archivos a ignorar en Git
```

---

## 🔧 Uso

### Seleccionar programa y ver meta

1. **Campus**: Selecciona la sede (Bucaramanga, Cúcuta, Valledupar, Bogotá)
2. **Programa académico**: Elige un programa de pregrado, especialización, maestría o doctorado
3. **Semestre**: Selecciona Sem. A o Sem. B
4. **Año de corte**: Audita cálculos retroactivos (2021-2025)

### Interpretar resultados

- **Número grande (meta)**: Cantidad de estudiantes objetivo para primer ingreso
- **Condición (C1-C5)**: Regla metodológica aplicada
- **Indicadores**: Histórico, cupo MEN, punto de equilibrio
- **Mercado**: Participación de UDES vs competencia privada
- **Histograma**: Visualización de tendencia 2019-2025

### Exportar a PDF

```javascript
// Exportar meta de un programa individual
exportMetaToPDF({
  campus: 'Bucaramanga',
  program: 'Medicina',
  semester: 'A',
  year: 2025,
  meta: 45,
  historico: 42,
  cupo: 48,
  pe: 36,
  condicion: 'C2',
  demanda: '↑ Competencia supera',
  participacion: '52%',
  competencia: { total: 38, avg: 38 }
});

// Exportar resumen consolidado por campus
exportReporteProgramas(arrayDeProgramas, 'Bucaramanga');
```

---

## 📊 Metodología de 5 condiciones

| Cond. | Situación | Meta |
|-------|-----------|------|
| **C1** | Histórico ≈ Cupo MEN (±2) | Cupo × 1.05 (acreditado) / × 1.10 (no acreditado) |
| **C2** | Histórico ≈ PE + hay demanda | min(PE × 1.35, Cupo) |
| **C3** | Histórico < PE + hay demanda | PE × 1.10 |
| **C4** | Histórico < PE + sin demanda | Histórico × 1.10 |
| **C5** | Histórico > PE + sin demanda | Promedio adaptativo (5 reglas) |

### Promedio adaptativo (5 reglas)
- **R1**: Si diferencia completo vs últimos 3 años > 15% → usar últimos 3
- **R2**: Si últimos 3 todos por encima del promedio completo → usar últimos 3
- **R3**: Si últimos 3 todos por debajo del promedio completo → usar últimos 3
- **R4**: Si últimos 2 ambos por debajo → usar últimos 2 (bajista)
- **R5**: Si últimos 2 ambos por encima de últimos 3 → usar últimos 2 (alcista)

**Techo en C5**: Meta = min(promedio, cupo) para evitar metas irreales.

---

## 📦 Dependencias

### Librerías externas (CDN)
- **pdfMake** — Generación de PDF en navegador
  ```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.5.0/pdfmake.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.5.0/vfs_fonts.js"></script>
  ```
- **Google Fonts** — Tipografía Barlow y Barlow Condensed

### Sin dependencias Node.js
La aplicación es **100% vanilla HTML/CSS/JS** — no requiere build tools ni npm.

---

## 🎨 Personalización

### Cambiar colores y tema
Edita las variables CSS en `css/style.css`:

```css
:root{
  --az:#003A8C;        /* Azul UDES */
  --go:#C49A22;        /* Dorado */
  --c1:#003A8C;        /* Color condición C1 */
  --c2:#1B6B3A;        /* Color condición C2 */
  /* ... */
}
```

### Agregar más programas
Los datos están embebidos en `js/app.js`. Para actualizar:
1. Modifica el array de programas
2. Recalcula condiciones y metas con la metodología
3. Refresca el navegador

---

## 📄 Archivos de datos fuente

Documentación externa (no incluida en repo):
- `Plantilla_metas_MEI_OK_DIF.xlsx` — Históricos RCA, PE, cupos por Dirección Financiera
- `competidores_udes_por_programa.xlsx` — Datos SNIES de IES privadas 2021-2024
- `programas_acreditados.xlsx` — 10 programas con Acreditación de Alta Calidad

Para actualizar datos, contacta a:
- **Autorregulación** — Cupos y programas acreditados
- **Dirección Financiera** — Puntos de equilibrio (PE)
- **Oficina de Mercadeo** — Análisis de demanda

---

## 🔐 Licencia

Este proyecto está bajo licencia **MIT**. Ver archivo `LICENSE`.

---

## 👥 Autor

**Creado para**: Oficina de Planeación Institucional, UDES  
**Contacto**: Leonardo Andrés Pinto Guarguati  
**Repositorio**: [GitHub](https://github.com/tu-usuario/metas-matriculados-udes)

---

## 🐛 Reporte de problemas

Si encuentras un bug o tienes una sugerencia:
1. Abre una **Issue** en GitHub
2. Describe el problema con pasos para reproducir
3. Incluye screenshots si es relevante

---

## 📈 Roadmap

- [ ] Importar datos desde Google Sheets
- [ ] Modo offline con IndexedDB
- [ ] Gráficos de proyección a 5 años
- [ ] Integración con Google Sites mejorada
- [ ] Validación automática de datos
- [ ] Comparación histórica de metas

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el repo
2. Crea una rama (`git checkout -b feature/tu-feature`)
3. Commit los cambios (`git commit -m 'Add feature'`)
4. Push a la rama (`git push origin feature/tu-feature`)
5. Abre un Pull Request

---

**Última actualización**: Junio 2026  
**Versión**: 5.1 (refactorizada para GitHub)
