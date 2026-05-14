// src/services/exportService.ts
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Note } from '../models/Note';

// ============================================
// TIPOS E INTERFACES
// ============================================

export type ExportFormat = 'pdf' | 'markdown' | 'json';
export type ExportScope = 'single' | 'selected' | 'all';
export type PaperSize = 'A4' | 'Letter' | 'Legal';

export interface ExportOptions {
  format: ExportFormat;
  scope: ExportScope;
  includeMetadata?: boolean;
  includeTags?: boolean;
  includeDates?: boolean;
  paperSize?: PaperSize;
  orientation?: 'portrait' | 'landscape';
  filename?: string;
}

export interface ExportResult {
  success: boolean;
  message: string;
  filename?: string;
  size?: number;
  error?: string;
}

// ============================================
// UTILIDADES
// ============================================

const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const sanitizeFilename = (name: string): string => {
  return name
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 50);
};

// ============================================
// EXPORTACIÓN A MARKDOWN
// ============================================

export const exportToMarkdown = (notes: Note[], options: ExportOptions): ExportResult => {
  try {
    let markdown = '';
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Header del documento
    markdown += `# QuickNote - Exportación de Notas\n\n`;
    markdown += `> Exportado el: ${formatDate(new Date())}\n`;
    markdown += `> Total de notas: ${notes.length}\n\n`;
    markdown += `---\n\n`;
    
    // Notas individuales
    notes.forEach((note, index) => {
      // Título
      markdown += `## ${index + 1}. ${note.title || 'Sin título'}\n\n`;
      
      // Metadatos (si está habilitado)
      if (options.includeMetadata) {
        markdown += `**📅 Creada:** ${formatDate(note.created_at)}\n`;
        markdown += `**✏️ Actualizada:** ${formatDate(note.updated_at)}\n`;
        if (note.is_favorite) markdown += `**⭐ Favorita**\n`;
        if (note.is_archived) markdown += `**📦 Archivada**\n`;
      }
      
      // Etiquetas (si está habilitado)
      if (options.includeTags && note.tags && note.tags.length > 0) {
        markdown += `**🏷️ Etiquetas:** ${note.tags.map(t => `\`#${t}\``).join(', ')}\n`;
      }
      
      markdown += `\n`;
      
      // Contenido
      if (note.content) {
        markdown += `${note.content}\n\n`;
      } else {
        markdown += `*Sin contenido*\n\n`;
      }
      
      markdown += `---\n\n`;
    });
    
    // Footer
    markdown += `\n*Exportado con QuickNote - Gestión de notas moderna*`;
    
    const filename = options.filename || `quicknote_export_${timestamp}.md`;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    saveAs(blob, filename);
    
    return {
      success: true,
      message: `${notes.length} nota(s) exportadas a Markdown`,
      filename,
      size: blob.size
    };
  } catch (error: any) {
    console.error('Error exportando a Markdown:', error);
    return {
      success: false,
      message: 'Error al exportar a Markdown',
      error: error.message
    };
  }
};

// ============================================
// EXPORTACIÓN A JSON
// ============================================

export const exportToJSON = (notes: Note[], options: ExportOptions): ExportResult => {
  try {
    const timestamp = new Date().toISOString().split('T')[0];
    
    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      app: 'QuickNote',
      totalNotes: notes.length,
      notes: notes.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content,
        color: note.color,
        is_favorite: note.is_favorite,
        is_archived: note.is_archived,
        tags: note.tags,
        created_at: note.created_at,
        updated_at: note.updated_at,
        deleted_at: note.deleted_at
      }))
    };
    
    const filename = options.filename || `quicknote_backup_${timestamp}.json`;
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    saveAs(blob, filename);
    
    return {
      success: true,
      message: `${notes.length} nota(s) exportadas a JSON`,
      filename,
      size: blob.size
    };
  } catch (error: any) {
    console.error('Error exportando a JSON:', error);
    return {
      success: false,
      message: 'Error al exportar a JSON',
      error: error.message
    };
  }
};

// ============================================
// EXPORTACIÓN A PDF (INDIVIDUAL)
// ============================================

export const exportSingleNoteToPDF = async (
  note: Note,
  elementId?: string
): Promise<ExportResult> => {
  try {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = sanitizeFilename(note.title || 'nota') + `_${timestamp}.pdf`;
    
    // Si tenemos un elemento DOM para capturar
    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        const canvas = await html2canvas(element, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(filename);
        
        return {
          success: true,
          message: `Nota "${note.title}" exportada a PDF`,
          filename
        };
      }
    }
    
    // Fallback: generar PDF desde datos
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    let yPos = 20;
    const lineHeight = 7;
    const margin = 20;
    const maxWidth = 170;
    
    // Título
    pdf.setFontSize(20);
    pdf.setTextColor(59, 130, 246);
    const title = note.title || 'Sin título';
    const titleLines = pdf.splitTextToSize(title, maxWidth);
    pdf.text(titleLines, margin, yPos);
    yPos += titleLines.length * lineHeight + 5;
    
    // Metadatos
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Creada: ${formatDate(note.created_at)}`, margin, yPos);
    yPos += lineHeight;
    pdf.text(`Actualizada: ${formatDate(note.updated_at)}`, margin, yPos);
    yPos += lineHeight;
    
    if (note.is_favorite) {
      pdf.text('⭐ Favorita', margin, yPos);
      yPos += lineHeight;
    }
    
    // Etiquetas
    if (note.tags && note.tags.length > 0) {
      pdf.text(`Etiquetas: ${note.tags.join(', ')}`, margin, yPos);
      yPos += lineHeight;
    }
    
    yPos += 5;
    
    // Línea separadora
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPos, margin + maxWidth, yPos);
    yPos += 5;
    
    // Contenido
    if (note.content) {
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      const contentLines = pdf.splitTextToSize(note.content, maxWidth);
      pdf.text(contentLines, margin, yPos);
    } else {
      pdf.setFontSize(12);
      pdf.setTextColor(150, 150, 150);
      pdf.text('Sin contenido', margin, yPos);
    }
    
    // Footer
    const pageCount = pdf.getNumberOfPages();
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.text(
        `QuickNote - ${new Date().toLocaleDateString()}`,
        margin,
        pdf.internal.pageSize.getHeight() - 10
      );
    }
    
    pdf.save(filename);
    
    return {
      success: true,
      message: `Nota "${note.title}" exportada a PDF`,
      filename
    };
  } catch (error: any) {
    console.error('Error exportando a PDF:', error);
    return {
      success: false,
      message: 'Error al exportar a PDF',
      error: error.message
    };
  }
};

// ============================================
// EXPORTACIÓN MÚLTIPLE A PDF
// ============================================

export const exportMultipleToPDF = async (notes: Note[]): Promise<ExportResult> => {
  try {
    const timestamp = new Date().toISOString().split('T')[0];
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const margin = 20;
    const maxWidth = 170;
    let yPos = 20;
    
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      
      if (i > 0) {
        pdf.addPage();
        yPos = 20;
      }
      
      // Título
      pdf.setFontSize(20);
      pdf.setTextColor(59, 130, 246);
      const title = note.title || 'Sin título';
      const titleLines = pdf.splitTextToSize(title, maxWidth);
      pdf.text(titleLines, margin, yPos);
      yPos += titleLines.length * 7 + 5;
      
      // Metadatos
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Creada: ${formatDate(note.created_at)}`, margin, yPos);
      yPos += 6;
      pdf.text(`Actualizada: ${formatDate(note.updated_at)}`, margin, yPos);
      yPos += 6;
      
      if (note.is_favorite) {
        pdf.text('⭐ Favorita', margin, yPos);
        yPos += 6;
      }
      
      if (note.tags && note.tags.length > 0) {
        pdf.text(`Etiquetas: ${note.tags.join(', ')}`, margin, yPos);
        yPos += 6;
      }
      
      yPos += 5;
      
      // Separador
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPos, margin + maxWidth, yPos);
      yPos += 5;
      
      // Contenido
      if (note.content) {
        pdf.setFontSize(11);
        pdf.setTextColor(0, 0, 0);
        const contentLines = pdf.splitTextToSize(note.content, maxWidth);
        
        // Verificar si cabe en la página
        const remainingSpace = pdf.internal.pageSize.getHeight() - yPos - 15;
        if (contentLines.length * 5 > remainingSpace) {
          // Dividir contenido entre páginas
          let lineIndex = 0;
          while (lineIndex < contentLines.length) {
            const linesForPage = Math.min(
              contentLines.length - lineIndex,
              Math.floor(remainingSpace / 5)
            );
            pdf.text(contentLines.slice(lineIndex, lineIndex + linesForPage), margin, yPos);
            lineIndex += linesForPage;
            
            if (lineIndex < contentLines.length) {
              pdf.addPage();
              yPos = 20;
              pdf.setFontSize(11);
              pdf.setTextColor(0, 0, 0);
            }
          }
          yPos += contentLines.length * 5;
        } else {
          pdf.text(contentLines, margin, yPos);
          yPos += contentLines.length * 5;
        }
      } else {
        pdf.setFontSize(11);
        pdf.setTextColor(150, 150, 150);
        pdf.text('Sin contenido', margin, yPos);
        yPos += 10;
      }
      
      yPos += 10;
    }
    
    // Footer para todas las páginas
    const pageCount = pdf.getNumberOfPages();
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.text(
        `QuickNote - Exportado el ${new Date().toLocaleDateString()}`,
        margin,
        pdf.internal.pageSize.getHeight() - 10
      );
    }
    
    const filename = `quicknote_export_${timestamp}.pdf`;
    pdf.save(filename);
    
    return {
      success: true,
      message: `${notes.length} nota(s) exportadas a PDF`,
      filename
    };
  } catch (error: any) {
    console.error('Error exportando múltiples notas a PDF:', error);
    return {
      success: false,
      message: 'Error al exportar a PDF',
      error: error.message
    };
  }
};

// ============================================
// EXPORTACIÓN A ZIP (MÚLTIPLES FORMATOS)
// ============================================

export const exportToZip = async (
  notes: Note[],
  format: ExportFormat,
  options: ExportOptions
): Promise<ExportResult> => {
  try {
    const zip = new JSZip();
    const timestamp = new Date().toISOString().split('T')[0];
    const folderName = `quicknote_export_${timestamp}`;
    const folder = zip.folder(folderName);
    
    if (!folder) {
      throw new Error('No se pudo crear la carpeta ZIP');
    }
    
    // Agregar archivo README
    const readme = `# QuickNote Export
      
Exportado el: ${new Date().toLocaleString()}
Total de notas: ${notes.length}
Formato: ${format.toUpperCase()}

## Notas incluidas:
${notes.map((n, i) => `${i + 1}. ${n.title || 'Sin título'}`).join('\n')}

---
Exportado con QuickNote - Gestión de notas moderna
`;
    folder.file('README.md', readme);
    
    // Exportar cada nota según el formato
    for (const note of notes) {
      const filename = sanitizeFilename(note.title || 'nota');
      
      if (format === 'markdown') {
        let markdown = `# ${note.title || 'Sin título'}\n\n`;
        
        if (options.includeMetadata) {
          markdown += `**Creada:** ${formatDate(note.created_at)}\n`;
          markdown += `**Actualizada:** ${formatDate(note.updated_at)}\n`;
          if (note.is_favorite) markdown += `**Favorita**\n`;
        }
        
        if (options.includeTags && note.tags && note.tags.length > 0) {
          markdown += `**Etiquetas:** ${note.tags.map(t => `#${t}`).join(', ')}\n`;
        }
        
        markdown += `\n---\n\n`;
        markdown += note.content || '*Sin contenido*';
        markdown += `\n\n---\n*Exportado con QuickNote*`;
        
        folder.file(`${filename}.md`, markdown);
      } else if (format === 'json') {
        folder.file(`${filename}.json`, JSON.stringify(note, null, 2));
      }
    }
    
    // Generar y descargar ZIP
    const content = await zip.generateAsync({ type: 'blob' });
    const filename = `quicknote_export_${timestamp}.zip`;
    saveAs(content, filename);
    
    return {
      success: true,
      message: `${notes.length} nota(s) exportadas a ZIP (${format.toUpperCase()})`,
      filename,
      size: content.size
    };
  } catch (error: any) {
    console.error('Error exportando a ZIP:', error);
    return {
      success: false,
      message: 'Error al exportar a ZIP',
      error: error.message
    };
  }
};

// ============================================
// FUNCIÓN PRINCIPAL DE EXPORTACIÓN
// ============================================

export const exportNotes = async (
  notes: Note[],
  options: ExportOptions
): Promise<ExportResult> => {
  if (!notes || notes.length === 0) {
    return {
      success: false,
      message: 'No hay notas para exportar'
    };
  }
  
  console.log(`📤 Exportando ${notes.length} nota(s) a ${options.format.toUpperCase()}`);
  
  try {
    switch (options.format) {
      case 'markdown':
        return exportToMarkdown(notes, options);
      
      case 'json':
        return exportToJSON(notes, options);
      
      case 'pdf':
        if (notes.length === 1) {
          return await exportSingleNoteToPDF(notes[0]);
        } else {
          return await exportMultipleToPDF(notes);
        }
      
      default:
        return {
          success: false,
          message: `Formato no soportado: ${options.format}`
        };
    }
  } catch (error: any) {
    console.error('Error en exportación:', error);
    return {
      success: false,
      message: 'Error durante la exportación',
      error: error.message
    };
  }
};

// ============================================
// FUNCIÓN PARA COMPARTIR NOTA (Web Share API)
// ============================================

export const shareNote = async (note: Note): Promise<boolean> => {
  if (!navigator.share) {
    console.warn('Web Share API no soportada');
    return false;
  }
  
  try {
    await navigator.share({
      title: note.title || 'Nota de QuickNote',
      text: note.content?.substring(0, 500) || '',
      url: window.location.href
    });
    return true;
  } catch (error) {
    console.error('Error compartiendo:', error);
    return false;
  }
};

// ============================================
// EXPORTACIÓN POR DEFECTO
// ============================================

export default {
  exportToMarkdown,
  exportToJSON,
  exportSingleNoteToPDF,
  exportMultipleToPDF,
  exportToZip,
  exportNotes,
  shareNote
};