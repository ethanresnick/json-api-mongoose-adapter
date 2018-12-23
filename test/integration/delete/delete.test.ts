import { expect } from "chai";

import fixtures, {
  ORG_1_ID,
  ORG_2_ID,
  ORG_3_ID
} from './delete.fixtures';

import '../../support/models';
import * as mongoose from 'mongoose';
import MongooseAdapter from '../../../src/MongooseAdapter';

import { clearDatabase, loadFixtures } from '../../support/fixtures';
import { DeleteQuery } from 'json-api';

const { ObjectId } = mongoose.Types;
const { Organization } = mongoose.models;


describe("Deleting resources", () => {
  let adapter: MongooseAdapter;

  before(() => {
    adapter = new MongooseAdapter(mongoose.models);
  });

  describe("Single resource deletion", () => {
    const deleteSingleResource = async (id: string) => {
      const query = getDeletionQuery(id);
      const results = (await adapter.delete(query)).deleted;
      return results ? results.unwrap() : null;
    };

    const getDeletionQuery = (ids: string | string[]) => new DeleteQuery({
      type: 'organizations',
      ids: Array.isArray(ids) ? ids : [ ids ],
      isSingular: true,
      returning: () => ({})
    });

    describe("Valid singular deletion", () => {
      let deleted;

      before(() => clearDatabase());
      before(() => loadFixtures(fixtures));

      before(async () => deleted = await deleteSingleResource(ORG_1_ID))

      it("should remove the resource from the database", async () => {
        const orgs = await Organization.find(ORG_1_ID).select('_id');
        const orgIds = orgs.map(org => org._id.toString()).sort();

        expect(orgIds).to.deep.equal([ ORG_2_ID, ORG_3_ID ]);
      });

      it("should return the deleted resource", () => {
        expect(deleted).to.exist;
        expect(deleted.type).to.equal('organizations');
        expect(deleted.id).to.equal(ORG_1_ID);
        expect(deleted.attributes.name).to.equal('ORGANIZATION 1');
      });
    });

    describe("Deletion of a resource that does not exist", () => {
      it('should throw a 404 error', async () => {
        try {
          await deleteSingleResource(ObjectId().toHexString())
        } catch (err) {
          expect(err.status).equal('404');
          return;
        }

        expect.fail('expected deletion to throw');
      });
    });
  });

  /*
  describe("Bulk delete", () => {
    let creationIds;
    beforeEach(() => {
      return Promise.all([createSchool(Agent), createSchool(Agent)]).then(schools => {
        creationIds = schools.map(it => it.id);
      });
    });

    it("should support bulk delete", () => {
      return Agent.request("DEL", `/schools`)
        .type("application/vnd.api+json")
        .send({ data: creationIds.map(id => ({ type: "organizations", id })) })
        .then(() => {
          const notFoundPromises =
            creationIds.map(id =>
              Agent.request("GET", `/schools/${id}`)
                .accept("application/vnd.api+json")
                .then(() => {
                  throw new Error("shouldn't run");
                }, err => {
                  expect(err.response.statusCode).to.equal(404);
                }));

          return Promise.all(notFoundPromises);
        });
    });

    it("should delete all matching resources, even if some are not found", () => {
      // First id below doesn't exist; should not trigger a 404 in the bulk case.
      const idsToDelete = ["56beb8500000000000000000", ...creationIds];

      return Agent.request("DEL", `/schools`)
        .type("application/vnd.api+json")
        .send({ data: idsToDelete.map(id => ({ type: "organizations", id })) })
        .then((resp) => {
          expect(resp.status).to.equal(204);
          return Promise.all(creationIds.map(it => {
            return Agent.request("GET", `/organizations/${it}`).then(() => {
              throw new Error("Should not run!");
            }, (e) => {
              expect(e.status).to.equal(404);
            });
          }));
        });
    });
  });
  */
});

// function createSchool(Agent) {
//   return Agent.request("POST", "/schools")
//     .type("application/vnd.api+json")
//     .send({ data: VALID_SCHOOL_RESOURCE_NO_ID })
//     .then(response => response.body.data);
// }
