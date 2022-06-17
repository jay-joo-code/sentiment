// source: https://github.com/mantinedev/mantine/blob/b0ac2efb6c04ab34da7b679e825d57acaa9ce735/src/mantine-core/src/components/Highlight/highlighter/highlighter.ts#L5

function escapeRegex(value: string) {
  return value.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&")
}

export interface IHighlightConfig {
  keywords: []
  color: string
}

export function highlighter(value: string, _highlight: string | string[]) {
  if (_highlight == null) {
    return [{ chunk: value, highlighted: false }]
  }

  const highlight = Array.isArray(_highlight)
    ? _highlight.map(escapeRegex)
    : escapeRegex(_highlight)

  const shouldHighlight = Array.isArray(highlight)
    ? highlight.filter((part) => part.trim().length > 0).length > 0
    : highlight.trim() !== ""

  if (!shouldHighlight) {
    return [{ chunk: value, highlighted: false }]
  }

  const matcher =
    typeof highlight === "string"
      ? highlight
      : highlight
          .filter((part) => part.trim().length !== 0)
          .map((part) => `${part}`)
          .join("|")

  const re = new RegExp(`\\b(${matcher})\\b`, "gi")

  const chunks = value
    .split(re)
    .map((part) => ({ chunk: part, highlighted: re.test(part) }))
    .filter(({ chunk }) => chunk)

  return chunks
}
