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
 * Obtiene datos del programa desde la interfaz renderizada
 */
function extractProgramDataFromUI() {
  try {
    // Obtener selecciones actuales
    const campus = document.getElementById('sc')?.value || 'N/A';
    const program = document.getElementById('sp')?.value || 'N/A';
    const semester = document.querySelector('.sb.on')?.textContent?.replace('Sem. ', '') || 'A';
    const year = parseInt(document.getElementById('sy')?.value || 2025);

    // Obtener valores de la interfaz renderizada
    const outDiv = document.getElementById('out');
    if (!outDiv) return null;

    // Buscar meta (número grande)
    const metaNum = outDiv.querySelector('.meta-n');
    const meta = metaNum ? parseInt(metaNum.textContent) : 0;

    // Buscar condición (C1-C5)
    const condTitle = outDiv.querySelector('.cond-title');
    const condicion = condTitle ? condTitle.textContent.trim() : 'N/A';

    // Buscar histórico
    const indLabels = Array.from(outDiv.querySelectorAll('.ind-label'));
    const historicoLabel = indLabels.find(l => l.textContent.includes('HISTÓRICO'));
    const historico = historicoLabel
      ? parseInt(historicoLabel.parentElement?.querySelector('.ind-val')?.textContent || 0)
      : 0;

    // Buscar cupo y PE
    const allIndRows = outDiv.querySelectorAll('.ind-row');
    let cupo = 0, pe = 0;

    allIndRows.forEach(row => {
      const label = row.querySelector('.ind-label')?.textContent || '';
      const value = row.querySelector('.ind-val')?.textContent || '0';
      if (label.includes('CUPO')) cupo = parseInt(value);
      if (label.includes('PUNTO DE EQ')) pe = parseInt(value);
    });

    // Buscar datos de mercado
    const mktBoxes = outDiv.querySelectorAll('.mkt-box');
    let participacion = '0%', competenciaData = { total: 0, avg: 0 };

    if (mktBoxes.length >= 2) {
      // UDES (primer box)
      const udesSub = mktBoxes[0].querySelector('.mkt-box-sub')?.textContent || '';
      const participacionMatch = udesSub.match(/(\d+)%/);
      participacion = participacionMatch ? participacionMatch[0] : '0%';

      // Competencia (segundo box)
      const compNum = mktBoxes[1].querySelector('.mkt-box-num')?.textContent || '0';
      const compSub = mktBoxes[1].querySelector('.mkt-box-sub')?.textContent || '';
      const avgMatch = compSub.match(/(\d+\.?\d*)/);
      competenciaData = {
        total: parseInt(compNum),
        avg: avgMatch ? parseInt(avgMatch[0]) : 0
      };
    }

    // Buscar demanda (chip de demanda)
    const demandChip = outDiv.querySelector('.dem-chip');
    const demanda = demandChip ? demandChip.textContent.trim() : 'N/A';

    return {
      campus,
      program,
      semester,
      year,
      meta,
      historico,
      cupo,
      pe,
      condicion,
      demanda,
      participacion,
      competencia: competenciaData
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
