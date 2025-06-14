const db = require('../db/models')
const { Op } = require('sequelize')

exports.findAll = async () => await db.Products.findAll({
    order: [
        ['id', 'DESC']
    ]
})

exports.findById = async (id) => await db.Products.findByPk(id)


exports.findByPrice = async (min, max) => await db.Products.findAll({
    where: {
        price: {
            [Op.gte]: min,
            [Op.lte]: max
        }
    }
})

exports.add = async (product) => await db.Products.create(product)

exports.update = async (id, product) => await db.Products.update(product, {
    where: {
        id: id
    }
})

exports.remove = async (id) => await db.Products.destroy({
    where: {
        id: id
    }
})

