const express = require("express");
const axios = require("axios");
const { XMLParser } = require("fast-xml-parser");
const OpenAI = require("openai");
const router = express.Router();
const driver = require("../neo4j");
const pdfParse = require("pdf-parse");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ALLOWED_PAPER_TYPES = new Set([
  "Survey",
  "Method",
  "Application",
  "Experiment",
  "Theory",
  "Other",
]);

function normalizePaperType(value) {
  const normalized = String(value || "").trim().toLowerCase();

  if (normalized === "survey") return "Survey";
  if (normalized === "method") return "Method";
  if (normalized === "application") return "Application";
  if (normalized === "experiment") return "Experiment";
  if (normalized === "theory") return "Theory";
  if (normalized === "other") return "Other";
  return "Other";
}

router.get("/arxiv-search", async (req, res) => {
  try {
    const { q = "", start = 0, max_results = 10 } = req.query;

    if (!q.trim()) {
      return res.status(400).json({ error: "Missing search query" });
    }

    const query = encodeURIComponent(q);
    const url = `http://export.arxiv.org/api/query?search_query=${query}&start=${start}&max_results=${max_results}`;

    const response = await axios.get(url, {
      headers: {
        Accept: "application/atom+xml",
      },
      timeout: 10000,
    });

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
    });

    const parsed = parser.parse(response.data);
    const feed = parsed.feed || {};
    let entries = feed.entry || [];

    if (!entries) {
      entries = [];
    } else if (!Array.isArray(entries)) {
      entries = [entries];
    }

    const results = entries.map((entry) => {
      const authors = Array.isArray(entry.author)
        ? entry.author.map((a) => a.name)
        : entry.author
        ? [entry.author.name]
        : [];

      let pdfUrl = "";
      let absUrl = "";

      const links = Array.isArray(entry.link) ? entry.link : entry.link ? [entry.link] : [];

      links.forEach((link) => {
        if (link.title === "pdf") {
          pdfUrl = link.href;
        }
        if (link.rel === "alternate") {
          absUrl = link.href;
        }
      });

      return {
        id: entry.id,
        title: entry.title?.replace(/\s+/g, " ").trim() || "",
        summary: entry.summary?.replace(/\s+/g, " ").trim() || "",
        published: entry.published || "",
        updated: entry.updated || "",
        authors,
        pdfUrl,
        absUrl,
        primaryCategory: entry["arxiv:primary_category"]?.term || "",
        categories: Array.isArray(entry.category)
          ? entry.category.map((c) => c.term).filter(Boolean)
          : entry.category?.term
          ? [entry.category.term]
          : [],
      };
    });

    return res.json({
      totalResults: Number(feed["opensearch:totalResults"] || 0),
      startIndex: Number(feed["opensearch:startIndex"] || start),
      itemsPerPage: Number(feed["opensearch:itemsPerPage"] || max_results),
      results,
    });
  } catch (error) {
    console.error("arXiv search error:", error.message);
    return res.status(500).json({ error: "Failed to fetch arXiv results" });
  }
});

router.post("/interpret-query", async (req, res) => {
  try {
    const { query, scope = "paper" } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ error: "Missing query" });
    }

    const prompt = `
You are a search query assistant for a learning platform.
Convert the user's natural language query into structured search queries.

Rules:
- Return valid JSON only.
- Keep queries concise and searchable.
- For paperQuery, generate a Boolean-style search query suitable for arXiv search.Use operators like AND, OR, and ANDNOT to combine keywords. Focus on key concepts and terms.
- For platformQuery, generate a keyword-style query suitable for searching community posts, resources, and groups.
- Preserve important entities, methods, domains, and concepts.
- Do not add explanations outside JSON.

User query: "${query}"
Search scope: "${scope}"

Return JSON in this format:
{
  "paperQuery": "string",
  "platformQuery": "string",
  "keywords": ["k1", "k2", "k3"]
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You convert natural language learning queries into structured search queries for research papers and platform content.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (parseError) {
      return res.status(500).json({
        error: "Failed to parse AI response",
        raw,
      });
    }

    return res.json({
      paperQuery: parsed.paperQuery || query,
      platformQuery: parsed.platformQuery || query,
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    });
  } catch (error) {
    console.error("interpret-query error:", error);
    return res.status(500).json({ error: "Failed to interpret search query" });
  }
});
  router.post("/explain-paper", async (req, res) => {
    const session = driver.session();
  try {
    const { paperId, title, summary, paperText = "", authors = [], primaryCategory = "" } = req.body;

    if (!paperId ||!title || !summary) {
      return res.status(400).json({ error: "Missing paper Id, title or summary" });
    }
    
    const existingResult = await session.run(

    `
      MATCH (p:Paper {paperId: $paperId})
      RETURN
        p.simple_explanation AS simple_explanation,
        p.why_it_matters AS why_it_matters,
        p.paperType AS paperType
      `,
      { paperId }
    );

    if (existingResult.records.length > 0) {
      const record = existingResult.records[0];
      const simpleExplanation = record.get("simple_explanation");
      const whyItMatters = record.get("why_it_matters");
      const paperType = record.get("paperType");

      if (simpleExplanation && whyItMatters && paperType) {
        return res.json({
          simple_explanation: simpleExplanation,
          why_it_matters: whyItMatters,
          paperType: paperType,
          cached: true,
        });
      }
    }

    // 2. 没有缓存才调用 OpenAI
    const prompt = `
You are an AI learning assistant helping a student understand a research paper.

Paper title: ${title}
Category: ${primaryCategory}
Authors: ${authors.join(", ")}
Abstract/Summary: ${summary}

Return JSON only in this format:
{
  "simple_explanation": "Explain the paper in simple language",
  "why_it_matters": "Why this paper matters",
  "paperType": "Survey / Method / Application / Theory / Experiment / Other"
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You explain research papers in simple learning-oriented language.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return res.status(500).json({
        error: "Failed to parse AI response",
        raw,
      });
    }

    const simpleExplanation = parsed.simple_explanation || "";
    const whyItMatters = parsed.why_it_matters || "";
    const paperType = normalizePaperType(parsed.paperType);

    // 3. 把生成结果写回数据库
    await session.run(
      `
      MERGE (p:Paper {paperId: $paperId})
      SET p.title = $title,
          p.summary = $summary,
          p.authors = $authors,
          p.primaryCategory = $primaryCategory,
          p.simple_explanation = $simpleExplanation,
          p.why_it_matters = $whyItMatters,
          p.paperType = $paperType
      `,
      {
        paperId,
        title,
        summary,
        authors,
        primaryCategory,
        simpleExplanation,
        whyItMatters,
        paperType,
      }
    );

    return res.json({
      simple_explanation: simpleExplanation,
      why_it_matters: whyItMatters,
      paperType: paperType,
      cached: false,
    });
  } catch (error) {
    console.error("explain-paper error:", error);
    return res.status(500).json({ error: "Failed to explain paper" });
  } finally {
    await session.close();
  }
});

  router.post("/save-paper", async (req, res) => {
  const session = driver.session();

  try {
    const { email, topicLabel, paper } = req.body;

    if (!email || !topicLabel || !paper?.paperId) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    await session.run(
      `
      MERGE (u:User {email: $email})

      MERGE (p:Paper {paperId: $paperId})
      SET p.title = $title,
          p.summary = $summary,
          p.authors = $authors,
          p.pdfUrl = $pdfUrl,
          p.absUrl = $absUrl,
          p.published = $published,
          p.primaryCategory = $primaryCategory,
          p.paperType = $paperType

      MERGE (t:TopicTag {name: $topicLabel})

      MERGE (u)-[:SAVED]->(p)
      MERGE (u)-[:USES_TAG]->(t)
      MERGE (p)-[:TAGGED_AS]->(t)
      `,
      {
        email,
        topicLabel,
        paperId: paper.paperId,
        title: paper.title,
        summary: paper.summary || "",
        authors: paper.authors || [],
        pdfUrl: paper.pdfUrl || "",
        absUrl: paper.absUrl || "",
        published: paper.published || "",
        primaryCategory: paper.primaryCategory || "",
        paperType: ALLOWED_PAPER_TYPES.has(paper.paperType)
          ? paper.paperType
          : normalizePaperType(paper.paperType),
      
      }
    );

    return res.json({ success: true });
  } catch (error) {
    console.error("save-paper error:", error);
    return res.status(500).json({
      error: "Failed to save paper",
    });
  } finally {
    await session.close();
  }
});
  router.get("/paper-save-status", async (req, res) => {
  const session = driver.session();

  try {
    const { email, paperId } = req.query;

    if (!email || !paperId) {
      return res.status(400).json({ error: "Missing email or paperId" });
    }

    const result = await session.run(
      `
      MATCH (u:User {email: $email})-[:SAVED]->(p:Paper {paperId: $paperId})
      RETURN p LIMIT 1
      `,
      { email, paperId }
    );

    return res.json({ isSaved: result.records.length > 0 });
  } catch (error) {
    console.error("paper-save-status error:", error);
    return res.status(500).json({ error: "Failed to check paper save status" });
  } finally {
    await session.close();
  }
});

router.get("/topic-tags", async (req, res) => {
  const session = driver.session();

  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Missing email" });
    }

    const result = await session.run(
      `
      MATCH (u:User {email: $email})-[:USES_TAG]->(t:TopicTag)
      RETURN DISTINCT t.name AS tag
      ORDER BY tag ASC
      `,
      { email }
    );

    const tags = result.records
      .map((record) => record.get("tag"))
      .filter(Boolean);

    return res.json({ tags });
  } catch (error) {
    console.error("topic-tags error:", error);
    return res.status(500).json({ error: "Failed to fetch topic tags" });
  } finally {
    await session.close();
  }
});
   router.get("/saved-papers-by-topic", async (req, res) => {
  const session = driver.session();

  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Missing email" });
    }

    const result = await session.run(
      `
      MATCH (u:User {email: $email})-[:SAVED]->(p:Paper)-[:TAGGED_AS]->(t:TopicTag)
      RETURN t.name AS topic, p
      ORDER BY topic ASC, p.title ASC
      `,
      { email }
    );

    const grouped = {};

    result.records.forEach((record) => {
      const topic = record.get("topic");
      const paperNode = record.get("p").properties;

      if (!grouped[topic]) {
        grouped[topic] = [];
      }

      grouped[topic].push({
        id: paperNode.paperId,
        title: paperNode.title || "",
        authors: Array.isArray(paperNode.authors) ? paperNode.authors : [],
        year: paperNode.published
          ? new Date(paperNode.published).getFullYear().toString()
          : "",
        type: paperNode.paperType || "Other",
        paperType: paperNode.paperType || "Other",
        primaryCategory: paperNode.primaryCategory || "",
        summary: paperNode.summary || "",
        pdfUrl: paperNode.pdfUrl || "",
        absUrl: paperNode.absUrl || "",
        published: paperNode.published || "",
      });
    });

    const response = Object.entries(grouped).map(([topic, papers]) => ({
      topic,
      papers,
    }));

    return res.json(response);
  } catch (error) {
    console.error("saved-papers-by-topic error:", error);
    return res.status(500).json({ error: "Failed to fetch saved papers" });
  } finally {
    await session.close();
  }
});
  
  router.put("/update-paper-tag", async (req, res) => {
  const session = driver.session();

  try {
    const { email, paperId, oldTag, newTag } = req.body;

    if (!email || !paperId || !oldTag || !newTag) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await session.run(
      `
      MATCH (u:User {email: $email})-[:SAVED]->(p:Paper {paperId: $paperId})
      MATCH (p)-[r:TAGGED_AS]->(old:TopicTag {name: $oldTag})
      DELETE r
      MERGE (new:TopicTag {name: $newTag})
      MERGE (p)-[:TAGGED_AS]->(new)
      MERGE (u)-[:USES_TAG]->(new)
      `,
      { email, paperId, oldTag, newTag }
    );

    return res.json({ success: true });
  } catch (error) {
    console.error("update-paper-tag error:", error);
    return res.status(500).json({ error: "Failed to update tag" });
  } finally {
    await session.close();
  }
});

router.put("/rename-topic", async (req, res) => {
  const session = driver.session();

  try {
    const { email, oldTopic, newTopic } = req.body;
    const normalizedOldTopic = oldTopic?.trim();
    const normalizedNewTopic = newTopic?.trim();

    if (!email || !normalizedOldTopic || !normalizedNewTopic) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (normalizedOldTopic === normalizedNewTopic) {
      return res.json({ success: true, updatedCount: 0 });
    }

    const result = await session.run(
      `
      MATCH (u:User {email: $email})-[:USES_TAG]->(old:TopicTag {name: $oldTopic})
      OPTIONAL MATCH (u)-[:SAVED]->(p:Paper)-[oldRel:TAGGED_AS]->(old)
      WITH u, old, collect(DISTINCT p) AS papers, collect(oldRel) AS oldRels
      FOREACH (rel IN oldRels | DELETE rel)
      MERGE (new:TopicTag {name: $newTopic})
      MERGE (u)-[:USES_TAG]->(new)
      FOREACH (paper IN papers | MERGE (paper)-[:TAGGED_AS]->(new))
      WITH u, old, papers
      OPTIONAL MATCH (u)-[usesOld:USES_TAG]->(old)
      DELETE usesOld
      RETURN size([paper IN papers WHERE paper IS NOT NULL]) AS updatedCount
      `,
      {
        email,
        oldTopic: normalizedOldTopic,
        newTopic: normalizedNewTopic,
      }
    );

    if (result.records.length === 0) {
      return res.status(404).json({ error: "Topic not found" });
    }

    return res.json({
      success: true,
      updatedCount: result.records[0].get("updatedCount").toNumber(),
    });
  } catch (error) {
    console.error("rename-topic error:", error);
    return res.status(500).json({ error: "Failed to rename topic" });
  } finally {
    await session.close();
  }
});

router.delete("/delete-topic", async (req, res) => {
  const session = driver.session();

  try {
    const { email, topic } = req.query;
    const normalizedTopic = topic?.trim();

    if (!email || !normalizedTopic) {
      return res.status(400).json({ error: "Missing email or topic" });
    }

    const result = await session.run(
      `
      MATCH (u:User {email: $email})-[:USES_TAG]->(t:TopicTag {name: $topic})
      OPTIONAL MATCH (u)-[:SAVED]->(:Paper)-[tagRel:TAGGED_AS]->(t)
      WITH u, t, collect(tagRel) AS tagRels
      FOREACH (rel IN tagRels | DELETE rel)
      WITH u, t, size([rel IN tagRels WHERE rel IS NOT NULL]) AS removedLinks
      MATCH (u)-[usesTag:USES_TAG]->(t)
      DELETE usesTag
      RETURN removedLinks
      `,
      {
        email,
        topic: normalizedTopic,
      }
    );

    if (result.records.length === 0) {
      return res.status(404).json({ error: "Topic not found" });
    }

    return res.json({
      success: true,
      removedLinks: result.records[0].get("removedLinks").toNumber(),
    });
  } catch (error) {
    console.error("delete-topic error:", error);
    return res.status(500).json({ error: "Failed to delete topic" });
  } finally {
    await session.close();
  }
});

  router.delete("/remove-saved-paper", async (req, res) => {
  const session = driver.session();

  try {
    const { email, paperId } = req.query;

    if (!email || !paperId) {
      return res.status(400).json({ error: "Missing email or paperId" });
    }

    await session.run(
      `
      MATCH (u:User {email: $email})-[s:SAVED]->(p:Paper {paperId: $paperId})
      DELETE s
      `,
      { email, paperId }
    );

    return res.json({ success: true });
  } catch (error) {
    console.error("remove-saved-paper error:", error);
    return res.status(500).json({ error: "Failed to remove saved paper" });
  } finally {
    await session.close();
  }
});

function cleanPaperText(text) {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/-\n/g, "")
    .trim();
}

function splitPaperSections(text) {
  const cleaned = text
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();

  const lines = cleaned.split("\n");

  const sections = [];
  let currentSection = null;

  const isSectionTitle = (line) => {
    const normalized = line.trim().toLowerCase();

    return [
      "abstract",
      "introduction",
      "method",
      "methods",
      "methodology",
      "approach",
      "results",
      "experiments",
      "evaluation",
      "discussion",
      "conclusion",
      "conclusions",
      "future work",
    ].some((key) => normalized.startsWith(key));
  };

  for (let line of lines) {
    const trimmed = line.trim();

    if (!trimmed) continue;

    if (isSectionTitle(trimmed)) {
      currentSection = {
        key: trimmed.toLowerCase(),
        label: trimmed,
        content: "",
      };
      sections.push(currentSection);
    } else if (currentSection) {
      currentSection.content += " " + trimmed;
    }
  }


  if (sections.length === 0) {
    return [
      {
        key: "fulltext",
        label: "Full Text",
        content: cleaned,
      },
    ];
  }

  return sections;
}

router.get("/paper-fulltext", async (req, res) => {
  try {
    const { pdfUrl } = req.query;

    if (!pdfUrl) {
      return res.status(400).json({ error: "Missing pdfUrl" });
    }

    const response = await axios.get(pdfUrl, {
      responseType: "arraybuffer",
      timeout: 20000,
    });

    const pdfBuffer = Buffer.from(response.data);
    const parsed = await pdfParse(pdfBuffer);

    const rawText = parsed.text || "";
    const cleanedText = cleanPaperText(rawText);
    const sections = splitPaperSections(cleanedText);

    return res.json({
      text: cleanedText,
      sections,
    });
  } catch (error) {
    console.error("paper-fulltext error:", error);
    return res.status(500).json({ error: "Failed to fetch full paper text" });
  }
});
  router.post("/explain-paper-question", async (req, res) => {
    const session = driver.session();
  try {
    const {
      paperId,
      title,
      summary,
      paperText = "",
      authors = [],
      primaryCategory = "",
      questionKey,
      questionText,
    } = req.body;

    if (!paperId || !title || (!summary && !paperText) || !questionKey || !questionText) {
  return res.status(400).json({
    error: "Missing paper data or analysis question",
  });
}

const existingResult = await session.run(
      `
      MATCH (p:Paper {paperId: $paperId})
      RETURN
        p[$answerKey] AS answer,
        p[$referencesKey] AS referencesJson,
        p[$annotationLabelKey] AS annotationLabel,
        p[$annotationNoteKey] AS annotationNote,
        p[$locationHintKey] AS locationHint
      `,
      {
        paperId,
        answerKey: `q_${questionKey}_answer`,
        referencesKey: `q_${questionKey}_references`,
        annotationLabelKey: `q_${questionKey}_annotation_label`,
        annotationNoteKey: `q_${questionKey}_annotation_note`,
        locationHintKey: `q_${questionKey}_location_hint`,
      }
    );

    if (existingResult.records.length > 0) {
      const record = existingResult.records[0];
      const cachedAnswer = record.get("answer");
      const cachedReferences = record.get("referencesJson");
      const cachedAnnotationLabel = record.get("annotationLabel");
      const cachedAnnotationNote = record.get("annotationNote");
      const cachedLocationHint = record.get("locationHint");

      if (cachedAnswer) {
        let parsedReferences = [];
        try {
          parsedReferences = cachedReferences ? JSON.parse(cachedReferences) : [];
        } catch (e) {
          parsedReferences = [];
        }

        return res.json({
          answer: cachedAnswer,
          references: parsedReferences,
          annotation: {
            label: cachedAnnotationLabel || questionText,
            note:
              cachedAnnotationNote ||
              "Review the most relevant section of the PDF for this question.",
            location_hint: cachedLocationHint || "Introduction",
          },
          cached: true,
        });
      }
    }
    
    const sourceText = paperText && paperText.trim().length > 0 ? paperText : summary;

const prompt = `
You are an AI research reading assistant.
A user is reading a research paper and has clicked one focused analysis question.

Paper title: ${title}
Category: ${primaryCategory}
Authors: ${authors.join(", ")}

Source text from the paper:
${sourceText}

Selected question: ${questionText}
Question key: ${questionKey}

Return valid JSON only in this exact format:
{
  "answer": "A focused answer to the selected question based on the paper text.",
  "references": [
    {
      "section": "Introduction / Methods / Results / Discussion / Conclusion / Abstract",
      "quote": "A short quoted excerpt from the source text",
      "reason": "Why this quote supports the answer"
    }
  ],
  "annotation": {
    "label": "A short annotation title for the PDF",
    "note": "A short annotation note that tells the user what to look for in the original PDF",
    "location_hint": "A likely section such as Introduction, Methods, Results, Discussion, or Conclusion"
  }
}

Rules:
- Answer only the selected question.
- Base the answer on the provided paper text, not generic knowledge.
- Include 1 to 3 references from the paper text.
- Keep each quote short.
- The annotation note should help the user inspect the original PDF.
- The location_hint must be one of: Introduction, Methods, Results, Discussion, Conclusion, Abstract.
- Do not include markdown.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You provide focused question-by-question research paper analysis and suggest where to inspect the original PDF.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices?.[0]?.message?.content || "{}";
    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return res.status(500).json({
        error: "Failed to parse AI response",
        raw,
      });
    }

    return res.json({
  answer: parsed.answer || "No answer generated.",
  references: Array.isArray(parsed.references) ? parsed.references : [],
  annotation: {
    label: parsed.annotation?.label || questionText,
    note:
      parsed.annotation?.note ||
      "Review the most relevant section of the PDF for this question.",
    location_hint: parsed.annotation?.location_hint || "Introduction",
  },
});

  } catch (error) {
    console.error("explain-paper-question error:", error);
    return res.status(500).json({
      error: "Failed to answer analysis question",
    });
  } finally {
    await session.close();
  }
});

module.exports = router;
