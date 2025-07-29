import Product from '../models/product.model.js';
import path from 'path';

const VALID_STATUSES = ['available', 'unavailable', 'out_of_stock'];

// Tạo sản phẩm mới
export const createProduct = async (req, res) => {
    try {
        const { status, inventory } = req.body;
        if (status && !VALID_STATUSES.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value.' });
        }
        if (inventory !== undefined && inventory < 0) {
            return res.status(400).json({ message: 'Inventory must be >= 0.' });
        }
        let variant = req.body.variant;
        if (typeof variant === 'string') {
            try {
                variant = JSON.parse(variant);
            } catch (e) {
                return res.status(400).json({ message: 'Variant must be a valid JSON array.' });
            }
        }
        let imagePath = '';
        if (req.file) {
            imagePath = path.join('uploads', req.file.filename);
        }
        const product = new Product({
            ...req.body,
            variant,
            image: imagePath
        });
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Lấy danh sách sản phẩm với pagination và filters
export const getProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            search = '',
            status = '',
            sortBy = 'newest',
            priceMin = '',
            priceMax = ''
        } = req.query;

        // Convert to numbers
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build filter object
        let filter = {};

        // Search filter
        if (search) {
            filter.$or = [
                { productName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Status filter
        if (status && status !== 'all') {
            filter.status = status;
        }

        // Price range filter
        if (priceMin || priceMax) {
            filter.price = {};
            if (priceMin) filter.price.$gte = parseInt(priceMin);
            if (priceMax) filter.price.$lte = parseInt(priceMax);
        }

        // Build sort object
        let sort = {};
        switch (sortBy) {
            case 'price_asc':
                sort.price = 1;
                break;
            case 'price_desc':
                sort.price = -1;
                break;
            case 'name_asc':
                sort.productName = 1;
                break;
            case 'name_desc':
                sort.productName = -1;
                break;
            case 'oldest':
                sort.createdAt = 1;
                break;
            case 'newest':
            default:
                sort.createdAt = -1;
                break;
        }

        // Execute query with pagination
        const products = await Product
            .find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limitNum);

        // Get total count for pagination info
        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limitNum);

        res.json({
            products,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalProducts,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
                limit: limitNum
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy chi tiết sản phẩm
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật sản phẩm
export const updateProduct = async (req, res) => {
    try {
        const { status, inventory } = req.body;

        // Kiểm tra status nếu có truyền vào
        if (status && !VALID_STATUSES.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value.' });
        }

        // Kiểm tra inventory nếu có truyền vào
        if (inventory !== undefined && inventory < 0) {
            return res.status(400).json({ message: 'Inventory must be >= 0.' });
        }

        // Chỉ lấy các trường cho phép cập nhật
        let updateData = {};

        // Cập nhật status nếu có
        if (status !== undefined) updateData.status = status;

        // Cập nhật inventory nếu có
        if (inventory !== undefined) updateData.inventory = inventory;

        // Cập nhật variant nếu có
        if (req.body.variant !== undefined) {
            if (typeof req.body.variant === 'string') {
                try {
                    updateData.variant = JSON.parse(req.body.variant);
                } catch (e) {
                    return res.status(400).json({ message: 'Variant must be a valid JSON array.' });
                }
            } else {
                updateData.variant = req.body.variant;
            }
        }

        // Cập nhật image nếu có file upload mới
        if (req.file) {
            updateData.image = path.join('uploads', req.file.filename);
        }

        // Có thể update tên sản phẩm (name) nếu truyền vào
        if (req.body.productName !== undefined) {
            updateData.productName = req.body.productName;
        }

        // Có thể mở rộng cho các trường khác nếu cần (ví dụ: price, description, ...)
        const allowedFields = ['price', 'description'];
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Xóa sản phẩm (chỉ cập nhật status thành 'unavailable')
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { status: 'unavailable' },
            { new: true }
        );
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product set to unavailable', product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};