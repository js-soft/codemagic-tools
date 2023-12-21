export function isUrlValid(url: string): boolean {
  try {
    // eslint-disable-next-line no-new
    new URL(url)
    return true
  } catch (err) {
    return false
  }
}
