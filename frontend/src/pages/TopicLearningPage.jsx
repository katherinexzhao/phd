
      const response = await axios.post(
        `${API_BASE_URL}/api/research/explain-paper-question`,
        {
    
          title: paper.title,
          summary: paper.summary,
          paperId: paper.id,
          paperText,
          primaryCategory: paper.primaryCategory || paper.type || "",
          authors: Array.isArray(paper.authors)
            ? paper.authors
            : paper.authors
            ? [paper.authors]
            : [],
          questionKey: question.key,
          questionText: question.title,
        }
      );