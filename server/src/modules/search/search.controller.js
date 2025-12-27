import searchService from './search.service.js';

class SearchController {
    search = async (req, res, next) => {
        try {
            const { q, category } = req.query;
            const searchTerm = q || "";
            const categoryFilter = category || "all";

            const results = await searchService.searchItems(searchTerm, categoryFilter);

            return res.status(200).json({
                data: results,
                metadata: {
                    total: results.length,
                    query: searchTerm,
                    category: categoryFilter
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new SearchController();
