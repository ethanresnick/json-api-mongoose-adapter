import { expect } from "chai";
import { CreateQuery, Data, Resource, Relationship, ResourceIdentifier } from 'json-api';
import { ResourceWithTypePath } from 'json-api/build/src/types/Resource';

import '../../support/models';
import * as mongoose from 'mongoose';
import MongooseAdapter from '../../../src/MongooseAdapter';

import fixtures, { PERSON_1_ID } from './create.fixtures';
import { clearDatabase, loadFixtures } from '../../support/fixtures';

const { Organization } = mongoose.models;

describe("Creating resources", () => {
  let adapter: MongooseAdapter;

  before(() => {
    adapter = new MongooseAdapter(mongoose.models);
  });

  describe("Valid singular resource with an extra attribute", () => {
    let created;

    const createOrg = async () => {
      const query = getCreateOrgQuery()
      return (await adapter.create(query)).created.unwrap();
    }

    const getCreateOrgQuery = () => {
      const attrs = { name: 'New Org Name', extra: 'Hello world' };
      const rels = getLiaisonRel();
      const resource = getResource(attrs, rels);

      return new CreateQuery({
        type: 'organizations',
        returning: () => ({}),
        catch: () => ({}),
        records: Data.pure(resource as ResourceWithTypePath)
      });
    };

    const getLiaisonRel = () => ({
      liaisons: Relationship.of({
        data: getToManyLinkage('people', [ PERSON_1_ID ]),
        owner: { type: 'organizations', path: 'organizations', id: undefined }
      })
    });

    const getResource = (attrs: any, rels: any) => {
      const resource = new Resource('organizations', undefined, attrs, rels);
      resource.typePath = ['organizations'];
      return resource as ResourceWithTypePath;
    }

    before(() => clearDatabase());
    before(() => loadFixtures(fixtures));

    before(async () => {
      created = await createOrg()
    });

    it("returns the created resource", () => {
      expect(created).to.be.an("object");
      expect(created.id).to.exist;
      expect(created.type).to.equal("organizations");
      expect(created.attributes).to.be.an("object");
      expect(created.relationships).to.be.an("object");
      expect(created.relationships.liaisons).to.be.an("object");
    });

    it("return the given attributes", () => {
      expect(created.attributes.name).to.equal("NEW ORG NAME");
    });

    it("returns the given relationships", () => {
      const { data } = created.relationships.liaisons.toJSON({})
      expect(data).to.have.lengthOf(1);
      expect(data[0].type).to.equal('people');
      expect(data[0].id).to.equal(PERSON_1_ID);
    });

    it("should ignore extra attrs", () => {
      expect(created.extra).to.be.undefined;
      expect(created.attributes.extra).to.be.undefined;
    });

    it("actually saved the resource to the database", async () => {
      const [ org, ...others ] = await Organization.find();

      expect(others).to.have.lengthOf(0);

      expect(org.name).to.equal('NEW ORG NAME');
      expect(org.extra).to.not.exist;
      expect(org.liaisons.map(l => l.toString())).to.deep.equal([ PERSON_1_ID ]);
    });
  });

  it("can save valid lists of resources");
  it("can save to-one relationships");
  it("is a no-op if no resources are provided");
  it("reports errors if the resources fails to save");
  it("does not insert any resources if one fails to save");
});

function getToManyLinkage(type: string, ids: any[]): Data<ResourceIdentifier> {
  return Data.of(
    ids
      .filter(id => id !== null)
      .map(id => new ResourceIdentifier(
        type,
        String(id)
      ))
  );
}
