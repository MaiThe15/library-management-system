const { TaiKhoan, NhanVien, VaiTro, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

// 1. Lấy danh sách nhân viên
exports.layDanhSachNhanVien = async () => {
    return await NhanVien.findAll({
        include: [
            {
                model: TaiKhoan,
                as: 'taiKhoan',
                attributes: ['IDTaiKhoan', 'Email', 'TrangThai', 'LoaiTaiKhoan'] // Đổi thành Email
            },
            {
                model: VaiTro,
                as: 'vaiTro',
                attributes: ['IDVaiTro', 'TenVaiTro']
            }
        ],
        order: [['createdAt', 'DESC']]
    });
};

// 2. Thêm mới nhân viên
exports.taoMoiNhanVien = async (data) => {
    // Lấy đúng các trường theo Model
    const { Email, MatKhau, HoTen, SoDienThoai, PhongBan, NgayVaoLam, idVaiTro } = data;

    // Kiểm tra Email đã tồn tại chưa
    const taiKhoanTonTai = await TaiKhoan.findOne({ where: { Email } });
    if (taiKhoanTonTai) throw new Error('Email này đã được sử dụng trong hệ thống!');

    const vaiTro = await VaiTro.findByPk(idVaiTro);
    if (!vaiTro) throw new Error('Vai trò không tồn tại trong hệ thống!');

    const t = await sequelize.transaction();

    try {
        const salt = await bcrypt.genSalt(10);
        const matKhauMaHoa = await bcrypt.hash(MatKhau, salt);

        // Tạo tài khoản với Email
        const taiKhoanMoi = await TaiKhoan.create({
            Email,
            MatKhau: matKhauMaHoa,
            LoaiTaiKhoan: 'NHAN_VIEN',
            TrangThai: 'HOAT_DONG' // Khớp với giá trị mặc định trong model của bạn
        }, { transaction: t });

        // Tạo hồ sơ nhân viên kèm Phòng ban & Ngày vào làm
        const nhanVienMoi = await NhanVien.create({
            IDTaiKhoan: taiKhoanMoi.IDTaiKhoan, 
            IDVaiTro: idVaiTro, 
            HoTen,
            SoDienThoai,
            PhongBan,
            NgayVaoLam: NgayVaoLam || new Date() // Nếu không truyền thì lấy ngày hôm nay
        }, { transaction: t });

        await t.commit();

        return {
            taiKhoan: { IDTaiKhoan: taiKhoanMoi.IDTaiKhoan, Email: taiKhoanMoi.Email },
            nhanVien: nhanVienMoi
        };

    } catch (error) {
        await t.rollback();
        throw error;
    }
};

// 3. Cập nhật Vai trò nhân viên
exports.capNhatVaiTroNhanVien = async (idNhanVien, idVaiTroMoi) => {
    const nhanVien = await NhanVien.findByPk(idNhanVien);
    if (!nhanVien) throw new Error('Không tìm thấy hồ sơ nhân viên.');

    const vaiTro = await VaiTro.findByPk(idVaiTroMoi);
    if (!vaiTro) throw new Error('Vai trò mới không hợp lệ.');

    await nhanVien.update({ IDVaiTro: idVaiTroMoi });
    return nhanVien;
};

// 4. Khóa/Mở khóa tài khoản (Giữ nguyên logic cũ vì nó thao tác với TaiKhoan)
exports.thayDoiTrangThaiNhanVien = async (idNhanVien, trangThaiMoi) => {
    const nhanVien = await NhanVien.findByPk(idNhanVien);
    if (!nhanVien) throw new Error('Không tìm thấy hồ sơ nhân viên.');

    const taiKhoan = await TaiKhoan.findByPk(nhanVien.IDTaiKhoan);
    if (!taiKhoan) throw new Error('Không tìm thấy dữ liệu tài khoản liên kết.');

    await taiKhoan.update({ TrangThai: trangThaiMoi });
    return { nhanVien, TrangThaiTaiKhoanMoi: taiKhoan.TrangThai };
};