"use strict";

const { MongoClient, ObjectId } = require("mongodb");

function isEmptyObject(object) {
  return Object.keys(object).length === 0;
}

module.exports = function (app, client) {
  app
    .route("/api/issues/:project")

    .get(async function (req, res) {
      const project = req.params.project;
      const database = client.db("projects").collection(project);
      const query = req.query;

      const filter = {};

      if (query.open) {
        if (query.open === "true") {
          filter.open = true;
        } else if (query.open === "false") {
          filter.open = false;
        }
      }

      if (query.assigned_to) {
        filter.assigned_to = query.assigned_to;
      }

      try {
        let result;
        if (!isEmptyObject(filter)) {
          result = await database.find(filter).toArray();
        } else {
          result = await database.find().toArray();
        }

        res.status(200).json(result);
      } catch (e) {
        res.status(404).json({ message: "Resource not found" });
      }
    })

    .post(async function (req, res) {
      let project = req.params.project;
      const database = client.db("projects").collection(project);
      const body = req.body;

      try {
        if (!body.issue_title || !body.issue_text || !body.created_by) {
          throw new Error();
        }

        const result = await database.insertOne(body);
        res.status(201).json(result);
      } catch (e) {
        res.status(400).json({ message: "Failed to create resource" });
      }
    })

    .put(async function (req, res) {
      let project = req.params.project;
      const database = client.db("projects").collection(project);
      const body = req.body;

      const newBody = JSON.parse(JSON.stringify(body));
      delete newBody._id;

      try {
        if (!body._id) {
          throw new Error();
        }

        const result = await database.updateOne(
          { _id: new ObjectId(body._id) },
          { $set: { newBody } },
        );

        res.status(200).json(result);
      } catch (e) {
        res.status(400).json({ message: "Failed to update resource" });
      }
    })

    .delete(async function (req, res) {
      let project = req.params.project;
      const database = client.db("projects").collection(project);
      const body = req.body;

      try {
        if (!body._id) {
          throw new Error();
        }

        const result = database.deleteOne({ _id: new ObjectId(body._id) });
        res.status(204).json(result);
      } catch (e) {
        res.status(404).json({ message: "Failed to delete resource" });
      }
    });
};
