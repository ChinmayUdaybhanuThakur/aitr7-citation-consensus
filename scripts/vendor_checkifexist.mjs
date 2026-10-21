// outputs/AITR7_Citation_Consensus/third_party/checkifexist/mcp-server/src/dom-polyfill.ts
var SimpleElement = class {
  tagName;
  namespaceURI;
  textContent = null;
  children = [];
  attributes = /* @__PURE__ */ new Map();
  constructor(tagName, namespaceURI = "") {
    this.tagName = tagName;
    this.namespaceURI = namespaceURI;
  }
  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }
  getElementsByTagNameNS(ns, localName) {
    const results = [];
    for (const child of this.children) {
      if (child.tagName === localName && child.namespaceURI === ns) {
        results.push(child);
      }
      results.push(...child.getElementsByTagNameNS(ns, localName));
    }
    return results;
  }
  querySelector(selector) {
    if (selector === "parsererror") return null;
    return null;
  }
};
var SimpleDOMParser = class {
  parseFromString(xmlString, _mimeType) {
    const doc = new SimpleElement("document");
    try {
      this.parseXML(xmlString, doc);
    } catch {
    }
    return doc;
  }
  parseXML(xml, parent) {
    let pos = 0;
    while (pos < xml.length) {
      const tagStart = xml.indexOf("<", pos);
      if (tagStart === -1) break;
      if (tagStart > pos) {
        const text = xml.substring(pos, tagStart).trim();
        if (text && parent.textContent === null) {
          parent.textContent = text;
        } else if (text) {
          parent.textContent = (parent.textContent || "") + " " + text;
        }
      }
      if (xml[tagStart + 1] === "?") {
        pos = xml.indexOf("?>", tagStart) + 2;
        continue;
      }
      if (xml.substring(tagStart, tagStart + 4) === "<!--") {
        pos = xml.indexOf("-->", tagStart) + 3;
        continue;
      }
      if (xml[tagStart + 1] === "/") {
        pos = xml.indexOf(">", tagStart) + 1;
        return;
      }
      const tagEnd = xml.indexOf(">", tagStart);
      if (tagEnd === -1) break;
      const tagContent = xml.substring(tagStart + 1, tagEnd);
      const isSelfClosing = tagContent.endsWith("/");
      const cleanTagContent = isSelfClosing ? tagContent.slice(0, -1).trim() : tagContent.trim();
      const spaceIdx = cleanTagContent.indexOf(" ");
      const fullTagName = spaceIdx > 0 ? cleanTagContent.substring(0, spaceIdx) : cleanTagContent;
      const attrString = spaceIdx > 0 ? cleanTagContent.substring(spaceIdx) : "";
      let localName = fullTagName;
      let ns = "";
      const colonIdx = fullTagName.indexOf(":");
      if (colonIdx > 0) {
        localName = fullTagName.substring(colonIdx + 1);
      }
      const nsMatch = attrString.match(/xmlns(?::(\w+))?="([^"]+)"/g);
      const nsMap = /* @__PURE__ */ new Map();
      if (nsMatch) {
        for (const m of nsMatch) {
          const parts = m.match(/xmlns(?::(\w+))?="([^"]+)"/);
          if (parts) {
            nsMap.set(parts[1] || "", parts[2]);
          }
        }
      }
      const prefix = colonIdx > 0 ? fullTagName.substring(0, colonIdx) : "";
      if (nsMap.has(prefix)) {
        ns = nsMap.get(prefix);
      } else if (prefix === "arxiv") {
        ns = "http://arxiv.org/schemas/atom";
      } else if (!prefix) {
        ns = nsMap.get("") || parent.namespaceURI || "http://www.w3.org/2005/Atom";
      }
      const element = new SimpleElement(localName, ns);
      const attrRegex = /(\w[\w:-]*)="([^"]*)"/g;
      let attrMatch;
      while ((attrMatch = attrRegex.exec(attrString)) !== null) {
        if (!attrMatch[1].startsWith("xmlns")) {
          element.attributes.set(attrMatch[1], attrMatch[2]);
        }
      }
      parent.children.push(element);
      pos = tagEnd + 1;
      if (!isSelfClosing) {
        const closingTag = `</${fullTagName}>`;
        const closingIdx = this.findClosingTag(xml, fullTagName, pos);
        if (closingIdx > pos) {
          const innerXml = xml.substring(pos, closingIdx);
          if (innerXml.includes("<")) {
            this.parseXML(innerXml, element);
          } else {
            element.textContent = innerXml.trim();
          }
          pos = closingIdx + closingTag.length;
        }
      }
    }
  }
  findClosingTag(xml, tagName, startPos) {
    let depth = 1;
    let pos = startPos;
    const openPattern = `<${tagName}`;
    const closePattern = `</${tagName}>`;
    while (pos < xml.length && depth > 0) {
      const nextOpen = xml.indexOf(openPattern, pos);
      const nextClose = xml.indexOf(closePattern, pos);
      if (nextClose === -1) return -1;
      if (nextOpen !== -1 && nextOpen < nextClose) {
        const charAfter = xml[nextOpen + openPattern.length];
        if (charAfter === ">" || charAfter === " " || charAfter === "/") {
          depth++;
        }
        pos = nextOpen + 1;
      } else {
        depth--;
        if (depth === 0) return nextClose;
        pos = nextClose + closePattern.length;
      }
    }
    return -1;
  }
};
globalThis.DOMParser = SimpleDOMParser;

// outputs/AITR7_Citation_Consensus/third_party/checkifexist/src/services/SemanticScholarService.ts
var titleSimilarity = (a, b) => {
  const clean = (s) => s.toLowerCase().replace(/[^\w\s]/g, "").trim();
  const ca = clean(a);
  const cb = clean(b);
  if (ca === cb) return 100;
  const wordsA = new Set(ca.split(/\s+/));
  const wordsB = new Set(cb.split(/\s+/));
  let overlap = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) overlap++;
  }
  const maxLen = Math.max(wordsA.size, wordsB.size);
  return maxLen > 0 ? Math.round(overlap / maxLen * 100) : 0;
};
var searchSemanticScholar = async (title, expectedYear) => {
  try {
    const encodedQuery = encodeURIComponent(title);
    const fields = "paperId,title,authors,year,venue,externalIds,url,citationCount,isRetracted";
    const apiUrl = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodedQuery}&limit=5&fields=${fields}`;
    const response = await fetch(apiUrl, {
      headers: {
        "Accept": "application/json"
      }
    });
    if (!response.ok) {
      if (response.status === 429) {
        console.warn("Semantic Scholar rate limit reached");
      }
      return null;
    }
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      let bestPaper = data.data[0];
      let bestScore = -1;
      for (const paper of data.data) {
        let score = titleSimilarity(title, paper.title);
        if (expectedYear && paper.year) {
          if (paper.year.toString() === expectedYear) {
            score += 20;
          } else if (Math.abs(paper.year - parseInt(expectedYear)) === 1) {
            score += 5;
          }
        }
        if (score > bestScore) {
          bestScore = score;
          bestPaper = paper;
        }
      }
      return {
        paperId: bestPaper.paperId,
        title: bestPaper.title,
        authors: bestPaper.authors.map((a) => a.name),
        year: bestPaper.year,
        venue: bestPaper.venue || "",
        externalIds: bestPaper.externalIds,
        url: bestPaper.url || `https://www.semanticscholar.org/paper/${bestPaper.paperId}`,
        citationCount: bestPaper.citationCount,
        isRetracted: bestPaper.isRetracted || bestPaper.title.toLowerCase().includes("retract") || bestPaper.title.toLowerCase().includes("withdraw")
      };
    }
    return null;
  } catch (error) {
    console.error("Semantic Scholar search failed:", error);
    return null;
  }
};
var formatSemanticScholarAPA = (paper) => {
  const authors = paper.authors.map((name, idx) => {
    const parts = name.split(" ");
    const lastName = parts.pop() || "";
    const initials = parts.map((p) => p[0] + ".").join(" ");
    return idx === paper.authors.length - 1 && paper.authors.length > 1 ? `& ${lastName}, ${initials}` : `${lastName}, ${initials}`;
  }).join(", ");
  const year = paper.year || "n.d.";
  const doi = paper.externalIds?.DOI ? `https://doi.org/${paper.externalIds.DOI}` : "";
  let citation = `${authors} (${year}). ${paper.title}.`;
  if (paper.venue) {
    citation += ` ${paper.venue}.`;
  }
  if (doi) {
    citation += ` ${doi}`;
  }
  return citation;
};
var formatSemanticScholarMLA = (paper) => {
  let authorsStr = "";
  const authors = paper.authors;
  if (authors.length === 1) {
    authorsStr = authors[0];
  } else if (authors.length === 2) {
    authorsStr = `${authors[0]} and ${authors[1]}`;
  } else if (authors.length > 2) {
    authorsStr = `${authors[0]}, et al`;
  }
  if (authorsStr && !authorsStr.endsWith(".")) authorsStr += ".";
  const year = paper.year || "n.d.";
  const doi = paper.externalIds?.DOI ? `https://doi.org/${paper.externalIds.DOI}` : "";
  let citation = authorsStr ? `${authorsStr} ` : "";
  citation += `"${paper.title}."`;
  if (paper.venue) citation += ` ${paper.venue},`;
  citation += ` ${year}.`;
  if (doi) citation += ` ${doi}.`;
  return citation;
};
var formatSemanticScholarISO690 = (paper) => {
  const authors = paper.authors.map((a) => a.toUpperCase()).join("; ");
  const year = paper.year || "n.d.";
  const doi = paper.externalIds?.DOI ? `https://doi.org/${paper.externalIds.DOI}` : "";
  let citation = authors ? `${authors}. ` : "";
  citation += `${paper.title}.`;
  if (paper.venue) citation += ` ${paper.venue},`;
  citation += ` ${year}.`;
  if (doi) citation += ` ${doi}`;
  return citation;
};
var generateSemanticScholarBibTeX = (paper) => {
  const authors = paper.authors.join(" and ");
  const year = paper.year || "n.d.";
  const firstAuthor = paper.authors[0]?.split(" ").pop() || "Unknown";
  const cleanTitle = paper.title.split(" ")[0].replace(/[^a-zA-Z0-9]/g, "");
  const id = `${firstAuthor}${year}${cleanTitle}`;
  let bib = `@article{${id},
  title={${paper.title}},
  author={${authors}},
  year={${year}}`;
  if (paper.venue) bib += `,
  journal={${paper.venue}}`;
  if (paper.externalIds?.DOI) bib += `,
  doi={${paper.externalIds.DOI}}`;
  bib += `
}`;
  return bib;
};

// outputs/AITR7_Citation_Consensus/third_party/checkifexist/src/services/OpenAlexService.ts
var titleSimilarity2 = (a, b) => {
  const clean = (s) => s.toLowerCase().replace(/[^\w\s]/g, "").trim();
  const ca = clean(a);
  const cb = clean(b);
  if (ca === cb) return 100;
  const wordsA = new Set(ca.split(/\s+/));
  const wordsB = new Set(cb.split(/\s+/));
  let overlap = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) overlap++;
  }
  const maxLen = Math.max(wordsA.size, wordsB.size);
  return maxLen > 0 ? Math.round(overlap / maxLen * 100) : 0;
};
var searchOpenAlex = async (title, expectedYear) => {
  try {
    const encodedTitle = encodeURIComponent(title);
    const response = await fetch(
      `https://api.openalex.org/works?filter=title.search:${encodedTitle}&per_page=5&mailto=contact@example.com`,
      {
        headers: {
          "Accept": "application/json"
        }
      }
    );
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      let bestWork = data.results[0];
      let bestScore = -1;
      for (const work of data.results) {
        let score = titleSimilarity2(title, work.title);
        if (expectedYear && work.publication_year) {
          if (work.publication_year.toString() === expectedYear) {
            score += 20;
          } else if (Math.abs(work.publication_year - parseInt(expectedYear)) === 1) {
            score += 5;
          }
        }
        if (score > bestScore) {
          bestScore = score;
          bestWork = work;
        }
      }
      return {
        id: bestWork.id,
        title: bestWork.title,
        authors: bestWork.authorships.map((a) => a.author.display_name),
        year: bestWork.publication_year,
        journal: bestWork.primary_location?.source?.display_name || "",
        doi: bestWork.doi,
        url: bestWork.doi || bestWork.id,
        citations: bestWork.cited_by_count,
        isRetracted: bestWork.is_retracted || bestWork.title.toLowerCase().includes("retract") || bestWork.title.toLowerCase().includes("withdraw")
      };
    }
    return null;
  } catch (error) {
    console.error("OpenAlex search failed:", error);
    return null;
  }
};
var formatOpenAlexAPA = (work) => {
  const authors = work.authors.map((name, idx) => {
    const parts = name.split(" ");
    const lastName = parts.pop() || "";
    const initials = parts.map((p) => p[0] + ".").join(" ");
    return idx === work.authors.length - 1 && work.authors.length > 1 ? `& ${lastName}, ${initials}` : `${lastName}, ${initials}`;
  }).join(", ");
  const year = work.year || "n.d.";
  let citation = `${authors} (${year}). ${work.title}.`;
  if (work.journal) {
    citation += ` ${work.journal}.`;
  }
  if (work.doi) {
    citation += ` ${work.doi}`;
  }
  return citation;
};
var formatOpenAlexMLA = (work) => {
  let authorsStr = "";
  const authors = work.authors;
  if (authors.length === 1) {
    authorsStr = authors[0];
  } else if (authors.length === 2) {
    authorsStr = `${authors[0]} and ${authors[1]}`;
  } else if (authors.length > 2) {
    authorsStr = `${authors[0]}, et al`;
  }
  if (authorsStr && !authorsStr.endsWith(".")) authorsStr += ".";
  const year = work.year || "n.d.";
  let citation = authorsStr ? `${authorsStr} ` : "";
  citation += `"${work.title}."`;
  if (work.journal) citation += ` ${work.journal},`;
  citation += ` ${year}.`;
  if (work.doi) citation += ` ${work.doi}.`;
  return citation;
};
var formatOpenAlexISO690 = (work) => {
  const authors = work.authors.map((a) => a.toUpperCase()).join("; ");
  const year = work.year || "n.d.";
  let citation = authors ? `${authors}. ` : "";
  citation += `${work.title}.`;
  if (work.journal) citation += ` ${work.journal},`;
  citation += ` ${year}.`;
  if (work.doi) citation += ` ${work.doi}`;
  return citation;
};
var generateOpenAlexBibTeX = (work) => {
  const authors = work.authors.join(" and ");
  const year = work.year || "n.d.";
  const firstAuthor = work.authors[0]?.split(" ").pop() || "Unknown";
  const cleanTitle = work.title.split(" ")[0].replace(/[^a-zA-Z0-9]/g, "");
  const id = `${firstAuthor}${year}${cleanTitle}`;
  let bib = `@article{${id},
  title={${work.title}},
  author={${authors}},
  year={${year}}`;
  if (work.journal) bib += `,
  journal={${work.journal}}`;
  if (work.doi) bib += `,
  doi={${work.doi.replace("https://doi.org/", "")}}`;
  bib += `
}`;
  return bib;
};

// outputs/AITR7_Citation_Consensus/third_party/checkifexist/src/services/ArxivService.ts
var titleSimilarity3 = (a, b) => {
  const clean = (s) => s.toLowerCase().replace(/[^\w\s]/g, "").trim();
  const ca = clean(a);
  const cb = clean(b);
  if (ca === cb) return 100;
  const wordsA = new Set(ca.split(/\s+/));
  const wordsB = new Set(cb.split(/\s+/));
  let overlap = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) overlap++;
  }
  const maxLen = Math.max(wordsA.size, wordsB.size);
  return maxLen > 0 ? Math.round(overlap / maxLen * 100) : 0;
};
var parseArxivResponse = (xml) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    console.error("arXiv XML parse error:", parseError.textContent);
    return [];
  }
  const ns = "http://www.w3.org/2005/Atom";
  const entries = doc.getElementsByTagNameNS(ns, "entry");
  const results = [];
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const titleEl = entry.getElementsByTagNameNS(ns, "title")[0];
    const title = (titleEl?.textContent || "").replace(/\s+/g, " ").trim();
    if (!title) continue;
    const idEl = entry.getElementsByTagNameNS(ns, "id")[0];
    const fullId = idEl?.textContent?.trim() || "";
    const arxivIdMatch = fullId.match(/abs\/(.+?)(?:v\d+)?$/);
    const arxivId = arxivIdMatch ? arxivIdMatch[1] : fullId;
    const authorEls = entry.getElementsByTagNameNS(ns, "author");
    const authors = [];
    for (let j = 0; j < authorEls.length; j++) {
      const nameEl = authorEls[j].getElementsByTagNameNS(ns, "name")[0];
      if (nameEl?.textContent) {
        authors.push(nameEl.textContent.trim());
      }
    }
    const publishedEl = entry.getElementsByTagNameNS(ns, "published")[0];
    const publishedDate = publishedEl?.textContent?.trim() || "";
    const yearMatch = publishedDate.match(/^(\d{4})/);
    const year = yearMatch ? parseInt(yearMatch[1]) : null;
    const categoryEl = entry.getElementsByTagNameNS("http://arxiv.org/schemas/atom", "primary_category");
    const category = categoryEl.length > 0 ? categoryEl[0].getAttribute("term") || "" : "";
    const doiEl = entry.getElementsByTagNameNS("http://arxiv.org/schemas/atom", "doi");
    const doi = doiEl.length > 0 ? doiEl[0].textContent?.trim() || null : null;
    const linkEls = entry.getElementsByTagNameNS(ns, "link");
    let absUrl = `https://arxiv.org/abs/${arxivId}`;
    let pdfUrl = `https://arxiv.org/pdf/${arxivId}`;
    for (let j = 0; j < linkEls.length; j++) {
      const rel = linkEls[j].getAttribute("rel") || "";
      const href = linkEls[j].getAttribute("href") || "";
      const type = linkEls[j].getAttribute("type") || "";
      if (rel === "alternate" && href) {
        absUrl = href;
      }
      if (type === "application/pdf" && href) {
        pdfUrl = href;
      }
    }
    results.push({
      id: arxivId,
      title,
      authors,
      year,
      category,
      doi,
      url: absUrl,
      pdfUrl
    });
  }
  return results;
};
var searchArxiv = async (title, expectedYear) => {
  try {
    const encodedQuery = encodeURIComponent(title);
    const PROXY_URL = "https://api.codetabs.com/v1/proxy?quest=";
    const apiUrl = `https://export.arxiv.org/api/query?search_query=ti:${encodedQuery}&max_results=5&sortBy=relevance&sortOrder=descending`;
    const response = await fetch(PROXY_URL + encodeURIComponent(apiUrl));
    if (!response.ok) {
      console.warn(`arXiv API returned ${response.status}`);
      return null;
    }
    const xmlText = await response.text();
    const papers = parseArxivResponse(xmlText);
    if (papers.length === 0) {
      return null;
    }
    let bestPaper = papers[0];
    let bestScore = -1;
    for (const paper of papers) {
      let score = titleSimilarity3(title, paper.title);
      if (expectedYear && paper.year) {
        if (paper.year.toString() === expectedYear) {
          score += 20;
        } else if (Math.abs(paper.year - parseInt(expectedYear)) === 1) {
          score += 5;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestPaper = paper;
      }
    }
    return bestPaper;
  } catch (error) {
    console.error("arXiv search failed:", error);
    return null;
  }
};
var resolveArxivById = async (arxivId) => {
  try {
    const cleanId = arxivId.replace(/^arXiv:/i, "").replace(/v\d+$/, "").trim();
    const PROXY_URL = "https://api.codetabs.com/v1/proxy?quest=";
    const apiUrl = `https://export.arxiv.org/api/query?id_list=${encodeURIComponent(cleanId)}`;
    const response = await fetch(PROXY_URL + encodeURIComponent(apiUrl));
    if (!response.ok) return null;
    const xmlText = await response.text();
    const papers = parseArxivResponse(xmlText);
    return papers.length > 0 ? papers[0] : null;
  } catch (error) {
    console.error("arXiv ID resolution failed:", error);
    return null;
  }
};
var formatArxivAPA = (paper) => {
  const authors = paper.authors.map((name, idx) => {
    const parts = name.split(" ");
    const lastName = parts.pop() || "";
    const initials = parts.map((p) => p[0] + ".").join(" ");
    return idx === paper.authors.length - 1 && paper.authors.length > 1 ? `& ${lastName}, ${initials}` : `${lastName}, ${initials}`;
  }).join(", ");
  const year = paper.year || "n.d.";
  const doi = paper.doi ? `https://doi.org/${paper.doi}` : "";
  let citation = `${authors} (${year}). ${paper.title}.`;
  citation += ` arXiv preprint arXiv:${paper.id}.`;
  if (doi) {
    citation += ` ${doi}`;
  } else {
    citation += ` ${paper.url}`;
  }
  return citation;
};
var formatArxivMLA = (paper) => {
  let authorsStr = "";
  const authors = paper.authors;
  if (authors.length === 1) {
    authorsStr = authors[0];
  } else if (authors.length === 2) {
    authorsStr = `${authors[0]} and ${authors[1]}`;
  } else if (authors.length > 2) {
    authorsStr = `${authors[0]}, et al`;
  }
  if (authorsStr && !authorsStr.endsWith(".")) authorsStr += ".";
  const year = paper.year || "n.d.";
  const doi = paper.doi ? `https://doi.org/${paper.doi}` : paper.url;
  let citation = authorsStr ? `${authorsStr} ` : "";
  citation += `"${paper.title}."`;
  citation += ` arXiv preprint arXiv:${paper.id},`;
  citation += ` ${year}.`;
  if (doi) citation += ` ${doi}.`;
  return citation;
};
var formatArxivISO690 = (paper) => {
  const authors = paper.authors.map((a) => a.toUpperCase()).join("; ");
  const year = paper.year || "n.d.";
  const doi = paper.doi ? `https://doi.org/${paper.doi}` : paper.url;
  let citation = authors ? `${authors}. ` : "";
  citation += `${paper.title}.`;
  citation += ` arXiv preprint arXiv:${paper.id},`;
  citation += ` ${year}.`;
  if (doi) citation += ` ${doi}`;
  return citation;
};
var generateArxivBibTeX = (paper) => {
  const authors = paper.authors.join(" and ");
  const year = paper.year || "n.d.";
  const firstAuthor = paper.authors[0]?.split(" ").pop() || "Unknown";
  const cleanTitle = paper.title.split(" ")[0].replace(/[^a-zA-Z0-9]/g, "");
  const id = `${firstAuthor}${year}${cleanTitle}`;
  let bib = `@misc{${id},
  title={${paper.title}},
  author={${authors}},
  year={${year}},
  eprint={${paper.id}},
  archivePrefix={arXiv}`;
  if (paper.category) bib += `,
  primaryClass={${paper.category}}`;
  if (paper.doi) bib += `,
  doi={${paper.doi}}`;
  bib += `
}`;
  return bib;
};

// outputs/AITR7_Citation_Consensus/third_party/checkifexist/src/services/DblpService.ts
var titleSimilarity4 = (a, b) => {
  const clean = (s) => s.toLowerCase().replace(/[^\w\s]/g, "").trim();
  const ca = clean(a);
  const cb = clean(b);
  if (ca === cb) return 100;
  const wordsA = new Set(ca.split(/\s+/));
  const wordsB = new Set(cb.split(/\s+/));
  let overlap = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) overlap++;
  }
  const maxLen = Math.max(wordsA.size, wordsB.size);
  return maxLen > 0 ? Math.round(overlap / maxLen * 100) : 0;
};
var extractDoiFromEe = (ee) => {
  if (!ee) return null;
  const urls = Array.isArray(ee) ? ee : [ee];
  for (const url of urls) {
    const match = url.match(/doi\.org\/(10\.\d{4,9}\/[^\s,;]+)/i);
    if (match) return match[1];
  }
  return null;
};
var normalizeAuthors = (authorData) => {
  if (!authorData) return [];
  const authors = Array.isArray(authorData) ? authorData : [authorData];
  return authors.map((a) => {
    let name = "";
    if (typeof a === "string") name = a;
    else if (typeof a === "object" && a !== null && "text" in a) name = a.text;
    else name = String(a);
    return name.replace(/\s+\d{4}$/, "").trim();
  }).filter((name) => name.length > 0);
};
var searchDblp = async (title, expectedYear) => {
  try {
    const encodedQuery = encodeURIComponent(title);
    const apiUrl = `https://dblp.org/search/publ/api?q=${encodedQuery}&format=json&h=5`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.warn(`DBLP API returned ${response.status}`);
      return null;
    }
    const data = await response.json();
    const hits = data?.result?.hits?.hit;
    if (!hits || !Array.isArray(hits) || hits.length === 0) {
      return null;
    }
    let bestHit = hits[0];
    let bestScore = -1;
    for (const hit of hits) {
      const info2 = hit.info;
      if (!info2?.title) continue;
      const hitTitle2 = info2.title.replace(/\.\s*$/, "");
      let score = titleSimilarity4(title, hitTitle2);
      const hitYear = info2.year ? parseInt(info2.year) : null;
      if (expectedYear && hitYear) {
        if (hitYear.toString() === expectedYear) {
          score += 20;
        } else if (Math.abs(hitYear - parseInt(expectedYear)) === 1) {
          score += 5;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestHit = hit;
      }
    }
    const info = bestHit.info;
    if (!info?.title) return null;
    const hitTitle = info.title.replace(/\.\s*$/, "");
    const authors = normalizeAuthors(info.authors?.author);
    const year = info.year ? parseInt(info.year) : null;
    const doi = extractDoiFromEe(info.ee);
    const eeUrl = Array.isArray(info.ee) ? info.ee[0] : info.ee || "";
    return {
      key: info.key || bestHit["@id"] || "",
      title: hitTitle,
      authors,
      year,
      venue: info.venue || "",
      type: info.type || "",
      doi,
      url: info.url || `https://dblp.org/rec/${info.key || ""}`,
      eeUrl: eeUrl || ""
    };
  } catch (error) {
    console.error("DBLP search failed:", error);
    return null;
  }
};
var formatDblpAPA = (paper) => {
  const authors = paper.authors.map((name, idx) => {
    const parts = name.split(" ");
    const lastName = parts.pop() || "";
    const initials = parts.map((p) => p[0] + ".").join(" ");
    return idx === paper.authors.length - 1 && paper.authors.length > 1 ? `& ${lastName}, ${initials}` : `${lastName}, ${initials}`;
  }).join(", ");
  const year = paper.year || "n.d.";
  const doi = paper.doi ? `https://doi.org/${paper.doi}` : "";
  let citation = `${authors} (${year}). ${paper.title}.`;
  if (paper.venue) {
    citation += ` ${paper.venue}.`;
  }
  if (doi) {
    citation += ` ${doi}`;
  } else if (paper.eeUrl) {
    citation += ` ${paper.eeUrl}`;
  }
  return citation;
};
var formatDblpMLA = (paper) => {
  let authorsStr = "";
  const authors = paper.authors;
  if (authors.length === 1) {
    authorsStr = authors[0];
  } else if (authors.length === 2) {
    authorsStr = `${authors[0]} and ${authors[1]}`;
  } else if (authors.length > 2) {
    authorsStr = `${authors[0]}, et al`;
  }
  if (authorsStr && !authorsStr.endsWith(".")) authorsStr += ".";
  const year = paper.year || "n.d.";
  const doi = paper.doi ? `https://doi.org/${paper.doi}` : paper.eeUrl || "";
  let citation = authorsStr ? `${authorsStr} ` : "";
  citation += `"${paper.title}."`;
  if (paper.venue) citation += ` ${paper.venue},`;
  citation += ` ${year}.`;
  if (doi) citation += ` ${doi}.`;
  return citation;
};
var formatDblpISO690 = (paper) => {
  const authors = paper.authors.map((a) => a.toUpperCase()).join("; ");
  const year = paper.year || "n.d.";
  const doi = paper.doi ? `https://doi.org/${paper.doi}` : paper.eeUrl || "";
  let citation = authors ? `${authors}. ` : "";
  citation += `${paper.title}.`;
  if (paper.venue) citation += ` ${paper.venue},`;
  citation += ` ${year}.`;
  if (doi) citation += ` ${doi}`;
  return citation;
};
var generateDblpBibTeX = (paper) => {
  const authors = paper.authors.join(" and ");
  const year = paper.year || "n.d.";
  const firstAuthor = paper.authors[0]?.split(" ").pop() || "Unknown";
  const cleanTitle = paper.title.split(" ")[0].replace(/[^a-zA-Z0-9]/g, "");
  const id = `${firstAuthor}${year}${cleanTitle}`;
  const isConference = paper.type.toLowerCase().includes("conference") || paper.type.toLowerCase().includes("workshop");
  const bibType = isConference ? "inproceedings" : "article";
  const venueField = isConference ? "booktitle" : "journal";
  let bib = `@${bibType}{${id},
  title={${paper.title}},
  author={${authors}},
  year={${year}}`;
  if (paper.venue) bib += `,
  ${venueField}={${paper.venue}}`;
  if (paper.doi) bib += `,
  doi={${paper.doi}}`;
  bib += `
}`;
  return bib;
};

// outputs/AITR7_Citation_Consensus/third_party/checkifexist/src/vendors/predatoryList.json
var predatoryList_default = {
  publishers: [
    "OMICS Publishing Group",
    "OMICS International",
    "WASET",
    "World Academy of Science, Engineering and Technology",
    "Bentham Open",
    "MDPI",
    "Frontiers Media",
    "SCIRP",
    "Scientific Research Publishing",
    "Hindawi",
    "Baishideng Publishing Group",
    "Longdom Publishing",
    "Hilaris",
    "Allied Academies",
    "Pulsus Group"
  ],
  journals: [
    "International Journal of Advanced Research",
    "International Journal of Current Research",
    "Asian Journal of Pharmaceutical and Clinical Research",
    "International Journal of Recent Scientific Research",
    "Journal of Fundamental and Applied Sciences"
  ]
};

// outputs/AITR7_Citation_Consensus/third_party/checkifexist/src/services/PredatoryService.ts
var normalize = (str) => {
  return str.toLowerCase().replace(/[^\w\s]/gi, "").replace(/\s+/g, " ").trim();
};
var publishers = predatoryList_default.publishers.map(normalize);
var journals = predatoryList_default.journals.map(normalize);
var isPredatory = (name) => {
  if (!name) return false;
  const normalizedName = normalize(name);
  const isPredatoryPublisher = publishers.some((p) => normalizedName.includes(p));
  if (isPredatoryPublisher) return true;
  const isPredatoryJournal = journals.some((j) => normalizedName.includes(j));
  return isPredatoryJournal;
};

// outputs/AITR7_Citation_Consensus/third_party/checkifexist/src/services/SearchService.ts
var PREPRINT_VENUES = [
  "arxiv",
  "biorxiv",
  "medrxiv",
  "chemrxiv",
  "ssrn",
  "preprints",
  "research square",
  "osf preprints",
  "techrxiv",
  "eartharxiv",
  "engrxiv",
  "socarxiv",
  "psyarxiv",
  "edarxiv",
  "hal",
  "repec",
  "nber working paper",
  "working paper"
];
var isPreprint = (venue) => {
  if (!venue) return false;
  const lower = venue.toLowerCase();
  return PREPRINT_VENUES.some((p) => lower.includes(p));
};
var cleanQuery = (text) => {
  return text.replace(/[{}]/g, "").replace(/\\textbf|\\textit|\\emph|\\textrm/g, "").replace(/\\&/g, "&").replace(/~/g, " ").replace(/\s{2,}/g, " ").trim();
};
var extractLikelyTitle = (rawRef) => {
  let ref = rawRef.trim();
  if (!ref || ref.length < 10) return null;
  ref = ref.replace(/\b[Pp]{1,2}\.?\s*\d+[-–]\d+/g, "");
  ref = ref.replace(/\b\d{1,5}\s*[-–]\s*\d{1,5}\b/g, "");
  ref = ref.replace(/\b[Vv]ol\.?\s*\d+/g, "");
  ref = ref.replace(/\b[Nn]o\.?\s*\d+/g, "");
  ref = ref.replace(/\b[Ii]ssue\s*\d+/g, "");
  ref = ref.replace(/\b\d{1,4}\s*\(\d{1,4}\)/g, "");
  ref = ref.replace(/\(?\b(19|20)\d{2}\b\)?/g, "");
  ref = ref.replace(/https?:\/\/doi\.org\/[^\s,]+/gi, "");
  ref = ref.replace(/\bdoi:\s*[^\s,]+/gi, "");
  ref = ref.replace(/\b[A-Z]{1,4}\s+(?=[A-Z][a-zà-ö])/g, "");
  const segments = ref.split(/[,;]|(?<=\.)\s+(?=[A-Z])/).map((s) => s.trim().replace(/^[.]+|[.]+$/g, "").trim()).filter((s) => s.length > 5);
  if (segments.length > 1) {
    const venueKeywords = /\b(journal|proceedings|conference|transactions|advances|letters|review|annals|bulletin|workshop|symposium|arxiv)\b/i;
    const authorPattern = /\b(and)\b.*\b(and)\b|\b[A-Z][a-z]+\s+and\s+[A-Z][a-z]+/;
    const scored = segments.map((seg) => {
      const words = seg.split(/\s+/);
      const lowercaseWords = words.filter((w) => w.length > 2 && w[0] === w[0].toLowerCase()).length;
      const ratio = words.length > 0 ? lowercaseWords / words.length : 0;
      let score = seg.length * (0.5 + ratio);
      if (venueKeywords.test(seg)) score *= 0.3;
      if (authorPattern.test(seg)) score *= 0.3;
      return { seg, score };
    });
    scored.sort((a, b) => b.score - a.score);
    ref = scored[0].seg;
  }
  ref = ref.replace(/\s{2,}/g, " ").replace(/^[,;.\s]+|[,;.\s]+$/g, "").trim();
  if (ref.length >= 10 && ref.length < rawRef.length * 0.95) {
    return ref;
  }
  return null;
};
var MIN_TITLE_SIMILARITY = 70;
var normalize2 = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^\w\s]/g, "").trim();
var levenshteinDistance = (a, b) => {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
};
var wordOverlapSimilarity = (str1, str2) => {
  const words1 = str1.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter((w) => w.length > 0);
  const words2 = str2.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter((w) => w.length > 0);
  if (words1.length === 0 || words2.length === 0) return 0;
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  let intersection = 0;
  for (const word of set1) {
    if (set2.has(word)) intersection++;
  }
  const union = (/* @__PURE__ */ new Set([...set1, ...set2])).size;
  if (union === 0) return 0;
  return Math.round(intersection / union * 100);
};
var calculateSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  const clean1 = normalize2(str1);
  const clean2 = normalize2(str2);
  if (clean1 === clean2) return 100;
  const distance = levenshteinDistance(clean1, clean2);
  const maxLength = Math.max(clean1.length, clean2.length);
  const levenSim = maxLength === 0 ? 0 : Math.max(0, Math.round((1 - distance / maxLength) * 100));
  const wordSim = wordOverlapSimilarity(str1, str2);
  return Math.max(levenSim, wordSim);
};
var computeTitleSim = (expectedTitle, resultTitle) => {
  if (!expectedTitle || !resultTitle) return 0;
  const cleanExpected = normalize2(expectedTitle);
  const cleanResult = normalize2(resultTitle);
  let sim = calculateSimilarity(cleanExpected, cleanResult);
  if (sim < 90 && cleanExpected.includes(cleanResult) && cleanResult.length > 20) {
    sim = 95;
  }
  return sim;
};
var computeAuthorSim = (expectedAuthorsStr, resultAuthors) => {
  if (!expectedAuthorsStr || resultAuthors.length === 0) return 100;
  const nValidation = normalize2(expectedAuthorsStr);
  let matchCount = 0;
  let validAuthors = 0;
  for (const a of resultAuthors) {
    const parts = normalize2(a).split(" ").filter((p) => !/^\d+$/.test(p));
    if (parts.length === 0) continue;
    const family = parts[parts.length - 1];
    if (family.length > 1) {
      validAuthors++;
      if (nValidation.includes(family)) {
        matchCount++;
      }
    }
  }
  if (validAuthors === 0) return 100;
  const hasEtAl = /et\s*al|and\s*others/i.test(expectedAuthorsStr);
  if (hasEtAl && matchCount > 0) {
    return 100;
  }
  return Math.round(matchCount / validAuthors * 100);
};
var decodeLatex = (text) => {
  return text.replace(/\{?\\'?\{?([aeiouAEIOU])\}?\}?/g, "$1").replace(/\{?\\`\{?([aeiouAEIOU])\}?\}?/g, "$1").replace(/\{?\\\^\{?([aeiouAEIOU])\}?\}?/g, "$1").replace(/\{?\\"\{?([aeiouAEIOU])\}?\}?/g, "$1").replace(/\{?\\v\{?([a-zA-Z])\}?\}?/g, "$1").replace(/\{?\\~\{?([nN])\}?\}?/g, "$1").replace(/\{?\\c\{?([cC])\}?\}?/g, "$1").replace(/[{}]/g, "").trim();
};
var firstLetterMatches = (name1, name2) => {
  const clean1 = decodeLatex(name1).replace(/[^a-zA-Z]/g, "");
  const clean2 = decodeLatex(name2).replace(/[^a-zA-Z]/g, "");
  if (!clean1 || !clean2) return false;
  return clean1[0].toLowerCase() === clean2[0].toLowerCase();
};
var formatAPA = (item) => {
  const authors = (item.author || []).map((a) => `${a.family}, ${a.given ? a.given[0] + "." : ""}`).join(", ");
  const year = item.published?.["date-parts"]?.[0]?.[0] || "n.d.";
  const title = item.title?.[0] || "Untitled";
  const journal = item["container-title"]?.[0] || "";
  const doi = item.DOI ? `https://doi.org/${item.DOI}` : item.URL || "";
  let citation = `${authors} (${year}). ${title}.`;
  if (journal) {
    citation += ` ${journal}.`;
  }
  if (doi) {
    citation += ` ${doi}`;
  }
  return citation;
};
var formatMLA = (item) => {
  let authorsStr = "";
  const authors = item.author || [];
  if (authors.length === 1) {
    authorsStr = `${authors[0].family}, ${authors[0].given || ""}`.trim();
  } else if (authors.length === 2) {
    authorsStr = `${authors[0].family}, ${authors[0].given || ""}, and ${authors[1].given || ""} ${authors[1].family}`.trim();
  } else if (authors.length > 2) {
    authorsStr = `${authors[0].family}, ${authors[0].given || ""}, et al`.trim();
  }
  if (authorsStr && !authorsStr.endsWith(".")) authorsStr += ".";
  const title = item.title?.[0] || "Untitled";
  const journal = item["container-title"]?.[0] || "";
  const year = item.published?.["date-parts"]?.[0]?.[0] || "n.d.";
  const doi = item.DOI ? `https://doi.org/${item.DOI}` : item.URL || "";
  let citation = authorsStr ? `${authorsStr} ` : "";
  citation += `"${title}."`;
  if (journal) citation += ` ${journal},`;
  citation += ` ${year}.`;
  if (doi) citation += ` ${doi}.`;
  return citation;
};
var formatISO690 = (item) => {
  const authors = (item.author || []).map((a) => {
    const family = (a.family || "").toUpperCase();
    const given = a.given ? `, ${a.given}` : "";
    return `${family}${given}`;
  }).join("; ");
  const year = item.published?.["date-parts"]?.[0]?.[0] || "n.d.";
  const title = item.title?.[0] || "Untitled";
  const journal = item["container-title"]?.[0] || "";
  const doi = item.DOI ? `https://doi.org/${item.DOI}` : item.URL || "";
  let citation = authors ? `${authors}. ` : "";
  citation += `${title}.`;
  if (journal) citation += ` ${journal},`;
  citation += ` ${year}.`;
  if (doi) citation += ` ${doi}`;
  return citation;
};
var generateBibTeX = (item) => {
  const authors = (item.author || []).map((a) => `${a.family}${a.given ? ", " + a.given : ""}`).join(" and ");
  const year = item.published?.["date-parts"]?.[0]?.[0] || "n.d.";
  const title = item.title?.[0] || "Untitled";
  const journal = item["container-title"]?.[0] || "";
  const doi = item.DOI || "";
  const firstAuthor = item.author?.[0]?.family || "Unknown";
  const cleanTitle = title.split(" ")[0].replace(/[^a-zA-Z0-9]/g, "");
  const id = `${firstAuthor}${year}${cleanTitle}`;
  let bib = `@article{${id},
  title={${title}},
  author={${authors}},
  year={${year}}`;
  if (journal) bib += `,
  journal={${journal}}`;
  if (doi) bib += `,
  doi={${doi}}`;
  bib += `
}`;
  return bib;
};
var checkReference = async (rawQuery, expected, originalQuery) => {
  try {
    const query = cleanQuery(rawQuery);
    const validationQuery = originalQuery ? cleanQuery(originalQuery) : query;
    const cleanedExpected = expected ? {
      ...expected,
      title: expected.title ? cleanQuery(expected.title) : expected.title,
      authors: expected.authors ? cleanQuery(expected.authors) : expected.authors,
      journal: expected.journal ? cleanQuery(expected.journal) : expected.journal
    } : expected;
    expected = cleanedExpected;
    const response = await fetch(`https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=5`);
    if (!response.ok) {
      return {
        exists: false,
        source: "NotFound",
        matchConfidence: 0,
        titleMatchScore: 0,
        authorMatchScore: 0,
        journalMatchScore: 0,
        issues: []
      };
    }
    const data = await response.json();
    const items = data.message?.items || [];
    if (items.length > 0) {
      const nQuery = normalize2(query);
      const getAllYears = (item2) => {
        const years = /* @__PURE__ */ new Set();
        const dateFields = ["published", "published-print", "published-online", "issued", "created"];
        for (const field of dateFields) {
          const year = item2[field]?.["date-parts"]?.[0]?.[0];
          if (year) years.add(year.toString());
        }
        return [...years];
      };
      const getPrimaryYear = (item2) => {
        return item2["published-print"]?.["date-parts"]?.[0]?.[0]?.toString() || item2.published?.["date-parts"]?.[0]?.[0]?.toString() || item2.issued?.["date-parts"]?.[0]?.[0]?.toString() || "";
      };
      let bestItem = items[0];
      let bestCombinedScore = -1;
      for (const item2 of items) {
        const iTitle = item2.title?.[0] || "";
        const iYears = getAllYears(item2);
        const iPrimaryYear = getPrimaryYear(item2);
        const iJournal = item2["container-title"]?.[0] || "";
        let titleScore = 0;
        if (expected?.title) {
          titleScore = calculateSimilarity(expected.title, iTitle);
        } else {
          const nTitle = normalize2(iTitle);
          if (nTitle && (nQuery.includes(nTitle) || nTitle.includes(nQuery))) {
            titleScore = 100;
          } else {
            const titleWords = nTitle.split(/\s+/).filter((w) => w.length >= 3);
            const queryWords = nQuery.split(/\s+/).filter((w) => w.length >= 3);
            const matchingTitleWords = titleWords.filter((w) => nQuery.includes(w));
            const wordOverlap = titleWords.length > 0 ? matchingTitleWords.length / titleWords.length : 0;
            const matchingQueryWords = queryWords.filter((w) => nTitle.includes(w));
            const reverseOverlap = queryWords.length > 0 ? matchingQueryWords.length / queryWords.length : 0;
            if (wordOverlap >= 0.8 && reverseOverlap >= 0.4) {
              titleScore = Math.round(85 + wordOverlap * 15);
            } else {
              titleScore = calculateSimilarity(query, iTitle);
            }
          }
        }
        let combinedScore = titleScore * 3;
        if (expected?.year) {
          if (iYears.includes(expected.year)) {
            combinedScore += 40;
          } else if (iPrimaryYear && Math.abs(parseInt(expected.year) - parseInt(iPrimaryYear)) <= 1) {
            combinedScore += 10;
          }
        } else if (!expected?.title) {
          const yearsInQuery = Array.from(query.match(/\b(19|20)\d{2}\b/g) || []);
          if (yearsInQuery.length > 0 && iYears.some((y) => yearsInQuery.includes(y))) {
            combinedScore += 30;
          }
        }
        if (expected?.journal && iJournal) {
          const jSim = calculateSimilarity(expected.journal, iJournal);
          combinedScore += Math.round(jSim * 0.2);
        }
        if (combinedScore > bestCombinedScore) {
          bestCombinedScore = combinedScore;
          bestItem = item2;
        }
      }
      const item = bestItem;
      const resultTitle = item.title?.[0] || "";
      const resultAuthors = (item.author || []).map((a) => a.family).join(", ");
      const resultYear = getPrimaryYear(item);
      const resultAllYears = getAllYears(item);
      const resultJournal = item["container-title"]?.[0] || "";
      let titleSim = 0;
      if (expected?.title) {
        titleSim = calculateSimilarity(expected.title, resultTitle);
      } else {
        const nTitle = normalize2(resultTitle);
        if (nQuery.includes(nTitle) || nTitle.includes(nQuery)) {
          titleSim = 100;
        } else {
          const titleWords = nTitle.split(/\s+/).filter((w) => w.length >= 3);
          const queryWords = nQuery.split(/\s+/).filter((w) => w.length >= 3);
          const matchingTitleWords = titleWords.filter((w) => nQuery.includes(w));
          const wordOverlap = titleWords.length > 0 ? matchingTitleWords.length / titleWords.length : 0;
          const matchingQueryWords = queryWords.filter((w) => nTitle.includes(w));
          const reverseOverlap = queryWords.length > 0 ? matchingQueryWords.length / queryWords.length : 0;
          if (wordOverlap >= 0.8 && reverseOverlap >= 0.4) {
            titleSim = Math.round(85 + wordOverlap * 15);
          } else {
            titleSim = calculateSimilarity(query, resultTitle);
          }
        }
      }
      if (titleSim < MIN_TITLE_SIMILARITY) {
        return {
          exists: false,
          source: "NotFound",
          matchConfidence: 0,
          titleMatchScore: titleSim,
          authorMatchScore: 0,
          journalMatchScore: 0,
          issues: ["Title not found \u2014 no sufficiently similar result in CrossRef"]
        };
      }
      let authorSim = 0;
      let journalSim = 0;
      let overallSim = 0;
      const issues = [];
      const nResultTitle = normalize2(resultTitle);
      const realAuthorFamilies = (item.author || []).map((a) => normalize2(a.family || "")).filter((name) => name.length > 1);
      const realAuthorGivens = (item.author || []).map((a) => (a.given || "").trim()).filter((name) => name.length > 0);
      if (expected?.title) {
        if (expected.authors) {
          const normExpected = normalize2(expected.authors);
          const authorsFound = realAuthorFamilies.filter((author) => normExpected.includes(author));
          const hasEtAlBatch = /\bet\s+al\.?|and\s+others\b/i.test(expected.authors);
          if (authorsFound.length > 0) {
            if (hasEtAlBatch) {
              authorSim = 100;
            } else {
              authorSim = Math.min(100, Math.round(authorsFound.length / realAuthorFamilies.length * 100));
            }
          } else {
            authorSim = calculateSimilarity(expected.authors, resultAuthors);
          }
          const decodedExpectedAuthors = decodeLatex(expected.authors);
          const expectedList = decodedExpectedAuthors.split(/[,&]|\sand\s/i).map((s) => s.trim()).filter((s) => s.length > 1);
          const extraAuthors = [];
          for (const expAuth of expectedList) {
            const nExp = normalize2(expAuth);
            const matchesFamily = realAuthorFamilies.some((real) => real.includes(nExp) || nExp.includes(real));
            const matchesGiven = realAuthorGivens.some((given) => firstLetterMatches(expAuth, given));
            if (!matchesFamily && !matchesGiven) {
              if (!expAuth.toLowerCase().includes("et al") && !expAuth.toLowerCase().includes("others") && !expAuth.toLowerCase().includes("al.")) {
                extraAuthors.push(expAuth);
              }
            }
          }
          if (extraAuthors.length > 0) {
            issues.push(`Extra/Fake Authors detected: ${extraAuthors.join(", ")}`);
            authorSim -= 20 * extraAuthors.length;
          }
        } else {
          authorSim = 100;
        }
        if (expected.journal) {
          const publisherNames = /\b(springer|elsevier|wiley|routledge|sage|cambridge|oxford|harvard|princeton|edward\s+elgar|mcgraw.hill|pearson|academic\s+press|lexington\s+books?|university\s+press|palgrave|macmillan|taylor\s+&?\s*francis|ieee|acm)\b/gi;
          const cleanExpectedJournal = expected.journal.replace(/^\/\/\s*/, "").replace(/\.\s*$/, "").replace(publisherNames, "").replace(/publishing/gi, "").replace(/\b\d{1,5}\s*[-–]\s*\d{1,5}\b/g, "").replace(/[:,]\s*$/, "").replace(/\s{2,}/g, " ").trim();
          journalSim = calculateSimilarity(cleanExpectedJournal, resultJournal);
          const nExpJ = normalize2(cleanExpectedJournal);
          const nResJ = normalize2(resultJournal);
          if (journalSim < 90 && (nExpJ.includes(nResJ) || nResJ.includes(nExpJ))) {
            journalSim = 95;
          }
          if (journalSim < 50) {
            const expectedIsPreprint = isPreprint(expected.journal);
            const resultIsPreprint = isPreprint(resultJournal);
            if (expectedIsPreprint !== resultIsPreprint && titleSim > 70) {
              issues.push(`Version difference: "${expected.journal}" vs "${resultJournal}" (preprint/published)`);
              journalSim = 70;
            }
          }
        } else {
          journalSim = 100;
        }
        let yearSim = 100;
        if (expected.year && resultYear) {
          if (expected.year === resultYear || resultAllYears.includes(expected.year)) {
            yearSim = 100;
          } else {
            const yearDiff = Math.abs(parseInt(expected.year) - parseInt(resultYear));
            const eitherIsPreprint = isPreprint(expected.journal || "") || isPreprint(resultJournal);
            if (yearDiff <= 2 && eitherIsPreprint) {
              yearSim = 85;
              issues.push(`Year differs by ${yearDiff} year(s): expected ${expected.year}, found ${resultYear} (likely preprint/published version)`);
            } else if (yearDiff <= 2 && titleSim > 80) {
              yearSim = 85;
              issues.push(`Note: expected ${expected.year}, CrossRef shows ${resultYear} (likely online-first vs print date)`);
            } else if (yearDiff === 1 && titleSim > 70) {
              yearSim = 75;
              issues.push(`Year differs by 1: expected ${expected.year}, found ${resultYear} (possible version difference)`);
            } else {
              yearSim = 0;
              issues.push(`Year Mismatch: expected ${expected.year}, found ${resultYear}`);
            }
          }
        }
        overallSim = (titleSim + authorSim + journalSim + yearSim) / 4;
      } else {
        const nValidation = normalize2(validationQuery);
        const hasEtAl = /\bet\s+al\.?/i.test(validationQuery);
        if (titleSim < 95 && nValidation.includes(nResultTitle)) {
          titleSim = 95;
        }
        const authorsFound = realAuthorFamilies.filter((author) => nValidation.includes(author));
        const authorsMissing = realAuthorFamilies.filter((author) => !nValidation.includes(author));
        if (authorsFound.length === realAuthorFamilies.length) {
          authorSim = 100;
        } else if (authorsFound.length > 0) {
          if (hasEtAl) {
            authorSim = 100;
          } else {
            authorSim = Math.round(authorsFound.length / realAuthorFamilies.length * 100);
          }
          if (authorsMissing.length > 0 && titleSim > 70) {
          }
        } else {
          authorSim = 0;
          if (titleSim > 80) {
            issues.push(`Author Mismatch: none of the real authors found`);
          }
        }
        const cleanedValidation = validationQuery.replace(/\[\s*[JMCDRSZN]\s*\]/g, "").replace(/\/\/[^.]+/g, "").replace(/DOI\s*[:：]\s*[^\s,]+/gi, "").replace(/https?:\/\/[^\s,]+/gi, "").replace(/\b[Pp]{1,2}\.?\s*\d+[-–]\d+/g, "").replace(/\b\d{1,5}\s*[-–]\s*\d{1,5}\b/g, "").replace(/\b\d{1,4}\s*\(\d{1,4}\)/g, "").replace(/\b[Vv]ol\.?\s*\d+/g, "").replace(/\b[Nn]o\.?\s*\d+/g, "").replace(/\(?\b(19|20)\d{2}\b\)?/g, "").replace(/\bet\s+al\.?/gi, "").replace(/\s{2,}/g, " ").trim();
        const queryTokens = cleanedValidation.split(/[\s,.:;()]+/);
        const potentialFakeAuthors = [];
        const stopWords = /* @__PURE__ */ new Set([
          // Generic metadata
          "vol",
          "issue",
          "doi",
          "http",
          "https",
          "org",
          "com",
          "www",
          "pages",
          "page",
          "chapter",
          "edition",
          "eds",
          "editor",
          "editors",
          "proceedings",
          "conference",
          "symposium",
          "workshop",
          "series",
          "isbn",
          "issn",
          "abstract",
          "available",
          "accessed",
          "online",
          "retrieved",
          // Publishers
          "publishing",
          "publisher",
          "publishers",
          "press",
          "books",
          "springer",
          "elsevier",
          "wiley",
          "routledge",
          "mcgraw",
          "pearson",
          "academic",
          "lexington",
          "edward",
          "elgar",
          "sage",
          "informa",
          "palgrave",
          "macmillan",
          "kluwer",
          "emerald",
          "ieee",
          "acm",
          "taylor",
          "francis",
          "dekker",
          "plenum",
          "pergamon",
          "addison",
          // University presses and locations
          "cambridge",
          "oxford",
          "harvard",
          "princeton",
          "stanford",
          "chicago",
          "columbia",
          "yale",
          "university",
          "institute",
          "school",
          "dordrecht",
          "netherlands",
          "london",
          "york",
          "berlin",
          "heidelberg",
          // Common reference words
          "translated",
          "revised",
          "reprint",
          "forthcoming",
          "review",
          "journal",
          "annals",
          "bulletin",
          "quarterly",
          "international",
          "national",
          "american",
          "european",
          "british",
          // Common short title words that get capitalized at start
          "from",
          "with",
          "than",
          "into",
          "upon",
          "about",
          "between",
          "through",
          "toward",
          "towards",
          "across",
          "beyond"
        ]);
        const resultPublisher = normalize2(item.publisher || "");
        const allContainerTitles = (item["container-title"] || []).map((t) => normalize2(t)).join(" ");
        for (const token of queryTokens) {
          const nToken = normalize2(token);
          if (nToken.length < 4) continue;
          if (!/^[A-Z]/.test(token)) continue;
          if (/^\d+$/.test(token)) continue;
          if (stopWords.has(nToken)) continue;
          if (nResultTitle.includes(nToken)) continue;
          if (resultJournal && normalize2(resultJournal).includes(nToken)) continue;
          if (resultYear && resultYear.includes(token)) continue;
          if (resultPublisher && resultPublisher.includes(nToken)) continue;
          if (allContainerTitles && allContainerTitles.includes(nToken)) continue;
          const isRealAuthorFamily = realAuthorFamilies.some(
            (real) => real.includes(nToken) || nToken.includes(real) || // Also check individual words of multi-word family names
            real.split(/\s+/).some((part) => part === nToken || nToken === part)
          );
          const isRealAuthorGiven = realAuthorGivens.some((given) => firstLetterMatches(token, given));
          if (!isRealAuthorFamily && !isRealAuthorGiven) {
            potentialFakeAuthors.push(token);
          }
        }
        if (potentialFakeAuthors.length > 0) {
          const uniqueFakes = [...new Set(potentialFakeAuthors)];
          if (uniqueFakes.length <= 5) {
            issues.push(`Possible Extra/Fake Authors: ${uniqueFakes.join(", ")}`);
            authorSim -= 10 * uniqueFakes.length;
          }
        }
        if (hasEtAl) {
          issues.push(`Note: You used 'et al.', please verify if your citation style allows it`);
        }
        if (resultJournal && resultJournal.length > 3) {
          const journalWords = normalize2(resultJournal).split(/\s+/).filter((w) => w.length >= 4);
          const journalInQuery = journalWords.some((word) => nValidation.includes(word));
          if (journalInQuery) {
            journalSim = 100;
          } else if (isPreprint(resultJournal)) {
            journalSim = 60;
            if (titleSim > 70) {
              issues.push(`Note: CrossRef returned preprint venue "${resultJournal}"`);
            }
          } else {
            journalSim = 0;
            if (titleSim > 70) {
              issues.push(`Journal Mismatch: actual is "${resultJournal}"`);
            }
          }
        } else {
          journalSim = 50;
        }
        if (resultYear && resultYear.length === 4) {
          const yearsInQuery = validationQuery.match(/\b(19|20)\d{2}\b/g) || [];
          if (yearsInQuery.includes(resultYear) || yearsInQuery.some((y) => resultAllYears.includes(y))) {
          } else if (yearsInQuery.length > 0) {
            const yearDiff = Math.abs(parseInt(yearsInQuery[0]) - parseInt(resultYear));
            const resultIsPreprint = isPreprint(resultJournal);
            if (yearDiff <= 2 && resultIsPreprint) {
              issues.push(`Note: year ${yearsInQuery[0]} vs ${resultYear} (preprint/published version difference)`);
              overallSim -= 5;
            } else if (yearDiff <= 2 && titleSim > 80) {
              issues.push(`Note: year ${yearsInQuery[0]} vs ${resultYear} (likely online-first vs print date)`);
              overallSim -= 5;
            } else if (yearDiff === 1 && titleSim > 70) {
              issues.push(`Year differs by 1: you wrote ${yearsInQuery[0]}, actual is ${resultYear} (possible version difference)`);
              overallSim -= 10;
            } else {
              issues.push(`Year Mismatch: you wrote ${yearsInQuery[0]}, actual is ${resultYear}`);
              overallSim -= 25;
            }
          }
        }
        if (titleSim > 80) {
          if (authorSim >= 90) {
            overallSim = titleSim;
          } else {
            overallSim = titleSim - (100 - authorSim) * 0.5;
          }
        } else {
          overallSim = (titleSim + authorSim) / 2;
        }
        if (journalSim === 0 && titleSim > 60) {
          overallSim -= 15;
        }
        overallSim = Math.max(0, overallSim);
      }
      let confidence = overallSim;
      if (titleSim < 70) {
        issues.push("Title mismatch");
        confidence -= 20;
      }
      if (expected?.authors && authorSim < 50) {
        issues.push("Authors mismatch");
        confidence -= 20;
      }
      if (expected?.journal && journalSim < 70) {
        if (journalSim < 40) {
          issues.push(`Journal mismatch: "${expected.journal}" vs "${resultJournal}"`);
          confidence -= 20;
        } else {
          issues.push(`Journal differs: "${expected.journal}" vs "${resultJournal}"`);
          confidence -= 10;
        }
      }
      if (confidence > 100) confidence = 100;
      if (confidence < 0) confidence = 0;
      const isDefiniteMatch = titleSim > 85 && authorSim > 80;
      if (isDefiniteMatch && confidence <= 80) {
        confidence = Math.max(65, confidence);
      }
      if (!isDefiniteMatch && (confidence < 40 || issues.length >= 3)) {
        return {
          exists: false,
          source: "NotFound",
          matchConfidence: 0,
          titleMatchScore: titleSim,
          authorMatchScore: authorSim,
          journalMatchScore: journalSim,
          issues: ["Result rejected \u2014 too many mismatches (likely wrong paper found)"]
        };
      }
      const isRetracted = nResultTitle.includes("retract") || nResultTitle.includes("withdraw") || item["update-to"] && Array.isArray(item["update-to"]) && item["update-to"].some((u) => u.type === "retraction");
      if (isRetracted && !issues.some((i) => i.includes("RETRACTED"))) {
        issues.push("\u{1F6A8} WARNING: This article has been RETRACTED or WITHDRAWN.");
      }
      return {
        exists: true,
        title: resultTitle,
        authors: resultAuthors,
        year: resultYear,
        journal: resultJournal,
        url: item.URL,
        doi: item.DOI,
        score: item.score,
        citations: item["is-referenced-by-count"] || 0,
        retracted: isRetracted,
        apa: formatAPA(item),
        mla: formatMLA(item),
        iso690: formatISO690(item),
        bibtex: generateBibTeX(item),
        source: "CrossRef",
        matchConfidence: confidence,
        titleMatchScore: titleSim,
        authorMatchScore: authorSim,
        journalMatchScore: journalSim,
        issues
      };
    }
    return {
      exists: false,
      source: "NotFound",
      matchConfidence: 0,
      titleMatchScore: 0,
      authorMatchScore: 0,
      journalMatchScore: 0,
      issues: []
    };
  } catch (error) {
    console.error("Search failed", error);
    return {
      exists: false,
      source: "NotFound",
      matchConfidence: 0,
      titleMatchScore: 0,
      authorMatchScore: 0,
      journalMatchScore: 0,
      issues: []
    };
  }
};
var scoreCandidateResult = (titleSim, authorSim, resultYear, resultJournal, expectedYear, expectedJournal) => {
  let score = (titleSim * 2 + authorSim) / 3;
  if (expectedYear && resultYear) {
    if (resultYear === expectedYear) {
      score += 40;
    } else if (Math.abs(parseInt(expectedYear) - parseInt(resultYear)) <= 1) {
      score += 15;
    } else if (Math.abs(parseInt(expectedYear) - parseInt(resultYear)) <= 2) {
      score += 5;
    }
  }
  if (expectedJournal && resultJournal) {
    const jSim = calculateSimilarity(expectedJournal, resultJournal);
    score += Math.round(jSim * 0.3);
  }
  return score;
};
var resolveByDOI = async (doi, expected, query) => {
  try {
    const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//i, "").trim();
    const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}`);
    if (!response.ok) return null;
    const data = await response.json();
    const item = data.message;
    if (!item) return null;
    const resultTitle = item.title?.[0] || "";
    const resultAuthors = (item.author || []).map((a) => a.family).join(", ");
    const resultYear = item["published-print"]?.["date-parts"]?.[0]?.[0]?.toString() || item.published?.["date-parts"]?.[0]?.[0]?.toString() || item.issued?.["date-parts"]?.[0]?.[0]?.toString() || "";
    const resultJournal = item["container-title"]?.[0] || "";
    const isRetracted = Boolean(item["update-to"]?.some?.((u) => u.type === "retraction") || item["relation"]?.["is-retracted-by"]?.length > 0);
    const issues = [];
    if (isRetracted) {
      issues.push("\u26A0\uFE0F This paper has been RETRACTED");
    }
    const titleSim = computeTitleSim(expected?.title || query || "", resultTitle);
    let matchConfidence = 100;
    if (titleSim < 70) {
      matchConfidence = 50;
      issues.push(`\u26A0\uFE0F Title mismatch with DOI metadata. Found: "${resultTitle}"`);
    } else if (titleSim < 85) {
      matchConfidence = 80;
      issues.push(`Note: Title from DOI slightly differs from input.`);
    }
    return {
      exists: true,
      title: resultTitle,
      authors: resultAuthors,
      year: resultYear,
      journal: resultJournal,
      url: item.URL,
      doi: item.DOI,
      score: 100,
      retracted: isRetracted,
      apa: formatAPA(item),
      bibtex: generateBibTeX(item),
      source: "CrossRef",
      matchConfidence,
      titleMatchScore: titleSim,
      authorMatchScore: 100,
      // Hardcoded for simplicity as DOI guarantees author if title matches
      journalMatchScore: 100,
      issues
    };
  } catch {
    return null;
  }
};
var extractDOI = (text) => {
  const patterns = [
    /(?:DOI\s*[：:]\s*)(10\.\d{4,9}\/[^\s,;]+)/i,
    /(?:https?:\/\/doi\.org\/)(10\.\d{4,9}\/[^\s,;]+)/i,
    /\b(10\.\d{4,9}\/[^\s,;]+)/
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].replace(/[.\s]+$/, "");
  }
  return null;
};
var extractArxivId = (text) => {
  const patterns = [
    /\barXiv[:\s]+([\d.]+(?:v\d+)?)/i,
    // arXiv:2301.12345 or arXiv: 2301.12345
    /arxiv\.org\/(?:abs|pdf)\/([\d.]+(?:v\d+)?)/i,
    // arxiv.org/abs/2301.12345
    /10\.48550\/arXiv\.([\d.]+(?:v\d+)?)/i,
    // 10.48550/arXiv.2301.12345
    /\b(\d{4}\.\d{4,5}(?:v\d+)?)\b/
    // Bare ID: 2301.12345
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].replace(/v\d+$/, "");
  }
  return null;
};
var _checkWithFallback = async (query, expected, originalQuery) => {
  const queryDOI = extractDOI(originalQuery || query);
  let invalidDoiIssue = "";
  if (queryDOI) {
    const arxivFromDoi = queryDOI.match(/10\.48550\/arXiv\.([\d.]+)/i);
    if (arxivFromDoi) {
      const arxivDirectResult = await resolveArxivById(arxivFromDoi[1]);
      if (arxivDirectResult) {
        return {
          exists: true,
          title: arxivDirectResult.title,
          authors: arxivDirectResult.authors.join(", "),
          year: arxivDirectResult.year?.toString() || "",
          journal: arxivDirectResult.category ? `arXiv [${arxivDirectResult.category}]` : "arXiv preprint",
          url: arxivDirectResult.url,
          doi: queryDOI,
          apa: formatArxivAPA(arxivDirectResult),
          mla: formatArxivMLA(arxivDirectResult),
          iso690: formatArxivISO690(arxivDirectResult),
          bibtex: generateArxivBibTeX(arxivDirectResult),
          source: "Arxiv",
          matchConfidence: 100,
          titleMatchScore: 100,
          authorMatchScore: 100,
          journalMatchScore: 100,
          issues: []
        };
      }
    }
    const doiResult = await resolveByDOI(queryDOI, expected, originalQuery || query);
    if (doiResult) {
      return doiResult;
    } else {
      invalidDoiIssue = `\u26A0\uFE0F The provided DOI (${queryDOI}) is invalid or points to an unrelated article.`;
    }
  }
  const arxivId = extractArxivId(originalQuery || query);
  if (arxivId && !queryDOI) {
    const arxivDirectResult = await resolveArxivById(arxivId);
    if (arxivDirectResult) {
      const titleSim = expected?.title ? computeTitleSim(expected.title, arxivDirectResult.title) : 90;
      if (titleSim >= MIN_TITLE_SIMILARITY || !expected?.title) {
        return {
          exists: true,
          title: arxivDirectResult.title,
          authors: arxivDirectResult.authors.join(", "),
          year: arxivDirectResult.year?.toString() || "",
          journal: arxivDirectResult.category ? `arXiv [${arxivDirectResult.category}]` : "arXiv preprint",
          url: arxivDirectResult.url,
          doi: arxivDirectResult.doi || void 0,
          apa: formatArxivAPA(arxivDirectResult),
          mla: formatArxivMLA(arxivDirectResult),
          iso690: formatArxivISO690(arxivDirectResult),
          bibtex: generateArxivBibTeX(arxivDirectResult),
          source: "Arxiv",
          matchConfidence: Math.min(100, titleSim + 5),
          titleMatchScore: titleSim,
          authorMatchScore: 100,
          journalMatchScore: 100,
          issues: []
        };
      }
    }
  }
  const title = expected?.title || extractLikelyTitle(query) || query;
  const extractSource = originalQuery || query;
  const extractedYears = !expected?.year ? Array.from(extractSource.match(/\b(19|20)\d{2}\b/g) || []) : [];
  const expectedYear = expected?.year || (extractedYears.length > 0 ? String(extractedYears[0]) : void 0);
  const expectedJournal = expected?.journal;
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const futureYearIssues = [];
  if (expectedYear && parseInt(expectedYear) > currentYear + 1) {
    futureYearIssues.push(`\u26A0\uFE0F Year ${expectedYear} is in the future \u2014 verify this is correct`);
  }
  const fallbackSearchTitle = expected?.title || extractLikelyTitle(query) || query;
  let precisionSearchTitle = fallbackSearchTitle;
  if (expected?.authors) {
    const firstAuthor = expected.authors.split(/,| and /)[0].trim().split(/\s+/).pop();
    if (firstAuthor && firstAuthor.length > 1) {
      precisionSearchTitle = `${fallbackSearchTitle} ${firstAuthor}`;
    }
  }
  const crossRefQuery = expected ? query : fallbackSearchTitle;
  const crossRefPromise = checkReference(crossRefQuery, expected, originalQuery || (expected ? void 0 : query));
  const ssPromise = searchSemanticScholar(fallbackSearchTitle, expectedYear).catch(() => null);
  const oaPromise = searchOpenAlex(fallbackSearchTitle, expectedYear).catch(() => null);
  const arxivPromise = searchArxiv(precisionSearchTitle, expectedYear).catch(() => null);
  const dblpPromise = searchDblp(precisionSearchTitle, expectedYear).catch(() => null);
  const [crossRefResult, ssResult, oaResult] = await Promise.all([crossRefPromise, ssPromise, oaPromise]);
  const candidates = [];
  if (crossRefResult.exists) {
    candidates.push({
      source: "CrossRef",
      result: crossRefResult,
      score: scoreCandidateResult(
        crossRefResult.titleMatchScore,
        crossRefResult.authorMatchScore,
        crossRefResult.year,
        crossRefResult.journal,
        expectedYear,
        expectedJournal
      ),
      titleSim: crossRefResult.titleMatchScore
    });
  }
  if (ssResult) {
    const ssTitleSim = computeTitleSim(title, ssResult.title);
    const ssAuthorSim = computeAuthorSim(expected?.authors || query, ssResult.authors);
    if (ssTitleSim >= MIN_TITLE_SIMILARITY) {
      const ssScore = scoreCandidateResult(
        ssTitleSim,
        ssAuthorSim,
        ssResult.year?.toString(),
        ssResult.venue,
        expectedYear,
        expectedJournal
      );
      const confidence = (ssTitleSim * 2 + ssAuthorSim) / 3;
      candidates.push({
        source: "SemanticScholar",
        result: {
          exists: true,
          title: ssResult.title,
          authors: ssResult.authors.join(", "),
          year: ssResult.year?.toString() || "",
          journal: ssResult.venue,
          url: ssResult.url,
          doi: ssResult.externalIds?.DOI,
          citations: ssResult.citationCount,
          retracted: ssResult.isRetracted,
          apa: formatSemanticScholarAPA(ssResult),
          mla: formatSemanticScholarMLA(ssResult),
          iso690: formatSemanticScholarISO690(ssResult),
          bibtex: generateSemanticScholarBibTeX(ssResult),
          source: "SemanticScholar",
          matchConfidence: Math.min(95, confidence),
          titleMatchScore: ssTitleSim,
          authorMatchScore: ssAuthorSim,
          journalMatchScore: ssResult.venue ? 90 : 50,
          issues: ssAuthorSim < 50 ? [`Author Mismatch in Semantic Scholar fallback`] : []
        },
        score: ssScore,
        titleSim: ssTitleSim
      });
    }
  }
  if (oaResult) {
    const oaTitleSim = computeTitleSim(title, oaResult.title);
    const oaAuthorSim = computeAuthorSim(expected?.authors || query, oaResult.authors);
    if (oaTitleSim >= MIN_TITLE_SIMILARITY) {
      const oaScore = scoreCandidateResult(
        oaTitleSim,
        oaAuthorSim,
        oaResult.year?.toString(),
        oaResult.journal,
        expectedYear,
        expectedJournal
      );
      const confidence = (oaTitleSim * 2 + oaAuthorSim) / 3;
      candidates.push({
        source: "OpenAlex",
        result: {
          exists: true,
          title: oaResult.title,
          authors: oaResult.authors.join(", "),
          year: oaResult.year?.toString() || "",
          journal: oaResult.journal,
          url: oaResult.url,
          doi: oaResult.doi || void 0,
          citations: oaResult.citations,
          retracted: oaResult.isRetracted,
          apa: formatOpenAlexAPA(oaResult),
          mla: formatOpenAlexMLA(oaResult),
          iso690: formatOpenAlexISO690(oaResult),
          bibtex: generateOpenAlexBibTeX(oaResult),
          source: "OpenAlex",
          matchConfidence: Math.min(90, confidence),
          titleMatchScore: oaTitleSim,
          authorMatchScore: oaAuthorSim,
          journalMatchScore: oaResult.journal ? 85 : 50,
          issues: oaAuthorSim < 50 ? [`Author Mismatch in OpenAlex fallback`] : []
        },
        score: oaScore,
        titleSim: oaTitleSim
      });
    }
  }
  let primaryBest = null;
  if (candidates.length > 0) {
    candidates.sort((a, b) => b.score - a.score);
    primaryBest = candidates[0];
    if (primaryBest.result.authorMatchScore >= 70 && primaryBest.titleSim >= 85) {
      if (primaryBest.source === "CrossRef") {
        const otherBest = candidates.find((c) => c.source !== "CrossRef");
        if (otherBest && otherBest.score > primaryBest.score) {
          const winner2 = otherBest.result;
          winner2.issues = [`Better match found in ${otherBest.source} (CrossRef confidence was ${primaryBest.result.matchConfidence}%)`];
          return winner2;
        }
        if (futureYearIssues.length > 0) crossRefResult.issues = [...crossRefResult.issues, ...futureYearIssues];
        if (invalidDoiIssue) crossRefResult.issues.push(invalidDoiIssue);
        return crossRefResult;
      }
      const winner = primaryBest.result;
      if (crossRefResult.exists) {
        winner.issues = [`Better match found in ${primaryBest.source} (CrossRef confidence was ${crossRefResult.matchConfidence}%)`];
      }
      if (futureYearIssues.length > 0) winner.issues = [...winner.issues, ...futureYearIssues];
      if (invalidDoiIssue) winner.issues.push(invalidDoiIssue);
      return winner;
    }
  }
  const [arxivResult, dblpResult] = await Promise.all([arxivPromise, dblpPromise]);
  const fallbackCandidates = [];
  if (arxivResult) {
    const arxivTitleSim = computeTitleSim(title, arxivResult.title);
    const arxivAuthorSim = computeAuthorSim(expected?.authors || query, arxivResult.authors);
    if (arxivTitleSim >= MIN_TITLE_SIMILARITY) {
      const arxivScore = scoreCandidateResult(arxivTitleSim, arxivAuthorSim, arxivResult.year?.toString(), arxivResult.category, expectedYear, expectedJournal);
      const confidence = (arxivTitleSim * 2 + arxivAuthorSim) / 3;
      fallbackCandidates.push({
        source: "Arxiv",
        result: {
          exists: true,
          title: arxivResult.title,
          authors: arxivResult.authors.join(", "),
          year: arxivResult.year?.toString() || "",
          journal: arxivResult.category ? `arXiv [${arxivResult.category}]` : "arXiv preprint",
          url: arxivResult.url,
          doi: arxivResult.doi || void 0,
          apa: formatArxivAPA(arxivResult),
          mla: formatArxivMLA(arxivResult),
          iso690: formatArxivISO690(arxivResult),
          bibtex: generateArxivBibTeX(arxivResult),
          source: "Arxiv",
          matchConfidence: Math.min(90, confidence),
          titleMatchScore: arxivTitleSim,
          authorMatchScore: arxivAuthorSim,
          journalMatchScore: arxivResult.category ? 80 : 50,
          issues: [
            "Found in arXiv (not indexed in CrossRef, Semantic Scholar, or OpenAlex)",
            ...arxivAuthorSim < 50 ? ["Author Mismatch in arXiv fallback"] : [],
            ...futureYearIssues
          ]
        },
        score: arxivScore,
        titleSim: arxivTitleSim
      });
    }
  }
  if (dblpResult) {
    const dblpTitleSim = computeTitleSim(title, dblpResult.title);
    const dblpAuthorSim = computeAuthorSim(expected?.authors || query, dblpResult.authors);
    if (dblpTitleSim >= MIN_TITLE_SIMILARITY) {
      const dblpScore = scoreCandidateResult(dblpTitleSim, dblpAuthorSim, dblpResult.year?.toString(), dblpResult.venue, expectedYear, expectedJournal);
      const confidence = (dblpTitleSim * 2 + dblpAuthorSim) / 3;
      fallbackCandidates.push({
        source: "DBLP",
        result: {
          exists: true,
          title: dblpResult.title,
          authors: dblpResult.authors.join(", "),
          year: dblpResult.year?.toString() || "",
          journal: dblpResult.venue,
          url: dblpResult.eeUrl || dblpResult.url,
          doi: dblpResult.doi || void 0,
          apa: formatDblpAPA(dblpResult),
          mla: formatDblpMLA(dblpResult),
          iso690: formatDblpISO690(dblpResult),
          bibtex: generateDblpBibTeX(dblpResult),
          source: "DBLP",
          matchConfidence: Math.min(90, confidence),
          titleMatchScore: dblpTitleSim,
          authorMatchScore: dblpAuthorSim,
          journalMatchScore: dblpResult.venue ? 85 : 50,
          issues: [
            "Found in DBLP (not indexed in CrossRef, Semantic Scholar, or OpenAlex)",
            ...dblpAuthorSim < 50 ? ["Author Mismatch in DBLP fallback"] : [],
            ...futureYearIssues
          ]
        },
        score: dblpScore,
        titleSim: dblpTitleSim
      });
    }
  }
  candidates.push(...fallbackCandidates);
  if (candidates.length > 0) {
    candidates.sort((a, b) => b.score - a.score);
    const best = candidates[0];
    if (best.source === "CrossRef") {
      const otherBest = candidates.find((c) => c.source !== "CrossRef");
      if (otherBest && otherBest.score > best.score) {
        const winner2 = otherBest.result;
        winner2.issues = [`Better match found in ${otherBest.source} (CrossRef confidence was ${best.result.matchConfidence}%)`];
        return winner2;
      }
      if (futureYearIssues.length > 0) crossRefResult.issues = [...crossRefResult.issues, ...futureYearIssues];
      if (invalidDoiIssue) crossRefResult.issues.push(invalidDoiIssue);
      return crossRefResult;
    }
    const winner = best.result;
    if (crossRefResult.exists) {
      winner.issues = [`Better match found in ${best.source} (CrossRef confidence was ${crossRefResult.matchConfidence}%)`];
    }
    if (futureYearIssues.length > 0) winner.issues = [...winner.issues, ...futureYearIssues];
    if (invalidDoiIssue) winner.issues.push(invalidDoiIssue);
    if (winner.titleMatchScore < MIN_TITLE_SIMILARITY) {
      return {
        exists: false,
        source: "NotFound",
        matchConfidence: 0,
        titleMatchScore: 0,
        authorMatchScore: 0,
        journalMatchScore: 0,
        issues: ["Title not found in any source (CrossRef, Semantic Scholar, OpenAlex, DBLP, arXiv)"]
      };
    }
    return winner;
  }
  if (!expected?.title) {
    const extractedTitle = extractLikelyTitle(query);
    if (extractedTitle && extractedTitle !== query) {
      console.log(`[Retry] All sources failed, retrying with extracted title: "${extractedTitle}"`);
      const retryResult = await checkWithFallback(extractedTitle, expected, query);
      if (retryResult.exists) {
        if (invalidDoiIssue && !retryResult.issues.includes(invalidDoiIssue)) {
          retryResult.issues.push(invalidDoiIssue);
        }
        return retryResult;
      }
    }
  }
  if (queryDOI) {
    return {
      exists: true,
      // Force warning instead of NotFound
      title: expected?.title || extractLikelyTitle(query) || "Unknown Title",
      authors: expected?.authors || "",
      year: expectedYear || "",
      journal: expectedJournal || "",
      url: `https://doi.org/${queryDOI}`,
      doi: queryDOI,
      score: 0,
      source: "NotFound",
      matchConfidence: 0,
      // This will make it a Partial Match (Warning)
      titleMatchScore: 0,
      authorMatchScore: 0,
      journalMatchScore: 0,
      issues: [invalidDoiIssue]
    };
  }
  return {
    exists: false,
    source: "NotFound",
    matchConfidence: 0,
    titleMatchScore: 0,
    authorMatchScore: 0,
    journalMatchScore: 0,
    issues: ["Title not found in any source (CrossRef, Semantic Scholar, OpenAlex, DBLP, arXiv)"]
  };
};
var checkWithFallback = async (query, expected, originalQuery) => {
  const result = await _checkWithFallback(query, expected, originalQuery);
  const journalToCheck = result.journal || expected?.journal;
  if (journalToCheck) {
    if (isPredatory(journalToCheck)) {
      result.predatory = true;
    }
  }
  return result;
};
export {
  checkReference,
  checkWithFallback
};
