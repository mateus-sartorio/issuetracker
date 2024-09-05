"use strict";

const { ObjectId } = require("mongodb");

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

      let id;
      if (req.query._id) {
        id = new ObjectId(req.query._id);
      }

      if (id) {
        filter._id = id;
      }

      // if (query.created_on) {
      //   filter.created_on = query.created_on;
      // }

      // if (query.updated_on) {
      //   filter.updated_on = query.updated_on;
      // }

      try {
        const result = await database
          .find({
            ...req.query,
            ...filter,
          })
          .toArray();

        const filteredResult = result.map((r) => {
          return {
            _id: r._id,
            issue_title: r.issue_title ?? "",
            issue_text: r.issue_text ?? "",
            created_by: r.created_by ?? "",
            assigned_to: r.assigned_to ?? "",
            status_text: r.status_text ?? "",
            open: r.open ?? true,
            created_on: r.created_on ?? new Date(),
            updated_on: r.updated_on ?? new Date(),
          };
        });

        res.status(200).json(filteredResult);
      } catch (e) {
        res.status(200).json({ message: "Resource not found" });
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

        const response = await database.insertOne({
          ...body,
          created_on: new Date(),
          updated_on: new Date(),
          open: true,
        });

        const createdIssue = await database.findOne({
          _id: response.insertedId,
        });

        const returnObject = {
          _id: createdIssue._id,
          issue_title: createdIssue.issue_title,
          issue_text: createdIssue.issue_text,
          created_by: createdIssue.created_by,
          assigned_to: createdIssue.assigned_to ?? "",
          status_text: createdIssue.status_text ?? "",
          open: createdIssue.open ?? true,
          created_on: createdIssue.created_on,
          updated_on: createdIssue.updated_on,
        };

        res.status(200).json(returnObject);
      } catch (e) {
        res.status(200).json({ error: "required field(s) missing" });
      }
    })

    .put(async function (req, res) {
      let project = req.params.project;
      const database = client.db("projects").collection(project);

      const body = req.body;

      try {
        if (!body._id) {
          res.status(200).json({ error: "missing _id" });
          return;
        }

        const id = new ObjectId(req.body._id);

        const updatePayload = {
          updated_on: new Date(),
        };

        if (body.issue_title) {
          updatePayload.issue_title = body.issue_title;
        }

        if (body.issue_text) {
          updatePayload.issue_text = body.issue_text;
        }

        if (body.created_by) {
          updatePayload.created_by = body.created_by;
        }

        if (body.assigned_to) {
          updatePayload.assigned_to = body.assigned_to;
        }

        if (body.status_text) {
          updatePayload.status_text = body.status_text;
        }

        if (body.open) {
          updatePayload.open = body.open;
        }

        if (
          !updatePayload.issue_title &&
          !updatePayload.issue_text &&
          !updatePayload.created_by &&
          !updatePayload.assigned_to &&
          !updatePayload.status_text &&
          !updatePayload.open
        ) {
          res
            .status(200)
            .json({ error: "no update field(s) sent", _id: req.body._id });

          return;
        }

        const response = await database.updateOne(
          { _id: id },
          { $set: updatePayload },
        );

        if (response.modifiedCount === 0) {
          throw new Error();
        }

        res
          .status(200)
          .json({ result: "successfully updated", _id: req.body._id });
      } catch (e) {
        res.status(200).json({ error: "could not update", _id: req.body._id });
      }
    })

    .delete(async function (req, res) {
      let project = req.params.project;
      const database = client.db("projects").collection(project);
      const body = req.body;

      try {
        if (!body._id) {
          res.status(200).json({ error: "missing _id" });
          return;
        }

        const id = new ObjectId(req.body._id);

        const response = await database.deleteOne({ _id: id });

        if (response.deletedCount === 0) {
          throw new Error();
        }

        res
          .status(200)
          .json({ result: "successfully deleted", _id: req.body._id });
      } catch (e) {
        res.status(200).json({ error: "could not delete", _id: req.body._id });
      }
    });
};
