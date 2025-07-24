// Import thư viện jsonwebtoken để làm việc với JWT
import jwt from "jsonwebtoken";

// Middleware verifyToken để xác thực người dùng dựa trên JWT
export const verifyToken = (req, res, next) => {
	// Lấy token từ cookie của request
	const token = req.cookies.token;

	// Nếu không có token thì trả về lỗi 401 (Unauthorized)
	if (!token) {
		return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
	}

	try {
		// Giải mã (verify) token bằng secret key (JWT_SECRET)
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Nếu không giải mã được (token không hợp lệ) thì trả về lỗi 401
		if (!decoded) {
			return res.status(401).json({ success: false, message: "Unauthorized - invalid token" });
		}

		// Lưu userId từ token vào req để các middleware/route sau có thể sử dụng
		req.userId = decoded.userId;

		// Cho phép request đi tiếp sang middleware/route tiếp theo
		next();
	} catch (error) {
		// Nếu có lỗi trong quá trình verify token, log lỗi ra console và trả về lỗi 500 (Server error)
		console.log("Error in verifyToken ", error);
		return res.status(500).json({ success: false, message: "Server error" });
	}
};
