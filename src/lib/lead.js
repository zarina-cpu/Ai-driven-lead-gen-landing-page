export function emptyLead() {
  return {
    quizAnswers: null,
    chatSummary: null,
    extractedBANT: {
      budget: null,
      need: null,
      timeline: null,
    },
    contactInfo: null,
    status: "cold",
  };
}

export function calcStatus(extractedBANT) {
  const filled = ["budget", "need", "timeline"].filter((key) => Boolean(extractedBANT?.[key])).length;
  if (filled === 0) return "cold";
  if (filled === 3) return "hot";
  return "warm";
}

export function mergeBANT(current, next) {
  return {
    budget: next?.budget || current.budget,
    need: next?.need || current.need,
    timeline: next?.timeline || current.timeline,
  };
}

export function withStatus(lead) {
  return { ...lead, status: calcStatus(lead.extractedBANT) };
}

export const statusCopy = {
  cold: "холодный",
  warm: "тёплый",
  hot: "горячий",
};
