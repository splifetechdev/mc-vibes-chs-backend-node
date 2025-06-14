const productService = require('../services/product.service')
const multer = require('multer')
const multerConfig = require('../configs/multer')
const upload = multer(multerConfig.config).single(multerConfig.keyUpload)

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Returns the list of all the products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: The list of the products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductResponse'
 *       401:
 *         description: Un Authenticated
 *     security: [{ bearerAuth: [] }]
 */
exports.getProducts = async (req, res) => res.json(await productService.findAll())


/**
 * @swagger
 * /products/price?min={min}&max={max}:
 *   get:
 *     summary: Get the product price by minimum, maximum
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: min
 *         schema:
 *           type: number
 *         required: true
 *         description: The minimum product price
 *       - in: query
 *         name: max
 *         schema:
 *           type: number
 *         required: true
 *         description: The maximum product price
 *     responses:
 *       200:
 *         description: The list of the products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductResponse'
 *       401:
 *         description: Un Authenticated
 *     security: [{ bearerAuth: [] }]
 */
exports.getProductByPrice = async (req, res) => {
    const { min, max } = req.query;
    res.json(await productService.findByPrice(min, max))
}

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get the product by id
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: number
 *         required: true
 *         description: The product id
 *     responses:
 *       200:
 *         description: The product description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *       404:
 *         description: The product was not found
 *       401:
 *         description: Un Authenticated
 *     security: [{ bearerAuth: [] }]
 */
exports.getProduct = async (req, res) => {
    const result = await productService.findById(req.params.id)
    if (result) {
        res.json(result)
    } else {
        res.status(404).json({})
    }
}

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ProductRequest'
 *     responses:
 *       201:
 *         description: The product was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Un Authenticated
 *     security: [{ bearerAuth: [] }]
 */
exports.addProduct = (req, res) => {
    upload(req, res, async (error) => {
        if (error) {
            console.log(`error: ${JSON.stringify(error)}`);
            return res.status(500).json({ message: error.message })
        }
        return res.status(201).json(await productService.add(req.body, req.file));
    })
}

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: number
 *         required: true
 *         description: The product id
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ProductRequest'
 *     responses:
 *       200:
 *         description: The product was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *       404:
 *         description: The product was not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Un Authenticated
 *     security: [{ bearerAuth: [] }]
 */
exports.updateProduct = (req, res) => {
    upload(req, res, async (error) => {
        if (error) {
            console.log(`error: ${JSON.stringify(error)}`);
            return res.status(500).json({ message: error.message })
        }
        const result = await productService.update(req.params.id, req.body, req.file)
        if (result) {
            res.json(result)
        } else {
            res.status(404).json({})
        }
    })
}

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: number
 *         required: true
 *         description: The product id
 *     responses:
 *       204:
 *         description: The product was successfully deleted
 *       404:
 *         description: The product was not found
 *       401:
 *         description: Un Authenticated
 *     security: [{ bearerAuth: [] }]
 */
exports.deleteProduct = async (req, res) => {
    const result = await productService.remove(req.params.id)
    if (result) {
        res.status(204).json()
    } else {
        res.status(404).json({})
    }
}

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the product
 *         name:
 *           type: string
 *           description: The product name
 *         price:
 *           type: number
 *           description: The product price
 *         stock:
 *           type: number
 *           description: The product stock
 *         image:
 *           type: string
 *           description: The product image
 *         created_at:
 *           type: string
 *           description: The product created
 *         updated_at:
 *           type: string
 *           description: The product updated
 *       example:
 *         id: 1
 *         name: Macbook Pro
 *         price: 1112
 *         stock: 1150
 *         image: product_01.jpg
 *         created_at: 2020-11-12T09:00:56.096Z
 *         updated_at: 2020-11-12T09:00:56.096Z
 *     ProductRequest:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - stock
 *       properties:
 *         id:
 *           type: string
 *           description: The product id
 *         name:
 *           type: string
 *           description: The product name
 *         price:
 *           type: number
 *           description: The product price
 *         stock:
 *           type: number
 *           description: The product stock
 *         image:
 *           type: array
 *           items:
 *              type: string
 *              format: binary
 *           description: The product image
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: The error message
 */