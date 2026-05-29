/**
 * Reporte PDF consolidado con filtros (campus + nivel)
 * Genera una tabla con la meta de cada programa para el periodo 2026 A/B.
 * Reutiliza la constante global D (app.js), pdfMake (pdf-export.js) y
 * obtenerDescripcionCondicion (pdf-export.js).
 */

const NIVELES = ['Pregrado', 'Especialización', 'Maestría', 'Doctorado'];

function camposUnicos() {
  return [...new Set(D.map(d => d.campus))];
}

/**
 * Construye (una sola vez) y muestra el modal de filtros.
 */
function abrirModalReporte() {
  let modal = document.getElementById('rep-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'rep-modal';
    modal.className = 'rep-overlay';

    const campusChecks = camposUnicos().map(c =>
      `<label class="rep-chk"><input type="checkbox" class="rep-campus" value="${c}" checked> ${c}</label>`
    ).join('');

    const nivelChecks = NIVELES.map(n =>
      `<label class="rep-chk"><input type="checkbox" class="rep-nivel" value="${n}" checked> ${n}</label>`
    ).join('');

    const semActual = (typeof sem !== 'undefined') ? sem : 'A';

    modal.innerHTML = `
      <div class="rep-card">
        <div class="rep-head">
          <h3>Reporte PDF de metas</h3>
          <button class="rep-x" onclick="cerrarModalReporte()" aria-label="Cerrar">&times;</button>
        </div>
        <div class="rep-body">
          <div class="rep-group">
            <div class="rep-group-head">
              <span>Campus</span>
              <button type="button" class="rep-toggle" data-target="rep-campus">Todos / ninguno</button>
            </div>
            <div class="rep-checks">${campusChecks}</div>
          </div>
          <div class="rep-group">
            <div class="rep-group-head">
              <span>Nivel</span>
              <button type="button" class="rep-toggle" data-target="rep-nivel">Todos / ninguno</button>
            </div>
            <div class="rep-checks">${nivelChecks}</div>
          </div>
          <div class="rep-group">
            <div class="rep-group-head"><span>Periodo</span></div>
            <div class="rep-checks">
              <label class="rep-chk"><input type="radio" name="rep-sem" value="A" ${semActual === 'A' ? 'checked' : ''}> 2026 A</label>
              <label class="rep-chk"><input type="radio" name="rep-sem" value="B" ${semActual === 'B' ? 'checked' : ''}> 2026 B</label>
            </div>
          </div>
        </div>
        <div class="rep-foot">
          <button class="rep-btn-sec" onclick="cerrarModalReporte()">Cancelar</button>
          <button class="rep-btn-pri" id="rep-gen">Generar PDF</button>
        </div>
      </div>`;

    document.body.appendChild(modal);

    // Cerrar al hacer clic fuera de la tarjeta
    modal.addEventListener('click', e => { if (e.target === modal) cerrarModalReporte(); });

    // Botones "Todos / ninguno"
    modal.querySelectorAll('.rep-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const cks = modal.querySelectorAll('.' + btn.dataset.target);
        const allOn = [...cks].every(c => c.checked);
        cks.forEach(c => c.checked = !allOn);
      });
    });

    modal.querySelector('#rep-gen').addEventListener('click', generarReporteDesdeModal);
  }

  modal.style.display = 'flex';
}

function cerrarModalReporte() {
  const modal = document.getElementById('rep-modal');
  if (modal) modal.style.display = 'none';
}

function generarReporteDesdeModal() {
  const modal = document.getElementById('rep-modal');
  const campusSel = [...modal.querySelectorAll('.rep-campus:checked')].map(c => c.value);
  const nivelesSel = [...modal.querySelectorAll('.rep-nivel:checked')].map(c => c.value);
  const semSel = modal.querySelector('input[name="rep-sem"]:checked')?.value || 'A';

  if (!campusSel.length || !nivelesSel.length) {
    alert('Selecciona al menos un campus y un nivel.');
    return;
  }

  const btn = modal.querySelector('#rep-gen');
  const txt = btn.textContent;
  btn.textContent = 'Generando...';
  btn.disabled = true;

  setTimeout(() => {
    try {
      exportReporteFiltrado(campusSel, nivelesSel, semSel);
      cerrarModalReporte();
    } catch (e) {
      console.error('Error generando reporte:', e);
      alert('Error al generar el PDF. Revisa la consola (F12).');
    } finally {
      btn.textContent = txt;
      btn.disabled = false;
    }
  }, 150);
}

/**
 * Genera el PDF consolidado agrupado por campus y nivel.
 */
function exportReporteFiltrado(campusSel, nivelesSel, semParam) {
  if (typeof pdfMake === 'undefined' || !pdfMake.vfs) {
    conPdfMake(() => exportReporteFiltrado(campusSel, nivelesSel, semParam));
    return;
  }

  const azul = '#003A8C';
  const content = [
    {
      text: `Periodo: 2026 ${semParam}  ·  Meta de matriculados de primer curso`,
      fontSize: 11, color: '#555', margin: [0, 0, 0, 12]
    }
  ];

  let totalProgramas = 0;
  const condsUsadas = new Set();

  campusSel.forEach(campus => {
    nivelesSel.forEach(nivel => {
      const grupo = D.filter(d => d.campus === campus && d.nivel === nivel);
      if (!grupo.length) return;
      totalProgramas += grupo.length;

      const body = [[
        { text: 'Programa', bold: true, fillColor: azul, color: '#fff' },
        { text: 'Cupo MEN', bold: true, fillColor: azul, color: '#fff', alignment: 'center' },
        { text: 'PE', bold: true, fillColor: azul, color: '#fff', alignment: 'center' },
        { text: 'Histórico', bold: true, fillColor: azul, color: '#fff', alignment: 'center' },
        { text: `Meta 2026 ${semParam}`, bold: true, fillColor: azul, color: '#fff', alignment: 'center' },
        { text: 'Cond.', bold: true, fillColor: azul, color: '#fff', alignment: 'center' }
      ]];

      grupo.forEach(d => {
        const meta = semParam === 'A' ? d.metaA : d.metaB;
        const cond = semParam === 'A' ? d.condA : d.condB;
        const prom = semParam === 'A' ? d.promA : d.promB;
        if (cond && cond !== '---') condsUsadas.add(cond);
        body.push([
          { text: d.programa, fontSize: 9 },
          { text: d.cupo != null ? d.cupo.toString() : '—', alignment: 'center', fontSize: 9 },
          { text: d.pe != null ? d.pe.toString() : '—', alignment: 'center', fontSize: 9 },
          { text: prom != null ? prom.toString() : '—', alignment: 'center', fontSize: 9 },
          { text: meta != null ? meta.toString() : '—', alignment: 'center', bold: true, fontSize: 9 },
          { text: cond || '—', alignment: 'center', fontSize: 9 }
        ]);
      });

      content.push({
        text: `${campus}  ·  ${nivel}${grupo.length > 1 ? 's' : ''}  (${grupo.length})`,
        bold: true, color: azul, fontSize: 12, margin: [0, 12, 0, 6]
      });
      content.push({
        layout: 'lightHorizontalLines',
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body
        }
      });
    });
  });

  if (totalProgramas === 0) {
    alert('No hay programas para la combinación de campus y nivel seleccionada.');
    return;
  }

  // Leyenda de condiciones usadas
  if (condsUsadas.size) {
    const leyenda = [...condsUsadas].sort().map(c => ({
      text: [{ text: c + ': ', bold: true }, obtenerDescripcionCondicion(c)],
      fontSize: 9, color: '#555', margin: [0, 2, 0, 0]
    }));
    content.push({ text: 'Marco metodológico', bold: true, color: azul, fontSize: 12, margin: [0, 16, 0, 6] });
    content.push(...leyenda);
  }

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 50, 40, 40],
    header: {
      text: `REPORTE DE METAS UDES · 2026 ${semParam}`,
      bold: true, fontSize: 14, color: azul, alignment: 'center', margin: [0, 18, 0, 0]
    },
    footer: (currentPage, pageCount) => ({
      text: `Página ${currentPage} de ${pageCount}  ·  ${totalProgramas} programa(s)`,
      alignment: 'center', fontSize: 9, color: '#999'
    }),
    content,
    defaultStyle: { fontSize: 10 }
  };

  pdfMake.createPdf(docDefinition).download(`reporte_metas_UDES_2026${semParam}.pdf`);
}
