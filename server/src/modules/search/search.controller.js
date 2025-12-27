import searchService from './search.service.js';

class SearchController {
    search = async (req, res, next) => {
        try {
            const { q } = req.query;
            
            if (!q) { 
                // return empty list or ignored
                return res.status(200).json({
                    data: [],
                    message: "Query parameter 'q' is required for search."
                });
            }

            const results = await searchService.searchProducts(q);

            return res.status(200).json({
                data: results,
                metadata: {
                    total: results.length,
                    query: q
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new SearchController();
