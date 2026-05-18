const thongKeService = require('../services/thongKeService');

exports.getDashboardData = async (req, res) => {
    try {
        const data = await thongKeService.getMasterDashboardStats();
        return res.status(200).json({ success: true, data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};