import axios from '../api/axios';

const datTruocSach = (IDSach) => {
  return axios.post('/phieudattruoc', { IDSach });
};

const getMyWaitlist = () => {
  return axios.get(`/phieudattruoc/my-waitlist`);
};

const huyDatTruoc = (IDPhieuDat) => {
  return axios.put(`/phieudattruoc/${IDPhieuDat}/cancel`);
};

export default {
  datTruocSach,
  getMyWaitlist,
  huyDatTruoc
};