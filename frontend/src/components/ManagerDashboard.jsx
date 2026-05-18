import React, { useState, useEffect } from 'react';
import { fetchMasterDashboardData } from '../services/thongKeService';
import styles from './ManagerDashboard.module.css';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend 
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];

const ManagerDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await fetchMasterDashboardData();
                setData(res);
            } catch (error) {
                console.error("Lỗi lấy dữ liệu dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <div className={styles.loading}>Đang tải dữ liệu Dashboard...</div>;
    if (!data) return null;

    const { summary, bieuDoTheLoai, bieuDoMuonTra, recentBorrows } = data;

    return (
        <div className={styles.dashboardContainer}>
            <h2 className={styles.title}>Tổng Quan Thư Viện</h2>

            {/* 1. TOP CARDS */}
            <div className={styles.cardsGrid}>
                <div className={styles.card}>
                    <div className={styles.cardIcon} style={{ background: '#e0f2fe', color: '#0284c7' }}>📚</div>
                    <div className={styles.cardInfo}>
                        <p>Tổng Sách (Cuốn)</p>
                        <h3>{summary.tongCuonSach}</h3>
                    </div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardIcon} style={{ background: '#dcfce7', color: '#16a34a' }}>👥</div>
                    <div className={styles.cardInfo}>
                        <p>Tổng Độc Giả</p>
                        <h3>{summary.tongDocGia}</h3>
                    </div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardIcon} style={{ background: '#fef3c7', color: '#d97706' }}>🔄</div>
                    <div className={styles.cardInfo}>
                        <p>Đang Cho Mượn</p>
                        <h3>{summary.dangChoMuon}</h3>
                    </div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardIcon} style={{ background: '#fee2e2', color: '#dc2626' }}>⚠️</div>
                    <div className={styles.cardInfo}>
                        <p>Sách Quá Hạn</p>
                        <h3>{summary.sachQuaHan}</h3>
                    </div>
                </div>
            </div>

            {/* 2. CHARTS SECTION */}
            <div className={styles.chartsGrid}>
                {/* Bar Chart */}
                <div className={styles.chartBox}>
                    <h3>Thống Kê Mượn Sách (6 Tháng)</h3>
                    <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={bieuDoMuonTra}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="borrows" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Doughnut Chart */}
                <div className={styles.chartBox}>
                    <h3>Sách Theo Thể Loại</h3>
                    <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={bieuDoTheLoai}
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {bieuDoTheLoai.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 3. RECENT TABLE */}
            <div className={styles.tableBox}>
                <h3>Hoạt Động Mượn Gần Đây</h3>
                <table className={styles.recentTable}>
                    <thead>
                        <tr>
                            <th>Mã Phiếu</th>
                            <th>Độc Giả</th>
                            <th>Sách Mượn</th>
                            <th>Ngày Mượn</th>
                            <th>Trạng Thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentBorrows.map(slip => (
                            <tr key={slip.IDPhieuMuon}>
                                <td>#{slip.IDPhieuMuon}</td>
                                <td>{slip.docGia?.HoTen}</td>
                                <td>{slip.chiTietPhieuMuons?.map(ct => ct.Sach?.TenSach).join(', ')}</td>
                                <td>{new Date(slip.NgayMuon).toLocaleDateString('vi-VN')}</td>
                                <td>
                                    <span className={slip.TrangThai === 'Đang mượn' ? styles.statusBorrow : styles.statusReturn}>
                                        {slip.TrangThai}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManagerDashboard;