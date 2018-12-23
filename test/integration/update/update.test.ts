import { expect } from "chai";

import fixtures, {
  PERSON_1_ID,
  ORG_1_ID,
  // ORG_2_ID,
  // ORG_3_ID
} from './update.fixtures';

import '../../support/models';
import * as mongoose from 'mongoose';
import MongooseAdapter from '../../../src/MongooseAdapter';

import { clearDatabase, loadFixtures } from '../../support/fixtures';
import { UpdateQuery, Data } from 'json-api';
import Resource, { ResourceWithTypePath, ResourceWithId } from 'json-api/build/src/types/Resource';

const { ObjectId } = mongoose.Types;
const { Organization } = mongoose.models;

describe("Updating resources", () => {
  let adapter: MongooseAdapter;

  before(() => {
    adapter = new MongooseAdapter(mongoose.models);
  });

  const update = async (type: string, id: string, attrs: any = {}, rels: any = {}) => {
    const resource = getResource(type, id, attrs, rels);
    const query = getUpdateQuery(resource);
    return (await adapter.update(query)).updated.unwrap();
  }

  const getUpdateQuery = (resource: ResourceWithTypePath & ResourceWithId) => {
    return new UpdateQuery({
      type: resource.type,
      patch: Data.pure(resource),
      returning: () => ({}),
      catch: () => ({})
    });
  };

  const getResource = (type: string, id: string, attrs: any, rels: any) => {
    const resource = new Resource(type, id, attrs, rels);
    resource.typePath = [ type ];
    return resource as ResourceWithTypePath & ResourceWithId;
  }

  describe("Updating a resource's attributes", () => {
    let result;
    let updated;

    before(() => clearDatabase());
    before(() => loadFixtures(fixtures));

    before(async () => {
      result = await update('organizations', ORG_1_ID, { name: 'Changed Name', echo: 'abcde' });
      updated = await Organization.findById(ORG_1_ID);
    });

    it("should not reset fields missing in the update to their defaults", () => {
      expect(result.attributes.modified.toISOString()).to.equal(new Date("2015-01-01").toISOString(), 'returned value');
      expect(updated.modified.toISOString()).to.equal(new Date("2015-01-01").toISOString(), 'value in database');
    });

    it("should invoke setters on virtual, updated attributes", () => {
      expect(result.attributes.echo).to.be.equal("abcde");
      expect(result.attributes.reversed).to.be.equal("edcba");
      expect(updated.echo).to.be.equal("abcde");
      expect(updated.reversed).to.be.equal("edcba");
    });

    it("should invoke setters on non-virtual updated attributes", () => {
      expect(result.attributes.name).to.equal("CHANGED NAME");
      expect(updated.name).to.equal("CHANGED NAME");
    });

    it("should not change attributes not (directly or indirectly) part of the update", () => {
      expect(result.relationships.liaisons.toJSON({}).data).to.deep.equal([{
        type: "people",
        id: PERSON_1_ID
      }]);
      expect(updated.liaisons.map(id => id.toString())).to.deep.equal([ PERSON_1_ID ]);
    });
  });

  describe("Updating a non-existent resource", () => {
    it("should 404 with resources with subtypes", async () => {
      try {
        await update('organizations', ObjectId().toHexString());
      } catch (err) {
        expect(err.status).to.equal('404');
        return;
      }

      expect.fail('expected update to throw');
    });

    it("should 404 with resources without subtypes", async () => {
      try {
        await update('people', ObjectId().toHexString());
      } catch (err) {
        expect(err.status).to.equal('404');
        return;
      }

      expect.fail('expected update to throw');
    });
  });

  describe("Changing a resource's type", () => {
    it("should succeed if changing to a subtype");
    it("should fail if changing to a super type not supported by the endpoint");
    it("should succeed if changing to a super type supported by the endpoint");
  });
});
