import axios from '../api/axios';

export const fetchMasterDashboardData = async () => {
    const response = await axios.get('/thong-ke/master');
    return response.data.data;
};