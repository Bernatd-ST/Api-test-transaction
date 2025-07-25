const { pool } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

// get banners (piblic)
const getBanners = async (req, res) => {
    try {
        // get all banners
        const [banners] = await pool.execute('SELECT id, banner_name, banner_image, description FROM banners');

        return successResponse(res, 'sukses', {banners});
    } catch (error) {
        console.error('Get banners error:', error);
        return errorResponse(res, 500, 'Terjadi kesalahan pada server');
    }
};

// get services (private)
const getServices = async (req, res) => {
    try {
        // ambil semua services dari database
        const [services] = await pool.execute('SELECT service_code, service_name, service_icon, service_tariff FROM services');

        return successResponse(res, 'sukses', {services});
    } catch (error) {
        console.error('Get services error: ', error);
        return errorResponse(res, 500, 'Terjadi kesalahan pada server');
    }
};

module.exports = {
    getBanners,
    getServices
};