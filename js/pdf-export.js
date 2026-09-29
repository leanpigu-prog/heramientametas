/**
 * Módulo de exportación a PDF
 * Utiliza pdfmake para generar reportes de metas de matriculados
 */

// Cargar pdfmake desde CDN (vfs_fonts depende de pdfmake, por eso va en su onload)
const PDFMAKE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.12';
function loadPdfMake() {
  if (typeof pdfMake !== 'undefined' || document.getElementById('pdfmake-lib')) return;
  const script1 = document.createElement('script');
  script1.id = 'pdfmake-lib';
  script1.src = PDFMAKE_CDN + '/pdfmake.min.js';
  script1.onload = () => {
    const script2 = document.createElement('script');
    script2.src = PDFMAKE_CDN + '/vfs_fonts.js';
    script2.onload = () => console.log('pdfMake listo');
    script2.onerror = () => console.error('No se pudo cargar vfs_fonts.js');
    document.head.appendChild(script2);
  };
  script1.onerror = () => console.error('No se pudo cargar pdfmake.min.js');
  document.head.appendChild(script1);
}

// Inicializar pdfMake al cargar
loadPdfMake();

// Ejecuta `accion` cuando pdfMake (y sus fuentes) estén listos; reintenta hasta ~6s.
function conPdfMake(accion) {
  if (typeof pdfMake !== 'undefined' && pdfMake.vfs) { accion(); return; }
  loadPdfMake();
  let intentos = 0;
  const t = setInterval(() => {
    if (typeof pdfMake !== 'undefined' && pdfMake.vfs) {
      clearInterval(t);
      accion();
    } else if (++intentos > 40) {
      clearInterval(t);
      alert('No se pudo cargar la librería de PDF. Revisa tu conexión a internet e inténtalo de nuevo.');
    }
  }, 150);
}

const PDF_AZUL = '#003A8C';
const PDF_DORADO = '#C49A22';

function pdfHeader(titulo) {
  const ancho = 110;
  return {
    margin: [40, 16, 40, 0],
    columns: [
      typeof LOGO_UDES !== 'undefined'
        ? { image: LOGO_UDES, width: ancho, height: ancho / LOGO_UDES_RATIO }
        : { text: 'Universidad de Santander', bold: true, color: PDF_AZUL },
      { text: titulo, bold: true, fontSize: 10, color: PDF_AZUL, alignment: 'right', margin: [0, 12, 0, 0] }
    ]
  };
}

function linea(y, color, ancho) {
  return { canvas: [{ type: 'line', x1: 0, y1: y, x2: 515, y2: y, lineWidth: ancho || 1, lineColor: color || PDF_AZUL }] };
}

function histogramaCanvas(anios, pe, meta) {
  const W = 515, H = 90, base = H;
  const n = anios.length;
  const slot = W / n, bw = slot * 0.6;
  const vals = anios.map(a => a.valor).filter(v => v != null);
  const max = Math.max(...vals, pe || 0, meta || 0, 1);
  const y = v => base - Math.max((v / max) * (H - 14), 1);
  const c = [{ type: 'line', x1: 0, y1: base, x2: W, y2: base, lineWidth: 1, lineColor: '#C8D3E8' }];
  anios.forEach((a, i) => {
    if (a.valor == null) return;
    c.push({ type: 'rect', x: i * slot + (slot - bw) / 2, y: y(a.valor), w: bw, h: base - y(a.valor), color: PDF_AZUL });
  });
  if (pe) c.push({ type: 'line', x1: 0, y1: y(pe), x2: W, y2: y(pe), lineWidth: 1, dash: { length: 4 }, lineColor: PDF_DORADO });
  if (meta != null && meta > 0) c.push({ type: 'line', x1: 0, y1: y(meta), x2: W, y2: y(meta), lineWidth: 1.2, lineColor: '#1B6B3A' });
  return { canvas: c, margin: [0, 6, 0, 0] };
}

/**
 * Exporta un reporte de meta a PDF
 * @param {Object} programData - Datos del programa (ver extractProgramDataFromUI)
 */
function exportMetaToPDF(programData) {
  if (typeof pdfMake === 'undefined' || !pdfMake.vfs) {
    conPdfMake(() => exportMetaToPDF(programData));
    return;
  }

  const {
    campus = 'N/A', program = 'Programa sin nombre', nivel = '', semester = 'A', year = 2026,
    meta = null, meta26 = null, historico = null, rango = '', anios = [],
    cupo = 0, pe = 0, acreditado = false, cupoAnual = false,
    condicion = 'N/A', demanda = 'N/A', participacion = '0%',
    equivalentes = [], competencia = {}
  } = programData;

  const sinMeta = meta == null;
  const delta = (meta != null && meta26 != null) ? meta - meta26 : null;
  const deltaTxt = delta == null ? null : `${delta > 0 ? '+' : ''}${delta} frente a la meta 2026 (${meta26})`;
  const supera = meta != null && meta > cupo;

  const celdaH = (t) => ({ text: t, bold: true, fillColor: '#f0f0f0', fontSize: 9 });
  const tablaAnios = {
    layout: 'lightHorizontalLines',
    table: {
      headerRows: 1,
      widths: anios.map(() => '*'),
      body: [
        anios.map(a => ({ text: String(a.anio), bold: true, fillColor: '#f0f0f0', fontSize: 9, alignment: 'center' })),
        anios.map(a => ({ text: a.valor != null ? String(a.valor) : '—', alignment: 'center', fontSize: 10 }))
      ]
    }
  };

  const content = [
    { text: program, fontSize: 15, bold: true, color: PDF_AZUL, margin: [0, 0, 0, 2] },
    { text: `${campus}  ·  ${nivel}  ·  Semestre ${semester}  ·  ${acreditado ? 'Programa acreditado' : 'No acreditado'}`, fontSize: 10, color: '#555', margin: [0, 0, 0, 8] },
    linea(0, PDF_AZUL, 2),

    {
      margin: [0, 12, 0, 4],
      columns: [
        { width: '*', stack: [
          { text: `META ${year} · SEM. ${semester}`, fontSize: 9, bold: true, color: '#5D6C90' },
          { text: sinMeta ? 'Sin meta' : String(meta), fontSize: 34, bold: true, color: PDF_AZUL },
          { text: sinMeta ? 'Este semestre no tiene meta calculada.' : 'matriculados de primer curso', fontSize: 10, color: '#555' },
          ...(deltaTxt ? [{ text: deltaTxt, fontSize: 10, bold: true, margin: [0, 4, 0, 0], color: delta > 0 ? '#1B6B3A' : delta < 0 ? '#8B1A1A' : '#555' }] : [])
        ] },
        { width: '55%', stack: [
          { text: [{ text: 'Condición aplicada: ', bold: true }, `${condicion}`], fontSize: 10, margin: [0, 0, 0, 3] },
          { text: obtenerDescripcionCondicion(condicion), fontSize: 10, color: '#444' }
        ] }
      ]
    },
    ...(supera ? [{ text: `Atención: la meta (${meta}) supera el cupo MEN (${cupo}). Verificar con Vicerrectoría.`, fontSize: 10, color: '#7A4A00', background: '#FEF3E2', margin: [0, 6, 0, 0] }] : []),
    ...(cupoAnual ? [{ text: 'Cupo fijo anual por resolución MEN.', fontSize: 10, color: '#555', margin: [0, 6, 0, 0] }] : []),

    { text: 'Indicadores', style: 'sectionTitle' },
    {
      layout: 'lightHorizontalLines',
      table: {
        headerRows: 1,
        widths: ['*', '*', '*', '*'],
        body: [
          [celdaH(`Promedio histórico (${rango})`), celdaH('Cupo MEN'), celdaH('Punto de equilibrio'), celdaH('Meta')],
          [historico != null ? String(historico) : '—', String(cupo), String(pe), sinMeta ? '—' : String(meta)]
        ]
      }
    },

    { text: `Histórico de matriculados · Sem. ${semester} · ${rango}`, style: 'sectionTitle' },
    tablaAnios,
    histogramaCanvas(anios, pe, meta),
    { text: [
        { text: 'Matriculados UDES', color: PDF_AZUL, bold: true }, '   ·   ',
        { text: `Punto de equilibrio (${pe}), línea punteada`, color: PDF_DORADO, bold: true },
        ...(sinMeta ? [] : ['   ·   ', { text: `Meta (${meta}), línea verde`, color: '#1B6B3A', bold: true }])
      ], fontSize: 8.5, margin: [0, 4, 0, 0] },

    { text: 'Análisis de mercado · área metropolitana', style: 'sectionTitle' },
    {
      layout: 'lightHorizontalLines',
      table: {
        headerRows: 1,
        widths: ['*', '*', '*'],
        body: [
          [
            { text: 'UDES', bold: true, fillColor: PDF_AZUL, color: '#fff' },
            { text: 'IES privadas', bold: true, fillColor: '#5D6C90', color: '#fff' },
            { text: 'IES públicas (referencia)', bold: true, fillColor: '#5D6C90', color: '#fff' }
          ],
          [
            `Cuota de mercado: ${participacion}\nPromedio: ${historico != null ? historico : '—'}`,
            competencia.nIes ? `${competencia.nIes} IES · total ${competencia.total}\nPromedio por IES: ${competencia.avg}` : 'Sin competidores privados registrados',
            competencia.nPub ? `${competencia.nPub} IES · total ${competencia.pub != null ? competencia.pub : '—'}` : 'Sin datos'
          ]
        ]
      }
    },
    { text: demanda, fontSize: 10, margin: [0, 6, 0, 0] },
    ...(equivalentes.length ? [{ text: [{ text: 'También considerados en la demanda: ', bold: true }, equivalentes.join(' · ')], fontSize: 9, color: '#555', margin: [0, 4, 0, 0] }] : []),

    { text: 'Marco metodológico', style: 'sectionTitle' },
    {
      text: [
        { text: `Condición ${condicion}. `, bold: true },
        obtenerDescripcionCondicion(condicion)
      ],
      fontSize: 10, margin: [0, 0, 0, 6]
    },
    {
      text: `El promedio histórico es la media simple de los períodos con matrícula válida de este semestre (${rango}); se excluyen períodos sin datos, en cero y los marcados como atípicos. Cuando una meta calculada queda por debajo del piso interno de Mercadeo, se eleva a ese piso. La competencia proviene de SNIES 2021–2025 para IES del área metropolitana; solo las IES privadas determinan la condición.` +
        (year === 2027 ? ' La matrícula 2026 de otras IES aún no está publicada por SNIES, por lo que el análisis de competencia de la meta 2027 usa los datos SNIES 2021–2025.' : ''),
      fontSize: 9, color: '#666', italics: true
    }
  ];

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 70, 40, 40],
    header: pdfHeader(`REPORTE DE META DE MATRICULADOS · UDES ${year}`),
    footer: (currentPage, pageCount) => ({
      text: `Página ${currentPage} de ${pageCount}  ·  Generado ${new Date().toLocaleDateString('es-CO')}`,
      alignment: 'center', fontSize: 9, color: '#999'
    }),
    content,
    styles: {
      sectionTitle: { fontSize: 12, bold: true, color: PDF_AZUL, margin: [0, 16, 0, 6] }
    },
    defaultStyle: { fontSize: 11 }
  };

  const filename = `meta_${program.replace(/\s+/g, '_')}_${campus}_${semester}_${year}.pdf`;
  pdfMake.createPdf(docDefinition).download(filename);
}

/**
 * Descripción de la condición: una sola fuente de verdad (CM en app.js)
 */
function obtenerDescripcionCondicion(cond) {
  const c = (typeof CM !== 'undefined') ? CM[cond] : null;
  if (!c) return 'Condición no identificada';
  return `${c.t}. ${c.txt}`;
}
