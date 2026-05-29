/**
 * Módulo de exportación a PDF
 * Utiliza pdfmake para generar reportes de metas de matriculados
 */

// Cargar pdfmake desde CDN
function loadPdfMake() {
  if (typeof pdfMake === 'undefined') {
    const script1 = document.createElement('script');
    script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.5.0/pdfmake.min.js';
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.5.0/vfs_fonts.js';
    script2.onload = () => console.log('pdfMake cargado');
    document.head.appendChild(script2);
  }
}

// Inicializar pdfMake al cargar
loadPdfMake();

/**
 * Exporta un reporte de meta a PDF
 * @param {Object} programData - Datos del programa (nombre, campus, meta, etc.)
 */
function exportMetaToPDF(programData) {
  if (typeof pdfMake === 'undefined') {
    alert('PDF library is loading. Please try again in a moment.');
    return;
  }

  const {
    campus = 'N/A',
    program = 'Programa sin nombre',
    semester = 'A',
    year = 2025,
    meta = 0,
    historico = 0,
    cupo = 0,
    pe = 0,
    condicion = 'N/A',
    demanda = 'N/A',
    participacion = '0%',
    competencia = {},
    histogram = []
  } = programData;

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40],
    header: {
      text: 'REPORTE DE META DE MATRICULADOS - UDES 2026',
      style: 'header'
    },
    footer: (currentPage, pageCount) => ({
      text: `Página ${currentPage} de ${pageCount}`,
      alignment: 'center',
      fontSize: 9,
      color: '#999'
    }),
    content: [
      // Información general
      {
        text: 'Información General',
        style: 'sectionTitle',
        margin: [0, 10, 0, 10]
      },
      {
        columns: [
          {
            width: '50%',
            text: [
              { text: 'Campus: ', bold: true },
              campus + '\n',
              { text: 'Programa: ', bold: true },
              program + '\n',
              { text: 'Semestre: ', bold: true },
              'Sem. ' + semester + '\n',
              { text: 'Año de corte: ', bold: true },
              year.toString()
            ]
          },
          {
            width: '50%',
            text: [
              { text: 'Meta propuesta: ', bold: true },
              meta.toString() + ' estudiantes\n',
              { text: 'Condición: ', bold: true },
              condicion + '\n',
              { text: 'Demanda: ', bold: true },
              demanda
            ]
          }
        ],
        margin: [0, 0, 0, 15]
      },

      // Indicadores
      {
        text: 'Indicadores',
        style: 'sectionTitle',
        margin: [0, 15, 0, 10]
      },
      {
        layout: 'lightHorizontalLines',
        table: {
          headerRows: 1,
          widths: ['25%', '25%', '25%', '25%'],
          body: [
            [
              { text: 'Histórico', bold: true, fillColor: '#f0f0f0' },
              { text: 'Meta', bold: true, fillColor: '#f0f0f0' },
              { text: 'Cupo MEN', bold: true, fillColor: '#f0f0f0' },
              { text: 'Punto de Eq.', bold: true, fillColor: '#f0f0f0' }
            ],
            [
              historico.toString(),
              meta.toString(),
              cupo.toString(),
              pe.toString()
            ]
          ]
        },
        margin: [0, 0, 0, 15]
      },

      // Análisis de mercado
      {
        text: 'Análisis de Mercado',
        style: 'sectionTitle',
        margin: [0, 15, 0, 10]
      },
      {
        layout: 'lightHorizontalLines',
        table: {
          headerRows: 1,
          widths: ['50%', '50%'],
          body: [
            [
              { text: 'UDES', bold: true, fillColor: '#003A8C', color: '#fff' },
              { text: 'Competencia Privada', bold: true, fillColor: '#999', color: '#fff' }
            ],
            [
              `Participación: ${participacion}\nPromedio: ${historico}`,
              `Total: ${competencia.total || 0}\nPromedio: ${competencia.avg || 0}`
            ]
          ]
        },
        margin: [0, 0, 0, 15]
      },

      // Marco metodológico
      {
        text: 'Marco Metodológico',
        style: 'sectionTitle',
        margin: [0, 15, 0, 10]
      },
      {
        text: [
          { text: 'Condición ', bold: true },
          condicion,
          { text: ' — ', bold: false },
          obtenerDescripcionCondicion(condicion)
        ],
        margin: [0, 0, 0, 10],
        fontSize: 11
      },
      {
        text: 'Nota: Esta herramienta aplica promedio adaptativo con 5 reglas que priorizan tendencias recientes sostenidas. La demanda se analiza comparando con IES privadas competidoras en el mismo municipio usando datos SNIES 2021-2024.',
        fontSize: 10,
        color: '#666',
        italics: true,
        margin: [0, 10, 0, 0]
      }
    ],
    styles: {
      header: {
        fontSize: 16,
        bold: true,
        color: '#003A8C',
        margin: [0, 0, 0, 20],
        alignment: 'center'
      },
      sectionTitle: {
        fontSize: 13,
        bold: true,
        color: '#003A8C',
        borderBottom: { size: 2, color: '#003A8C' }
      }
    },
    defaultStyle: {
      font: 'Helvetica',
      fontSize: 11
    }
  };

  // Generar y descargar PDF
  const filename = `meta_${program.replace(/\s+/g, '_')}_${campus}_${semester}_${year}.pdf`;
  pdfMake.createPdf(docDefinition).download(filename);
}

/**
 * Obtiene descripción de la condición
 */
function obtenerDescripcionCondicion(cond) {
  const descripciones = {
    'C1': 'Histórico ≈ Cupo MEN (±2): Meta = Cupo × 1.10 · Acreditados: × 1.05',
    'C2': 'Histórico ≈ PE + competencia supera UDES: Meta = min(PE × 1.35, Cupo)',
    'C3': 'Histórico < PE + competencia supera UDES: Meta = PE × 1.10',
    'C4': 'Histórico < PE + UDES lidera: Meta = Histórico × 1.10',
    'C5': 'Histórico > PE + UDES lidera: Meta = promedio adaptativo'
  };
  return descripciones[cond] || 'Condición no identificada';
}

/**
 * Exporta un resumen consolidado de múltiples programas
 */
function exportReporteProgramas(programas, campus) {
  if (typeof pdfMake === 'undefined') {
    alert('PDF library is loading. Please try again in a moment.');
    return;
  }

  const rows = [[
    { text: 'Programa', bold: true, fillColor: '#003A8C', color: '#fff' },
    { text: 'Histórico', bold: true, fillColor: '#003A8C', color: '#fff' },
    { text: 'Meta', bold: true, fillColor: '#003A8C', color: '#fff' },
    { text: 'Condición', bold: true, fillColor: '#003A8C', color: '#fff' }
  ]];

  programas.forEach(prog => {
    rows.push([
      prog.program || 'N/A',
      (prog.historico || 0).toString(),
      (prog.meta || 0).toString(),
      prog.condicion || 'N/A'
    ]);
  });

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40],
    header: {
      text: `REPORTE DE METAS - CAMPUS ${campus.toUpperCase()} 2026`,
      style: 'header'
    },
    footer: (currentPage, pageCount) => ({
      text: `Página ${currentPage} de ${pageCount}`,
      alignment: 'center',
      fontSize: 9,
      color: '#999'
    }),
    content: [
      {
        text: `Total de programas: ${programas.length}`,
        margin: [0, 0, 0, 15],
        fontSize: 12
      },
      {
        layout: 'lightHorizontalLines',
        table: {
          headerRows: 1,
          widths: ['50%', '15%', '15%', '20%'],
          body: rows
        }
      }
    ],
    styles: {
      header: {
        fontSize: 14,
        bold: true,
        color: '#003A8C',
        margin: [0, 0, 0, 20],
        alignment: 'center'
      }
    },
    defaultStyle: {
      font: 'Helvetica',
      fontSize: 10
    }
  };

  const filename = `reporte_metas_${campus}_${new Date().getFullYear()}.pdf`;
  pdfMake.createPdf(docDefinition).download(filename);
}
