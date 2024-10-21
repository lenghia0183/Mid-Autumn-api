const { Category } = require('../models');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { categoryMessage } = require('../messages');
const ApiFeature = require('../utils/ApiFeature');
const env = require('../config/env.config');

const createCategory = async (categoryBody) => {
  const category = await Category.create(categoryBody);
  return category;
};

const getCategoryById = async (categoryId) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, categoryMessage().NOT_FOUND);
  }
  return category;
};

const deleteCategoryById = async (categoryId) => {
  const category = await getCategoryById(categoryId);
  await category.deleteOne();
  return category;
};

const updateCategoryById = async (categoryId, updateBody) => {
  const category = await getCategoryById(categoryId);
  Object.assign(category, updateBody);
  await category.save();
  return category;
};

const getCategoriesByKeyword = async (query) => {
  const apiFeature = new ApiFeature(Category);
  const { results, ...detailResult } = await apiFeature.getResults(query, ['name']);
  return { categories: results, ...detailResult };
};

module.exports = {
  createCategory,
  deleteCategoryById,
  updateCategoryById,
  getCategoriesByKeyword,
};
