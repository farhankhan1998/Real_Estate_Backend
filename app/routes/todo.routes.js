const { fetchUser } = require("../middleware/fetchuser.js");
const todoModel = require("../models/todo.model.js");
const permissions = require("../constants/permissions.js");
const { body, validationResult } = require('express-validator');

module.exports = (app) => {
  var router = require("express").Router();

  // Create a new todo
  router.post(
    '/',
    fetchUser,
    [
      body('name', 'Please enter name').isLength({ min: 1 }),
      body('details', 'Please enter details').isLength({ min: 1 }),
    ],
    async (req, res) => {
      try {
        // Check permissions
        const permission = req.userinfo.permissions.find(
          (el) =>
            // el.name === permissions.CREATE_TODO ||
            el.name === permissions.MODIFY_ALL ||
            el.name === permissions.VIEW_ALL
        );

        // if (!permission) return res.status(401).json({ errors: "Unauthorized" });

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        todoModel.init(req.userinfo.tenantcode);
        const newTodo = await todoModel.create(req.body, req.userinfo.id);

        if (newTodo.statusCode === 201) {
          res.status(201).json(newTodo.data);
        } else {
          res.status(newTodo.statusCode).json({ error: newTodo.message });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  );

  // Get all todos
  router.get(
    '/',
    fetchUser,
    async (req, res) => {
      try {
        // Check permissions
        const permission = req.userinfo.permissions.find(
          (el) =>
            el.name === permissions.MODIFY_ALL ||
            el.name === permissions.VIEW_ALL
        );

        // if (!permission) return res.status(401).json({ errors: "Unauthorized" });

        todoModel.init(req.userinfo.tenantcode);
        const todos = await todoModel.findAll();

        res.status(todos.statusCode).json(todos.data);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  );

  // Get todo by ID
  router.get(
    '/:id',
    fetchUser,
    async (req, res) => {
      try {
        // Check permissions
        const permission = req.userinfo.permissions.find(
          (el) =>
            // el.name === permissions.VIEW_TODO ||
            el.name === permissions.MODIFY_ALL ||
            el.name === permissions.VIEW_ALL
        );

        // if (!permission) return res.status(401).json({ errors: "Unauthorized" });

        todoModel.init(req.userinfo.tenantcode);
        const todo = await todoModel.findById(req.params.id);

        res.status(todo.statusCode).json(todo.data);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  );

  // Update todo by ID
  router.put(
    '/:id',
    fetchUser,
    [
      body('name', 'Please enter name').isLength({ min: 1 }),
      body('details', 'Please enter details').isLength({ min: 1 }),
    ],
    async (req, res) => {
      try {
        // Check permissions
        const permission = req.userinfo.permissions.find(
          (el) =>
            // el.name === permissions.MODIFY_TODO ||
            el.name === permissions.MODIFY_ALL ||
            el.name === permissions.VIEW_ALL
        );

        // if (!permission) return res.status(401).json({ errors: "Unauthorized" });

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        todoModel.init(req.userinfo.tenantcode);
        const updatedTodo = await todoModel.updateById(req.params.id, req.body, req.userinfo.id);

        res.status(updatedTodo.statusCode).json(updatedTodo.data);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  );

  // Delete todo by ID
  router.delete(
    '/:id',
    fetchUser,
    async (req, res) => {
      try {
        // Check permissions
        const permission = req.userinfo.permissions.find(
          (el) =>
            // el.name === permissions.DELETE_TODO ||
            el.name === permissions.MODIFY_ALL ||
            el.name === permissions.VIEW_ALL
        );

        // if (!permission) return res.status(401).json({ errors: "Unauthorized" });

        todoModel.init(req.userinfo.tenantcode);
        const result = await todoModel.deleteById(req.params.id);

        if (result) {
          res.status(200).json({ message: "Todo Deleted Successfully" });
        } else {
          res.status(204).json({ message: "No Record Found" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  );

  app.use(process.env.BASE_API_URL + "/api/todo", router);
};
