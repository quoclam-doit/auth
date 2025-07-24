# ECOMMERCE SYSTEM

## 📌 Mục tiêu

Hệ thống **E-Commerce** là một nền tảng trực tuyến cho phép cửa hàng bán sản phẩm và khách hàng thực hiện mua sắm trực tuyến. Hệ thống hỗ trợ:

- Quản lý sản phẩm, đơn hàng, thanh toán, khách hàng và dịch vụ hậu mãi cho cửa hàng.
- Tìm kiếm, mua sắm, theo dõi đơn hàng và quản lý tài khoản cho khách hàng.
- Điều hành toàn bộ hệ thống, đảm bảo vận hành ổn định và an toàn cho **Admin**.

---

## 🧭 Phạm vi hệ thống

Hệ thống bao gồm các phân hệ chính:

- **Admin**: Quản lý toàn bộ hoạt động hệ thống.
- **Customer**: Trải nghiệm mua sắm và theo dõi đơn hàng.

---

## 👥 Vai trò và chức năng

### 1. Admin - Quản trị hệ thống

| Mã chức năng | Chức năng                 | Mô tả                                  | Tiến độ     |
| ------------ | ------------------------- | -------------------------------------- | ----------- |
| AD-ADM01     | Quản lý sản phẩm          | Kiểm duyệt sản phẩm được đăng bán      | ❌ Chưa làm |
| AD-ADM02     | Quản lý đơn hàng          | Xử lý và cập nhật đơn hàng             | ❌ Chưa làm |
| AD-ADM03     | Quản lý khách hàng        | Chỉnh sửa, xóa thông tin khách hàng    | ❌ Chưa làm |
| AD-ADM04     | Quản lý thanh toán        | Theo dõi các giao dịch                 | ❌ Chưa làm |
| AD-ADM05     | Quản lý thông báo         | Gửi thông báo đến khách hàng           | ❌ Chưa làm |
| AD-ADM06     | Quản lý đánh giá sản phẩm | Xem và phản hồi đánh giá               | ❌ Chưa làm |
| AD-ADM07     | Quản lý khuyến mãi        | Tạo/chỉnh sửa/xóa khuyến mãi           | ❌ Chưa làm |
| AD-ADM08     | Quản lý phân quyền        | Phân quyền cho nhân viên nội bộ        | ❌ Chưa làm |
| AD-ADM19     | Quản lý tài chính         | Theo dõi doanh thu và chi phí hệ thống | ❌ Chưa làm |

> ⚠️ Điều kiện: Tất cả chức năng yêu cầu Admin đăng nhập.

---

### 2. Customer - Khách hàng

| Mã chức năng | Chức năng            | Mô tả                                                | Tiến độ       |
| ------------ | -------------------- | ---------------------------------------------------- | ------------- |
| CTM-REG01    | Đăng ký tài khoản    | Tạo tài khoản mới                                    | ✅ Hoàn thành |
| CTM-LOG01    | Đăng nhập            | Truy cập hệ thống                                    | ✅ Hoàn thành |
| CTM-PRD01    | Tìm kiếm sản phẩm    | Sử dụng bộ lọc và tìm kiếm nâng cao                  | ❌ Chưa làm   |
| CTM-ORD01    | Đặt hàng             | Thêm vào giỏ và thanh toán                           | ❌ Chưa làm   |
| CTM-ORD02    | Xem lịch sử đặt hàng | Theo dõi trạng thái đơn hàng                         | ❌ Chưa làm   |
| CTM-RVW01    | Đánh giá sản phẩm    | Gửi nhận xét sau khi mua                             | ❌ Chưa làm   |
| CTM-ACC01    | Quản lý tài khoản    | Cập nhật thông tin cá nhân                           | ❌ Chưa làm   |
| CTM-SPT01    | Yêu cầu hỗ trợ       | Gửi câu hỏi/hỗ trợ kỹ thuật                          | ❌ Chưa làm   |
| CTM-PRM01    | Xem khuyến mãi       | Xem chương trình khuyến mãi                          | ❌ Chưa làm   |
| CTM-SHP01    | Theo dõi vận chuyển  | Cập nhật trạng thái giao hàng                        | ❌ Chưa làm   |
| CTM-FIN01    | Quản lý thanh toán   | Xem lịch sử giao dịch của mình                       | ❌ Chưa làm   |
| CTM-WIS01    | Danh sách yêu thích  | Lưu sản phẩm yêu thích để xem lại hoặc mua sau       | ❌ Chưa làm   |
| CTM-CMP01    | So sánh sản phẩm     | So sánh các sản phẩm về giá, tính năng, đánh giá...  | ❌ Chưa làm   |
| CTM-NOT01    | Thông báo đẩy        | Nhận thông báo về đơn hàng, khuyến mãi, cập nhật mới | ❌ Chưa làm   |

> Ghi chú:
>
> - ✅ Hoàn thành
> - ⏳ Đang phát triển
> - ❌ Chưa làm

---

## 🎨 Giao diện

### Admin Pages

- **Product Management Page** – Quản lý sản phẩm
- **Order Management Page** – Xử lý đơn hàng
- **Customer Management Page** – Danh sách khách hàng
- **Payment Management Page** – Quản lý giao dịch
- **Notification Page** – Gửi thông báo
- **Review Management Page** – Quản lý đánh giá
- **Promotion Page** – Quản lý chương trình khuyến mãi
- **Access Control Page** – Phân quyền người dùng
- **Financial Management Page** – Quản lý tài chính

### Customer Pages

- **Registration / Login Pages** – Đăng ký, đăng nhập
- **Product Search Page** – Tìm kiếm sản phẩm
- **Shopping Cart Page** – Giỏ hàng
- **Order History Page** – Lịch sử đơn hàng
- **Review Page** – Đánh giá sản phẩm
- **Account Settings Page** – Quản lý tài khoản
- **Support Page** – Gửi yêu cầu hỗ trợ
- **Promotion Page** – Xem khuyến mãi
- **Shipping Tracking Page** – Theo dõi vận chuyển
- **Payment History Page** – Quản lý giao dịch
- **Wishlist Page** – Danh sách yêu thích
- **Product Comparison Page** – So sánh sản phẩm
- **Notification Center Page** – Trung tâm thông báo

---

## ✅ Điều kiện hoạt động

- **Admin** phải đăng nhập để thực hiện các chức năng quản trị.
- **Customer** phải có tài khoản để đặt hàng, đánh giá, hoặc theo dõi đơn hàng.

---

## 📌 Ghi chú triển khai

- Backend sử dụng mô hình MVC2.
- Frontend đề nghị sử dụng React, Tailwind, zustand,....
- Database: MongoDB.

---
