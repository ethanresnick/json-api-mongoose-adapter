import { expect } from "chai";
import { FindQuery, FieldExpression } from 'json-api';

import fixtures, {
  PERSON_1_ID,
  PERSON_2_ID,
  ORG_1_ID
} from './find-resources.fixtures';

import '../../support/models';
import * as mongoose from 'mongoose';
import MongooseAdapter from '../../../src/MongooseAdapter';

import { clearDatabase, loadFixtures } from '../../support/fixtures';
import Resource from 'json-api/build/src/types/Resource';
import { ReturnedResource } from 'json-api/build/src/db-adapters/AdapterInterface';

const { ObjectId } = mongoose.Types;

describe("Fetching Resources", () => {
  let adapter: MongooseAdapter;

  before(() => {
    adapter = new MongooseAdapter(mongoose.models);
  });

  before(() => clearDatabase());
  before(() => loadFixtures(fixtures));

  describe("Fetching missing resources", () => {
    it("throws 404 error", async () => {
      try {
        await adapter.find(new FindQuery({
          type: 'organizations',
          id: ObjectId().toHexString(),
          returning: () => ({})
        }));
      } catch (err) {
        expect(err[0].status).to.equal('404');
        return;
      }

      expect.fail();
    });
  });

  describe("Fetching single resource with include", () => {
    it("should return corrrect included resources", async () => {
      const { primary, included } = await adapter.find(new FindQuery({
        type: 'organizations',
        id: ORG_1_ID,
        populates: [ 'liaisons' ],
        returning: () => ({})
      }));

      expect((primary.unwrap() as Resource).id).to.equal(ORG_1_ID);
      expect((included as ReturnedResource[]).map(r => r.id).sort()).to.deep.equal([
        PERSON_1_ID,
        PERSON_2_ID
      ].sort());
    });
  });

  describe("Fetching a single resource with an id filter", () => {
    it("should not allow user's filter to override id in url", async () => {
      try {
        await adapter.find(new FindQuery({
          type: 'organizations',
          id: ObjectId().toHexString(),
          filters: [ FieldExpression('eq', [ 'id', ObjectId().toHexString() ]) ],
          returning: () => ({})
        }));
      } catch (err) {
        expect(err[0].status).to.equal('404');
        return;
      }

      expect.fail();
    });
  });
});
