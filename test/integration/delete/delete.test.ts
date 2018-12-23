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

  const deleteResources = async (ids: string | string[]) => {
    const query = getDeletionQuery(ids);
    const results = (await adapter.delete(query)).deleted;
    return results ? results.unwrap() : null;
  };

  const getDeletionQuery = (ids: string | string[]) => new DeleteQuery({
    type: 'organizations',
    ids: Array.isArray(ids) ? ids : [ ids ],
    isSingular: !Array.isArray(ids),
    returning: () => ({})
  });

  const checkRemainingOrgs = async (ids: string[]) => {
    const orgs = await Organization.find().select('_id');
    const orgIds = orgs.map(org => org._id.toString()).sort();

    expect(orgIds).to.deep.equal(ids);
  };

  describe("Single resource deletion", () => {
    describe("Valid singular deletion", () => {
      let deleted;

      before(() => clearDatabase());
      before(() => loadFixtures(fixtures));

      before(async () => deleted = await deleteResources(ORG_1_ID))

      it("should remove the resource from the database", async () => {
        await checkRemainingOrgs([ ORG_2_ID, ORG_3_ID ]);
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
          await deleteResources(ObjectId().toHexString())
        } catch (err) {
          expect(err.status).equal('404');
          return;
        }

        expect.fail('expected deletion to throw');
      });
    });
  });

  describe("Bulk resource deletion", () => {
    describe("Valid deletion", () => {
      let deleted;

      before(() => clearDatabase());
      before(() => loadFixtures(fixtures));

      before(async () => deleted = await deleteResources([ ORG_1_ID, ORG_2_ID ]));

      it("should remove the deleted resources from the database", async () => {
        await checkRemainingOrgs([ ORG_3_ID ]);
      });

      it("should return the deleted resources", () => {
        expect(deleted).to.have.lengthOf(2);

        for (const org of deleted) {
          expect(org.type).to.equal('organizations');
          expect([ ORG_1_ID, ORG_2_ID ]).to.include(org.id);
          expect(org.attributes.name).to.exist;
        }

        expect(deleted[0].id).to.not.equal(deleted[1].id);
      });
    });

    describe("Deletion including IDs of resources that do not exist", () => {
      let deleted;

      before(() => clearDatabase());
      before(() => loadFixtures(fixtures));

      before(async () => deleted = await deleteResources([ ORG_1_ID, ObjectId().toHexString() ]));

      it("should remove the valid resource from the database", async () => {
        await checkRemainingOrgs([ ORG_2_ID, ORG_3_ID ]);
      });

      it("should return the deleted resource", () => {
        expect(deleted).to.have.lengthOf(1);
      });
    });
  });
});
