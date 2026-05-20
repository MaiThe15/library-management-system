import React, { useState, useEffect } from 'react';
import { fetchMasterDashboardData } from '../services/thongKeService';
import sharedStyles from '../pages/StaffHome.module.css';
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

    if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: '#64748b', fontSize: '1.2rem' }}>Đang tải dữ liệu Dashboard...</div>;
    if (!data) return null;

    const { summary, bieuDoTheLoai, bieuDoMuonTra, recentBorrows } = data;

    return (
        <div style={{ width: '100%' }}>
            <h2 style={{ color: '#1f2937', marginBottom: '24px', fontSize: '22px' }}>Thống Kê Thư Viện</h2>

            {/* 1. TOP CARDS - SỬ DỤNG CSS GRID INLINE */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                gap: '20px', 
                marginBottom: '24px' 
            }}>
                <div className={sharedStyles.tablePanel} style={{ padding: '20px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', background: '#e0f2fe', color: '#0284c7', marginRight: '16px' }}>📚</div>
                    <div>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>Tổng Sách (Cuốn)</p>
                        <h3 style={{ margin: '4px 0 0 0', fontSize: '1.5rem', color: '#0f172a' }}>{summary.tongCuonSach}</h3>
                    </div>
                </div>
                
                <div className={sharedStyles.tablePanel} style={{ padding: '20px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', background: '#dcfce7', color: '#16a34a', marginRight: '16px' }}>👥</div>
                    <div>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>Tổng Độc Giả</p>
                        <h3 style={{ margin: '4px 0 0 0', fontSize: '1.5rem', color: '#0f172a' }}>{summary.tongDocGia}</h3>
                    </div>
                </div>
                
                <div className={sharedStyles.tablePanel} style={{ padding: '20px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', background: '#fef3c7', color: '#d97706', marginRight: '16px' }}>🔄</div>
                    <div>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>Đang Cho Mượn</p>
                        <h3 style={{ margin: '4px 0 0 0', fontSize: '1.5rem', color: '#0f172a' }}>{summary.dangChoMuon}</h3>
                    </div>
                </div>
                
                <div className={sharedStyles.tablePanel} style={{ padding: '20px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', background: '#fee2e2', color: '#dc2626', marginRight: '16px' }}>⚠️</div>
                    <div>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>Sách Quá Hạn</p>
                        <h3 style={{ margin: '4px 0 0 0', fontSize: '1.5rem', color: '#0f172a' }}>{summary.sachQuaHan}</h3>
                    </div>
                </div>
            </div>

            {/* 2. CHARTS SECTION - SỬ DỤNG CSS GRID INLINE */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                gap: '20px', 
                marginBottom: '24px' 
            }}>
                {/* Bar Chart */}
                <div className={sharedStyles.tablePanel} style={{ padding: '24px' }}>
                    <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '1.1rem', marginBottom: '24px' }}>Thống Kê Mượn Sách (6 Tháng)</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={bieuDoMuonTra}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} />
                                <Tooltip cursor={{fill: 'rgba(37, 99, 235, 0.05)'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="borrows" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={45} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Doughnut Chart */}
                <div className={sharedStyles.tablePanel} style={{ padding: '24px' }}>
                    <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '1.1rem', marginBottom: '24px' }}>Cơ Cấu Sách Theo Thể Loại</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={bieuDoTheLoai}
                                    innerRadius={75}
                                    outerRadius={105}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {bieuDoTheLoai.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', color: '#475569' }}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 3. RECENT TABLE */}
            <div className={sharedStyles.tablePanel}>
                <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '1.2rem', marginBottom: '20px' }}>Hoạt Động Mượn Gần Đây</h3>
                <table className={sharedStyles.dataTable}>
                    <thead>
                        <tr>
                            <th>Mã Phiếu</th>
                            <th>Độc Giả</th>
                            <th>Sách Mượn</th>
                            <th>Ngày Mượn</th>
                            <th style={{ textAlign: 'center' }}>Trạng Thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentBorrows.map(slip => (
                            <tr key={slip.IDPhieuMuon}>
                                <td style={{ fontWeight: 'bold', color: '#2563eb' }}>#{slip.IDPhieuMuon}</td>
                                <td style={{ fontWeight: '500', color: '#1e293b' }}>{slip.docGia?.HoTen}</td>
                                <td style={{ color: '#475569' }}>{slip.chiTietPhieuMuons?.map(ct => ct.Sach?.TenSach).join(', ')}</td>
                                <td style={{ color: '#64748b' }}>{new Date(slip.NgayMuon).toLocaleDateString('vi-VN')}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <span className={`${sharedStyles.statusBadge} ${slip.TrangThai === 'Đang mượn' ? sharedStyles.statusEmpty : sharedStyles.statusAvailable}`}
                                          style={slip.TrangThai === 'Đang mượn' ? { backgroundColor: '#fef3c7', color: '#d97706' } : {}}>
                                        {slip.TrangThai}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {recentBorrows.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Chưa có hoạt động nào gần đây.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManagerDashboard;