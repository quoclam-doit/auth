import bcryptjs from "bcryptjs";
import crypto from "crypto";

import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
	sendVerificationEmail,
	sendWelcomeEmail,
	sendPasswordResetEmail,
	sendResetSuccessEmail,
} from "../mailtrap/emails.js";
import { User } from "../models/user.model.js";

export const signup = async (req, res) => {
	const { email, password, name } = req.body;

	try {
		if (!email || !password || !name) {
			throw new Error("All fields are required");
		}

		const userAlreadyExists = await User.findOne({ email });
		console.log("userAlreadyExists", userAlreadyExists);

		if (userAlreadyExists) {
			return res.status(400).json({ success: false, message: "User already exists" });
		}

		// "hashedPassword" is the user's password after being securely hashed with bcryptjs.
		// "10" là số vòng lặp (salt rounds) mà bcryptjs sẽ sử dụng để mã hóa mật khẩu.
		// Số vòng lặp càng cao thì việc bẻ khóa mật khẩu càng khó, nhưng cũng sẽ tốn nhiều thời gian xử lý hơn.
		const hashedPassword = await bcryptjs.hash(password, 10);

		// "verificationToken" is a random 6-digit code (as a string) used to verify the user's email.
		// Math.floor(100000 + Math.random() * 900000).toString();
		// Dòng này tạo ra một chuỗi gồm 6 chữ số ngẫu nhiên (từ 100000 đến 999999).
		// Cụ thể:
		// - Math.random() * 900000 sinh ra số thực ngẫu nhiên từ 0 đến gần 900000 (không bao gồm 900000).
		// - Cộng thêm 100000 để đảm bảo số nhỏ nhất là 100000 (6 chữ số).
		// - Math.floor(...) làm tròn xuống để lấy số nguyên.
		// - .toString() chuyển số thành chuỗi.
		const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

		const user = new User({
			email,
			password: hashedPassword,
			name,
			verificationToken,
			verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
		});

		await user.save();

		// jwt token and set cookie in response header 
		generateTokenAndSetCookie(res, user._id);

		await sendVerificationEmail(user.email, verificationToken);

		res.status(201).json({
			success: true,
			message: "User created successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		res.status(400).json({ success: false, message: error.message });
	}
};

// "verifyEmail" is a controller function that handles the verification of a user's email address using a code (typically sent to their email).
// It checks if the code is valid and not expired, marks the user as verified, clears the verification token, sends a welcome email, and responds with success or error.

export const verifyEmail = async (req, res) => {
	const { code } = req.body; // The verification code sent by the user
	try {
		// Find a user with the matching verification token and make sure the token hasn't expired
		// nghĩa là gì: Tìm một người dùng có verificationToken trùng với code và verificationTokenExpiresAt lớn hơn thời điểm hiện tại (tức là token chưa hết hạn)
		const user = await User.findOne({
			verificationToken: code,
			verificationTokenExpiresAt: { $gt: Date.now() },
		});

		// If no user is found, the code is invalid or expired
		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
		}

		// Mark the user as verified and remove the verification token and its expiration
		user.isVerified = true;
		user.verificationToken = undefined;
		user.verificationTokenExpiresAt = undefined;
		await user.save();

		// Send a welcome email to the user
		await sendWelcomeEmail(user.email, user.name);

		// Respond with success and the user data (excluding password)
		res.status(200).json({
			success: true,
			message: "Email verified successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		console.log("error in verifyEmail ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const login = async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}
		const isPasswordValid = await bcryptjs.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}

		generateTokenAndSetCookie(res, user._id);

		user.lastLogin = new Date();
		await user.save();

		res.status(200).json({
			success: true,
			message: "Logged in successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		console.log("Error in login ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const logout = async (req, res) => {
	res.clearCookie("token");
	res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (req, res) => {
	const { email } = req.body;
	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		// Generate reset token
		// Tạo ra một mã token ngẫu nhiên để reset mật khẩu và đặt thời gian hết hạn cho token đó (1 tiếng kể từ bây giờ)
		const resetToken = crypto.randomBytes(20).toString("hex"); 
		// Tạo chuỗi token ngẫu nhiên dài 40 ký tự hexa
		const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; 
		// Thời gian hết hạn token là 1 tiếng (tính bằng mili giây)
		// 1 * 60 * 60 * 1000 nghĩa là:
		// 1 giờ (1 hour)
		// 60 phút/giờ * 60 giây/phút * 1000 mili giây/giây = 3,600,000 ms (1 tiếng)

		user.resetPasswordToken = resetToken;
		user.resetPasswordExpiresAt = resetTokenExpiresAt;

		await user.save();

		// send email
		await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

		res.status(200).json({ success: true, message: "Password reset link sent to your email" });
	} catch (error) {
		console.log("Error in forgotPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

// Hàm resetPassword cho phép người dùng đặt lại mật khẩu mới khi họ có token hợp lệ (token này thường được gửi qua email khi người dùng yêu cầu quên mật khẩu).
export const resetPassword = async (req, res) => {
	try {
		// Lấy token từ URL params (req.params) và mật khẩu mới từ body của request
		const { token } = req.params; // Token reset mật khẩu, ví dụ: /reset-password/:token
		const { password } = req.body; // Mật khẩu mới mà người dùng nhập

		// Tìm user trong database có resetPasswordToken trùng với token truyền vào
		// và resetPasswordExpiresAt (thời gian hết hạn token) 
		// phải lớn hơn thời điểm hiện tại (tức là token còn hiệu lực)
		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpiresAt: { $gt: Date.now() },
		});

		// Nếu không tìm thấy user hoặc token đã hết hạn, trả về lỗi cho client
		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
		}

		// Nếu tìm thấy user, tiến hành hash mật khẩu mới bằng bcryptjs với 10 salt rounds
		// Việc hash này giúp bảo mật mật khẩu khi lưu vào database
		const hashedPassword = await bcryptjs.hash(password, 10);

		// Cập nhật mật khẩu mới cho user, đồng thời xóa resetPasswordToken và resetPasswordExpiresAt để token không thể sử dụng lại
		user.password = hashedPassword;
		user.resetPasswordToken = undefined; // Xóa token sau khi đã sử dụng
		user.resetPasswordExpiresAt = undefined; // Xóa thời gian hết hạn token
		await user.save(); // Lưu thay đổi vào database

		// Gửi email thông báo cho người dùng biết rằng họ đã đổi mật khẩu thành công
		// (Hàm sendResetSuccessEmail cần được định nghĩa ở nơi khác, ví dụ trong mailtrap/emails.js)
		await sendResetSuccessEmail(user.email);

		// 7. Trả về response thành công cho client
		res.status(200).json({ success: true, message: "Password reset successful" });
	} catch (error) {
		// 8. Nếu có lỗi xảy ra trong quá trình xử lý, log lỗi ra console và trả về response lỗi cho client
		console.log("Error in resetPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const checkAuth = async (req, res) => {
	try {
		const user = await User.findById(req.userId).select("-password");
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		res.status(200).json({ success: true, user });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};
