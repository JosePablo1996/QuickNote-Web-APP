// src/utils/compression.ts
import LZString from 'lz-string';

/**
 * Comprime una cadena de texto usando CompressionStream API (GZIP)
 * o fallback con LZString para navegadores antiguos
 */

// Detectar soporte de CompressionStream
const supportsCompressionStream = (): boolean => {
  return 'CompressionStream' in window && 'DecompressionStream' in window;
};

/**
 * Comprimir datos usando CompressionStream (GZIP - moderno)
 * Ofrece mejor ratio de compresión que LZString
 */
async function compressWithGzip(data: string): Promise<string> {
  const blob = new Blob([data], { type: 'application/json' });
  const compressedStream = blob.stream().pipeThrough(
    new CompressionStream('gzip')
  );
  const compressedBlob = await new Response(compressedStream).blob();
  
  // Convertir a base64 para almacenar en JSON
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(compressedBlob);
  });
}

/**
 * Descomprimir datos usando DecompressionStream (GZIP - moderno)
 */
async function decompressWithGzip(compressedBase64: string): Promise<string> {
  // Convertir base64 a blob
  const binaryString = atob(compressedBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: 'application/gzip' });
  
  // Descomprimir
  const decompressedStream = blob.stream().pipeThrough(
    new DecompressionStream('gzip')
  );
  const decompressedBlob = await new Response(decompressedStream).blob();
  return await decompressedBlob.text();
}

/**
 * Comprimir usando LZString (compatible con navegadores antiguos)
 * Ratio de compresión menor que GZIP pero más compatible
 */
function compressWithLZString(data: string): string {
  return LZString.compressToBase64(data);
}

/**
 * Descomprimir usando LZString
 */
function decompressWithLZString(compressed: string): string {
  const decompressed = LZString.decompressFromBase64(compressed);
  if (!decompressed) {
    throw new Error('Error al descomprimir datos con LZString');
  }
  return decompressed;
}

/**
 * Comprimir datos (usa el mejor método disponible)
 * 
 * @param data - Datos a comprimir (objeto o array)
 * @returns Objeto con datos comprimidos y estadísticas
 * 
 * @example
 * const result = await compressData({ notes: myNotes });
 * console.log(`Comprimido: ${result.compressedSize} bytes (${result.method})`);
 */
export async function compressData<T>(data: T): Promise<{
  compressed: string;
  originalSize: number;
  compressedSize: number;
  method: 'gzip' | 'lzstring';
  ratio: string;
}> {
  const jsonString = JSON.stringify(data);
  const originalSize = jsonString.length;
  const originalSizeKB = (originalSize / 1024).toFixed(2);
  
  console.log(`📦 [Compresión] Original: ${originalSizeKB} KB (${originalSize.toLocaleString()} bytes)`);
  
  let compressed: string;
  let method: 'gzip' | 'lzstring';
  let compressedSize: number;
  
  // Intentar usar GZIP si está disponible (mejor compresión)
  if (supportsCompressionStream()) {
    try {
      compressed = await compressWithGzip(jsonString);
      method = 'gzip';
      compressedSize = compressed.length;
      const compressedSizeKB = (compressedSize / 1024).toFixed(2);
      const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
      console.log(`📦 [Compresión] GZIP: ${compressedSizeKB} KB (${ratio}% reducción)`);
    } catch (error) {
      // Fallback a LZString si GZIP falla
      console.warn('⚠️ [Compresión] GZIP falló, usando LZString como fallback');
      compressed = compressWithLZString(jsonString);
      method = 'lzstring';
      compressedSize = compressed.length;
      const compressedSizeKB = (compressedSize / 1024).toFixed(2);
      const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
      console.log(`📦 [Compresión] LZString: ${compressedSizeKB} KB (${ratio}% reducción)`);
    }
  } else {
    // Usar LZString como método principal
    compressed = compressWithLZString(jsonString);
    method = 'lzstring';
    compressedSize = compressed.length;
    const compressedSizeKB = (compressedSize / 1024).toFixed(2);
    const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
    console.log(`📦 [Compresión] LZString: ${compressedSizeKB} KB (${ratio}% reducción)`);
  }
  
  const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
  
  return {
    compressed,
    originalSize,
    compressedSize,
    method,
    ratio: `${ratio}%`
  };
}

/**
 * Descomprimir datos automáticamente según el método usado
 * 
 * @param compressed - Datos comprimidos en base64
 * @param method - Método de compresión usado ('gzip' o 'lzstring')
 * @returns Datos descomprimidos como objeto
 * 
 * @example
 * const data = await decompressData(compressedString, 'gzip');
 */
export async function decompressData<T>(
  compressed: string,
  method: 'gzip' | 'lzstring'
): Promise<T> {
  let jsonString: string;
  
  console.log(`🗜️ [Descompresión] Usando método: ${method}`);
  
  if (method === 'gzip') {
    if (!supportsCompressionStream()) {
      throw new Error('GZIP no soportado en este navegador');
    }
    jsonString = await decompressWithGzip(compressed);
  } else {
    jsonString = decompressWithLZString(compressed);
  }
  
  const result = JSON.parse(jsonString);
  const sizeKB = (jsonString.length / 1024).toFixed(2);
  console.log(`🗜️ [Descompresión] Completada: ${sizeKB} KB`);
  
  return result;
}

/**
 * Verificar si los datos están comprimidos (detectar por estructura)
 * 
 * @param obj - Objeto a verificar
 * @returns true si los datos están comprimidos
 */
export function isCompressedData(obj: any): boolean {
  return obj && typeof obj === 'object' && 
         (obj.__compressed__ === true || 
          (obj.data && typeof obj.data === 'string' && obj.method));
}

/**
 * Calcular ratio de compresión como texto
 * 
 * @param originalSize - Tamaño original en bytes
 * @param compressedSize - Tamaño comprimido en bytes
 * @returns Ratio como string (ej: "65.5%")
 */
export function getCompressionRatio(originalSize: number, compressedSize: number): string {
  if (originalSize === 0) return '0%';
  const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
  return `${ratio}%`;
}

/**
 * Calcular ahorro en términos legibles
 * 
 * @param originalSize - Tamaño original en bytes
 * @param compressedSize - Tamaño comprimido en bytes
 * @returns Texto descriptivo del ahorro
 */
export function getCompressionSavings(originalSize: number, compressedSize: number): string {
  const savings = originalSize - compressedSize;
  const savingsKB = (savings / 1024).toFixed(1);
  const ratio = getCompressionRatio(originalSize, compressedSize);
  
  if (savings < 1024) {
    return `${savings} bytes (${ratio})`;
  }
  return `${savingsKB} KB (${ratio})`;
}

/**
 * Formatear tamaño de datos para mostrar
 * 
 * @param bytes - Tamaño en bytes
 * @returns String formateado (B, KB, MB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Estimar tamaño de datos comprimidos sin comprimir realmente
 * Útil para mostrar estadísticas estimadas
 * 
 * @param originalSize - Tamaño original en bytes
 * @returns Tamaño estimado comprimido
 */
export function estimateCompressedSize(originalSize: number): number {
  // Estimación conservadora: 70% de reducción para textos
  return Math.floor(originalSize * 0.3);
}

// Objeto de utilidades para exportación conveniente
const compressionUtils = {
  compress: compressData,
  decompress: decompressData,
  isCompressed: isCompressedData,
  getRatio: getCompressionRatio,
  getSavings: getCompressionSavings,
  formatBytes,
  estimateSize: estimateCompressedSize
};

export default compressionUtils;