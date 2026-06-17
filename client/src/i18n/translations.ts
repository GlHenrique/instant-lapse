const pt = {
  tagline: "suas imagens em timelapse em instantes",
  clearAll: "Limpar tudo",
  language: "Idioma",
  toggleTheme: "Alternar tema",

  heroTitleA: "Transforme uma sequência de fotos",
  heroTitleB: "em vídeo",
  heroSubtitle:
    "Suba suas imagens, ajuste o tempo de cada quadro, reordene como quiser e baixe um MP4 pronto para publicar.",

  processing: "Processando imagens…",
  loadError: "Não foi possível ler alguma imagem. Tente novamente.",
  unexpectedError: "Erro inesperado.",
  limitReached: "Limite de {max} imagens. {n} não foram adicionadas.",
  tooLargeSkipped: "{n} imagem(ns) acima de {mb} MB foram ignoradas.",

  livePreview: "Pré-visualização ao vivo",
  imagesCountOne: "{count} imagem · arraste pela alça para reordenar",
  imagesCountOther: "{count} imagens · arraste pela alça para reordenar",

  format: "Formato",
  fps: "Frames por segundo",
  fpsHint: "Mais FPS deixa transições mais suaves e o arquivo maior.",
  durationAll: "Duração de todas as imagens",
  applyToAll: "Aplicar a todas",
  res_720p: "HD 720p",
  res_1080p: "Full HD 1080p",
  res_square: "Quadrado",
  res_vertical: "Vertical",

  videoDuration: "Duração do vídeo",
  generating: "Gerando…",
  generate: "Gerar vídeo MP4",
  videoReady: "Vídeo pronto",
  fileName: "Nome do arquivo",
  downloadMp4: "Baixar MP4",

  addMore: "Adicionar mais imagens",
  dropHere: "Arraste suas imagens aqui",
  orClick: "ou clique para selecionar · JPG, PNG, WebP, GIF, HEIC",

  duration: "Duração",
  removeImage: "Remover imagem",
  dragToReorder: "Arraste para reordenar",
  changePosition: "Mudar posição",
  positionInput: "Nova posição",
  frameAlt: "Quadro {n}",

  play: "Reproduzir",
  pause: "Pausar",
  restart: "Recomeçar",
  total: "total",

  footerRendered: "Renderizado localmente ·",
  footerNoCloud: "sem enviar nada para a nuvem",
  rights: "Todos os direitos reservados",

  docTitle: "Instant Lapse — gerador de timelapse",
} satisfies Record<string, string>;

const en: Record<keyof typeof pt, string> = {
  tagline: "your images into timelapse in an instant",
  clearAll: "Clear all",
  language: "Language",
  toggleTheme: "Toggle theme",

  heroTitleA: "Turn a sequence of photos",
  heroTitleB: "into video",
  heroSubtitle:
    "Upload your images, adjust each frame's timing, reorder them however you like and download an MP4 ready to publish.",

  processing: "Processing images…",
  loadError: "Could not read one of the images. Please try again.",
  unexpectedError: "Unexpected error.",
  limitReached: "Limit of {max} images. {n} were not added.",
  tooLargeSkipped: "{n} image(s) over {mb} MB were skipped.",

  livePreview: "Live preview",
  imagesCountOne: "{count} image · drag by the handle to reorder",
  imagesCountOther: "{count} images · drag by the handle to reorder",

  format: "Format",
  fps: "Frames per second",
  fpsHint: "Higher FPS gives smoother transitions and a larger file.",
  durationAll: "Duration of all images",
  applyToAll: "Apply to all",
  res_720p: "HD 720p",
  res_1080p: "Full HD 1080p",
  res_square: "Square",
  res_vertical: "Vertical",

  videoDuration: "Video duration",
  generating: "Generating…",
  generate: "Generate MP4 video",
  videoReady: "Video ready",
  fileName: "File name",
  downloadMp4: "Download MP4",

  addMore: "Add more images",
  dropHere: "Drag your images here",
  orClick: "or click to select · JPG, PNG, WebP, GIF, HEIC",

  duration: "Duration",
  removeImage: "Remove image",
  dragToReorder: "Drag to reorder",
  changePosition: "Change position",
  positionInput: "New position",
  frameAlt: "Frame {n}",

  play: "Play",
  pause: "Pause",
  restart: "Restart",
  total: "total",

  footerRendered: "Rendered locally ·",
  footerNoCloud: "nothing is uploaded to the cloud",
  rights: "All rights reserved",

  docTitle: "Instant Lapse — timelapse generator",
};

export const dict = { pt, en };
export type Lang = keyof typeof dict;
export type TKey = keyof typeof pt;
