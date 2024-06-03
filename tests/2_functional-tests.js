const { MongoClient } = require("mongodb");
const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const expect = chai.expect;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  suite("CREATE", () => {
    test("Create an issue with every field", (done) => {
      const issue = {
        issue_title: "Fix error in posting data",
        issue_text: "When we post data it has an error.",
        created_on: "2017-01-08T06:35:14.240Z",
        updated_on: "2017-01-08T06:35:14.240Z",
        created_by: "Joe",
        assigned_to: "Joe",
        open: true,
        status_text: "In QA",
      };

      chai
        .request(server)
        .keepOpen()
        .post("/api/issues/1")
        .send(issue)
        .end((err, res) => {
          assert.equal(res.status, 201);
          done();
        });
    });

    test("Create an issue with only required fields", (done) => {
      const issue = {
        issue_title: "Fix error in posting data",
        issue_text: "When we post data it has an error.",
        created_by: "Joe",
      };

      chai
        .request(server)
        .keepOpen()
        .post("/api/issues/1")
        .send(issue)
        .end((err, res) => {
          assert.equal(res.status, 201);
          done();
        });
    });

    test("Create an issue with missing required fields: issue_title", (done) => {
      const issue = {
        issue_text: "When we post data it has an error.",
        created_by: "Joe",
      };

      chai
        .request(server)
        .keepOpen()
        .post("/api/issues/1")
        .send(issue)
        .end((err, res) => {
          assert.equal(res.status, 400);
          done();
        });
    });

    test("Create an issue with missing required fields: issue_text", (done) => {
      const issue = {
        issue_title: "Fix error in posting data",
        created_by: "Joe",
      };

      chai
        .request(server)
        .keepOpen()
        .post("/api/issues/1")
        .send(issue)
        .end((err, res) => {
          assert.equal(res.status, 400);
          done();
        });
    });

    test("Create an issue with missing required fields: created_by", (done) => {
      const issue = {
        issue_title: "Fix error in posting data",
        issue_text: "When we post data it has an error.",
      };

      chai
        .request(server)
        .keepOpen()
        .post("/api/issues/1")
        .send(issue)
        .end((err, res) => {
          assert.equal(res.status, 400);
          done();
        });
    });
  });

  suite("READ", () => {
    test("View issues on a project", (done) => {
      chai
        .request(server)
        .keepOpen()
        .get("/api/issues/1")
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
    });

    test("View issues on a project with one filter: open = true", (done) => {
      chai
        .request(server)
        .keepOpen()
        .get("/api/issues/1?open=true")
        .end((err, res) => {
          assert.equal(res.status, 200);

          expect(res.body).to.be.an("array");

          for (const item of res.body) {
            expect(item).to.have.property("open").to.equal(true);
          }

          done();
        });
    });

    test("View issues on a project with one filter: open = false", (done) => {
      chai
        .request(server)
        .keepOpen()
        .get("/api/issues/1?open=false")
        .end((err, res) => {
          assert.equal(res.status, 200);

          expect(res.body).to.be.an("array");

          for (const item of res.body) {
            expect(item).to.have.property("open").to.equal(false);
          }

          done();
        });
    });

    test("View issues on a project with one filter: assigned_to = Joe", (done) => {
      chai
        .request(server)
        .keepOpen()
        .get("/api/issues/1?assigned_to=Joe")
        .end((err, res) => {
          assert.equal(res.status, 200);

          expect(res.body).to.be.an("array");

          for (const item of res.body) {
            expect(item).to.have.property("assigned_to").to.equal("Joe");
          }

          done();
        });
    });

    test("View issues on a project with multiple filters: open = true and assigned_to = Joe", (done) => {
      chai
        .request(server)
        .keepOpen()
        .get("/api/issues/1?open=true&assigned_to=Joe")
        .end((err, res) => {
          assert.equal(res.status, 200);

          expect(res.body).to.be.an("array");

          for (const item of res.body) {
            expect(item).to.have.property("open").to.equal(true);
            expect(item).to.have.property("assigned_to").to.equal("Joe");
          }

          done();
        });
    });
  });

  suite("UPDATE", () => {
    test("Update one field on an issue: PUT request", (done) => {
      const issue = {
        _id: "665d24539ef675772d8a2029",
        issue_text: "New title",
      };

      chai
        .request(server)
        .keepOpen()
        .put("/api/issues/1")
        .send(issue)
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
    });

    test("Update multiple fields on an issue", (done) => {
      const issue = {
        _id: "665d24539ef675772d8a2029",
        issue_text: "New title",
        issue_text: "New issue text",
      };

      chai
        .request(server)
        .keepOpen()
        .put("/api/issues/1")
        .send(issue)
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
    });

    test("Update an issue with missing _id", (done) => {
      const issue = {
        issue_text: "New title",
        issue_text: "New issue text",
      };

      chai
        .request(server)
        .keepOpen()
        .put("/api/issues/1")
        .send(issue)
        .end((err, res) => {
          assert.equal(res.status, 400);
          done();
        });
    });

    test("Update an issue with no fields to update", (done) => {
      const issue = {
        _id: "665d24539ef675772d8a2029",
      };

      chai
        .request(server)
        .keepOpen()
        .put("/api/issues/1")
        .send(issue)
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
    });

    test("Update an issue with an invalid _id", (done) => {
      const issue = {
        _id: "2",
      };

      chai
        .request(server)
        .keepOpen()
        .put("/api/issues/1")
        .send(issue)
        .end((err, res) => {
          assert.equal(res.status, 400);
          done();
        });
    });
  });

  suite("DELETE", () => {
    test("Delete an issue", (done) => {
      const issue = {
        issue_title: "Fix error in posting data",
        issue_text: "When we post data it has an error.",
        created_by: "Joe",
      };

      chai
        .request(server)
        .keepOpen()
        .post("/api/issues/1")
        .send(issue)
        .end((err, res) => {
          assert.equal(res.status, 201);

          chai
            .request(server)
            .keepOpen()
            .delete("/api/issues/1")
            .send({ _id: res.body.insertedId })
            .end((err, res) => {
              assert.equal(res.status, 204);
              done();
            });
        });
    });

    test("Delete an issue with an invalid _id", (done) => {
      chai
        .request(server)
        .keepOpen()
        .delete("/api/issues/1")
        .send({ _id: "1" })
        .end((err, res) => {
          assert.equal(res.status, 404);
          done();
        });
    });

    test("Delete an issue with missing _id", (done) => {
      chai
        .request(server)
        .keepOpen()
        .delete("/api/issues/1")
        .end((err, res) => {
          assert.equal(res.status, 404);
          done();
        });
    });
  });
});
