function cleanTicket(text) {
  if (typeof text !== "string") return "";
  return text
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\bBlk\s*\d+[A-Za-z\-]*\b.*?(?=\b|,|;)/gi, "")
    .replace(/#?\b\d{2,4}[A-Za-z]?\b/g, "")
    .replace(/\b(SS|CSO)\s+[A-Z][a-zA-Z]*/g, "")
    .replace(/\b\d{1,2}[ /-][A-Za-z]{3,9}[ /-]\d{2,4}\b/g, "")
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, "")
    .replace(/\b\S*[_-]\d+\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
