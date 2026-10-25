// Corta a foto no centro (quadrado) e reduz para 480 px antes do envio: fica leve (dezenas de KB)
// e cabe no limite do servidor. Roda só no navegador.
const LADO = 480;
const LIMITE_BYTES = 300 * 1024;

const bytesDoDataUrl = (dataUrl: string) => Math.ceil(((dataUrl.length - dataUrl.indexOf(",") - 1) * 3) / 4);

export async function reduzirFoto(arquivo: File) {
  const bitmap = await createImageBitmap(arquivo);
  const lado = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = LADO;
  canvas.height = LADO;
  const contexto = canvas.getContext("2d");
  if (!contexto) throw new Error("sem_canvas");
  // Fundo branco para PNG com transparência que acabar virando JPEG.
  contexto.fillStyle = "#fff";
  contexto.fillRect(0, 0, LADO, LADO);
  contexto.drawImage(bitmap, (bitmap.width - lado) / 2, (bitmap.height - lado) / 2, lado, lado, 0, 0, LADO, LADO);
  bitmap.close();

  // WebP quando o navegador sabe gerar (o Safari antigo devolve PNG); senão, JPEG.
  for (const qualidade of [0.85, 0.7, 0.5]) {
    let dataUrl = canvas.toDataURL("image/webp", qualidade);
    if (!dataUrl.startsWith("data:image/webp")) dataUrl = canvas.toDataURL("image/jpeg", qualidade);
    if (bytesDoDataUrl(dataUrl) <= LIMITE_BYTES) return dataUrl;
  }
  throw new Error("foto_grande");
}
