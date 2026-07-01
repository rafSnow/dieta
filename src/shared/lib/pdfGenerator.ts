import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export function exportarListaComprasPDF(itensCompilados: any[]) {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Lista de Compras - NutriFlow', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerada em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);

  // Organizar os itens por categoria para exibição
  const categorias = new Set(itensCompilados.map(i => i.alimento.categoria));
  const tableData: any[] = [];
  
  categorias.forEach(cat => {
    // Adicionar um header de categoria
    tableData.push([{ content: cat, colSpan: 3, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }]);
    
    const itensCat = itensCompilados.filter(i => i.alimento.categoria === cat);
    itensCat.forEach(i => {
      tableData.push([
        '', // Espaço para Checkbox
        i.alimento.nome,
        `${i.quantidade.toFixed(1)} ${i.alimento.unidadePadrao === 'unidade' ? 'un' : i.alimento.unidadePadrao}`
      ]);
    });
  });

  autoTable(doc, {
    startY: 35,
    head: [['[ ]', 'Alimento', 'Quantidade Necessária']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 40, halign: 'right' }
    }
  });

  doc.save(`Lista_Compras_NutriFlow_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export function exportarPlanejamentoPDF(diasPlanejados: any[]) {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Planejamento Semanal - NutriFlow', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);

  let startY = 40;

  diasPlanejados.forEach((dia, index) => {
    if (startY > 250 && index > 0) {
      doc.addPage();
      startY = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text(`Dia: ${dia.diaNome} (${dia.dataDisplay})`, 14, startY);
    startY += 5;

    const tableData: any[] = [];

    dia.refeicoes.forEach((ref: any) => {
      tableData.push([{ content: ref.tipoRefeicao, colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }]);
      
      if (ref.itens && ref.itens.length > 0) {
        ref.itens.forEach((item: any) => {
          tableData.push([
            item.alimento ? item.alimento.nome : item.receita ? item.receita.nome : 'Desconhecido',
            `${item.quantidade} ${item.alimento ? (item.alimento.unidadePadrao === 'unidade' ? 'un' : item.alimento.unidadePadrao) : 'porções'}`
          ]);
        });
      } else {
        tableData.push([{ content: 'Sem itens cadastrados', colSpan: 2, styles: { fontStyle: 'italic', textColor: [150, 150, 150] } }]);
      }
    });

    autoTable(doc, {
      startY: startY,
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 40, halign: 'right' }
      },
      didDrawPage: (data) => {
        startY = (data.cursor?.y || startY) + 10;
      }
    });
  });

  doc.save(`Planejamento_NutriFlow_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
