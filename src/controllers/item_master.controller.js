const item_masterService = require("../services/item_master.service");


exports.getAll = async (req, res) =>
  res.json(await item_masterService.findAll(req.params.id));

exports.getAllByID = async (req, res) =>
  res.json(await item_masterService.findAllByID(req.params.id,req.params.u_define_id));

  exports.getAllByItemGroup = async (req, res) =>
  res.json(await item_masterService.getAllByItemGroup(req.params.id));


exports.getAlldata = async (req, res) =>
  res.json(await item_masterService.getAlldata());

exports.create = async (req, res) => {
  if(!req.body.last_purchase_price || req.body.last_purchase_price == ''){
    req.body.last_purchase_price = 0;
  }
  if(!req.body.cost_price || req.body.cost_price == ''){
    req.body.cost_price = 0;
  }
  if(!req.body.sales_price || req.body.sales_price == ''){
    req.body.sales_price = 0;
  }
  try {
  res.json(await item_masterService.create(req.body));
  }catch (err) {
    res.status(204).json({ message: "Item ID Duplicate"});
 }
}
  

exports.update = async (req, res) => {
  try {
    res
      .status(201)
      .json(await item_masterService.update(req.params.id, req.body));
  } catch (error) {
    res.status(204).json({ message: "Item ID Duplicate"});
    return;
  }
};

exports.getAlldatabycompany = async (req, res) =>
  res.json(await item_masterService.getAlldatabycompany(req.params.id));

  exports.delete = async (req, res) => {
    res.json(await item_masterService.delete(req.params.id));
}
