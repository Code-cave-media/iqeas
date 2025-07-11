import { searchEstimations } from "../services/search.service.js";

/**
 * @desc Search estimations by log, notes, or updates
 * @route GET /estimations/search?query=your_search_term
 */
export async function searchEstimationsHandler(req, res) {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Search query is required" });
    }

    const results = await searchEstimations(query);
    res.status(200).json(results);
  } catch (error) {
    console.error("Search estimation error:", error);
    res.status(500).json({ error: "Failed to search estimations" });
  }
}
