// Crops an image to a square and shrinks it, so it is small enough to store in the profile.
export async function resizeImage(file: File, size = 128): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const side = Math.min(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Image processing is not supported in this browser.')
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size)
  return canvas.toDataURL('image/jpeg', 0.85)
}
