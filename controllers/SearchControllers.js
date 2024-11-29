const SearchService = require('../services/SearchService');


const searchAcrossModels = async (req, res) => {
    const searchQuery = req.query.searchQuery;
    const userId = req.userId ;

    try {
        const results = await SearchService.searchAccrossModels(searchQuery, userId);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error searching across models', error: error.message });
    }
};

module.exports = { searchAcrossModels };
