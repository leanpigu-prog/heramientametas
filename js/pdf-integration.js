/**
 * Integración del botón de descarga PDF en la interfaz
 * Se ejecuta después de que app.js renderiza el programa
 */

let currentProgramData = {};

/**
 * Actualiza los datos del programa actual
 * Llamado desde app.js después de renderizar
 */
function updateCurrentProgramData(data) {
  currentProgramData = data;
}

/**
 * Obtiene los datos del programa seleccionado leyéndolos directamente de la
 * constante global D (app.js), replicando la lógica de cálculo de render().
 * Más robusto que raspar el DOM.
 */
function extractProgramDataFromUI() {
  try {
    const campus = document.getElementById('sc')?.value || 'N/A';
    const program = document.getElementById('sp')?.value || 'N/A';
    const semester = (typeof sem !== 'undefined') ? sem : 'A';
    const year = parseInt(document.getElementById('sy')?.value || 2025);

    const d = (typeof D !== 'undefined') ? D.find(x => x.campus === campus && x.programa === program) : null;
    if (!d) return null;

    // Meta / condición / histórico según corte y semestre (igual que render())
    let prom, meta, cond;
    if (year === 2025) {
      prom = semester === 'A' ? d.promA : d.promB;
      meta = semester === 'A' ? d.metaA : d.metaB;
      cond = semester === 'A' ? d.condA : d.condB;
    } else {
      prom = promAdaptativo(d.hist, semester, year);
      const hd = semester === 'A' ? d.hayDemandaA : d.hayDemandaB;
      const [m, c] = calcMeta(prom, d.cupo, d.pe, hd, d.acreditado || false);
      meta = m; cond = c;
    }

    // Mercado
    const compV = semester === 'A' ? d.prom_comp_A : d.prom_comp_B;
    const nIes = d.n_ies || 0;
    const hayDem = semester === 'A' ? d.hayDemandaA : d.hayDemandaB;
    const total = (prom || 0) + (compV || 0);
    const pctU = total > 0 ? Math.round((prom || 0) / total * 100) : 0;
    const promIes = (compV && nIes > 0) ? Math.round(compV / nIes) : 0;

    const demanda = compV == null
      ? 'Sin dato de competencia privada'
      : (hayDem ? `Hay demanda · ${nIes} IES privada${nIes > 1 ? 's' : ''} en el municipio`
                : 'UDES lidera el segmento privado');

    return {
      campus,
      program,
      semester,
      year,
      meta: meta != null ? meta : 0,
      historico: prom != null ? prom : 0,
      cupo: d.cupo != null ? d.cupo : 0,
      pe: d.pe != null ? d.pe : 0,
      condicion: cond || '—',
      demanda,
      participacion: pctU + '%',
      competencia: { total: compV != null ? Math.round(compV) : 0, avg: promIes }
    };
  } catch (e) {
    console.error('Error extracting program data:', e);
    return null;
  }
}

/**
 * Agrega el botón de PDF a la interfaz
 */
function addPDFButton() {
  const heroBody = document.querySelector('.hero-body');
  if (!heroBody) return;

  // Crear contenedor de acciones
  let actionsDiv = document.querySelector('.pdf-actions');
  if (!actionsDiv) {
    actionsDiv = document.createElement('div');
    actionsDiv.className = 'pdf-actions';
    heroBody.parentElement.appendChild(actionsDiv);
  }

  // Crear botón de descarga PDF
  if (!document.querySelector('.pdf-btn')) {
    const pdfBtn = document.createElement('button');
    pdfBtn.className = 'pdf-btn';
    pdfBtn.id = 'downloadPdfBtn';
    pdfBtn.innerHTML = `
      <svg class="pdf-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="12" y1="13" x2="12" y2="19"></line>
        <line x1="9" y1="16" x2="15" y2="16"></line>
      </svg>
      Descargar PDF
    `;

    pdfBtn.addEventListener('click', downloadProgramPDF);
    actionsDiv.appendChild(pdfBtn);
  }
}

/**
 * Descarga el programa como PDF
 */
function downloadProgramPDF() {
  // Intentar obtener datos de la interfaz
  const data = extractProgramDataFromUI();

  if (!data) {
    alert('No se pudieron extraer los datos del programa. Intenta de nuevo.');
    return;
  }

  // Mostrar feedback visual
  const btn = document.getElementById('downloadPdfBtn');
  const originalText = btn.innerHTML;
  btn.innerHTML = `<span>Generando...</span>`;
  btn.disabled = true;

  // Pequeño delay para que se vea la animación
  setTimeout(() => {
    try {
      exportMetaToPDF(data);
      btn.innerHTML = `<span style="color:#fff">✓ Descargado</span>`;

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }, 2000);
    } catch (e) {
      console.error('Error downloading PDF:', e);
      alert('Error al generar PDF. Verifica la consola (F12) para más detalles.');
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  }, 200);
}

/**
 * Observer para detectar cambios en la interfaz y agregar botón
 */
function initPDFIntegration() {
  // Agregar botón inicialmente
  setTimeout(addPDFButton, 100);

  // Observar cambios en el div de salida
  const outDiv = document.getElementById('out');
  if (outDiv) {
    const observer = new MutationObserver(() => {
      // Esperar a que termine el render
      setTimeout(addPDFButton, 50);
    });

    observer.observe(outDiv, {
      childList: true,
      subtree: true
    });
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPDFIntegration);
} else {
  initPDFIntegration();
}
