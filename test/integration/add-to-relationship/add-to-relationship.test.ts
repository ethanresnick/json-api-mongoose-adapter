import { expect } from "chai";
import { AddToRelationshipQuery, ResourceIdentifier } from 'json-api';

import '../../support/models';
import * as mongoose from 'mongoose';
import MongooseAdapter from '../../../src/MongooseAdapter';

import { clearDatabase, loadFixtures } from '../../support/fixtures';
import fixtures, {
  ORG_1_ID,
  PERSON_1_ID,
  PERSON_2_ID
} from './add-to-relationship.fixtures';

const { Organization } = mongoose.models;

describe("Partially modifying a relationship at a relationship endpoint", () => {
  let adapter: MongooseAdapter;

  before(() => {
    adapter = new MongooseAdapter(mongoose.models);
  });

  // const modifyRelationship = (method, linkage, url) => {
  //   return Agent.request(method, url)
  //     .accept("application/vnd.api+json")
  //     .type("application/vnd.api+json")
  //     .send(linkage)
  //     .then((res) => {
  //       expect(res.status).to.equal(204);
  //     });
  // };

  // const testRelationshipState = (expectedVal, url) => { //eslint-disable-line no-shadow
  //   return Agent.request("GET", url)
  //     .accept("application/vnd.api+json")
  //     .then((res) => {
  //       expect(res.body.data).to.deep.equal(expectedVal.data);
  //     });
  // };

  // const duplicateLinkage = {
  //   ...VALID_ORG_RELATIONSHIP_PATCH,
  //   data: [
  //     ...VALID_ORG_RELATIONSHIP_PATCH.data,
  //     ...VALID_ORG_RELATIONSHIP_PATCH.data
  //   ]
  // };

  describe("Adding to a to-many relationship at a relationship endpoint", () => {
    describe("Adding a new value", () => {
      let pre: any[];
      let post: any[];

      before(() => clearDatabase());
      before(() => loadFixtures(fixtures));

      before(async () => {
        const query = new AddToRelationshipQuery({
          type: 'organizations',
          id: ORG_1_ID,
          relationshipName: 'liaisons',
          returning: () => ({}),
          catch: () => ({}),
          linkage: [
            new ResourceIdentifier('people', PERSON_2_ID)
          ]
        });

        const {
          before: beforeRel,
          after: afterRel
        } = await adapter.addToRelationship(query);

        pre = beforeRel ? <any[]>beforeRel.toJSON({}).data : [];
        post = afterRel ? <any[]>afterRel.toJSON({}).data : [];
      });

      it("returns pre and post states with new linkage added", () => {
        expect(pre).to.have.lengthOf(1);
        expect(post).to.have.lengthOf(2);
      });

      it("returns the new linkage", () => {
        const newLinkage = post.find(
          candidate => !pre.find(existing => existing.id === candidate.id)
        );

        expect(newLinkage.id).equals(PERSON_2_ID);
      });

      it("gives all relationship data the correct linkage type", () => {
        expect(pre.every(({ type }) => type === 'people')).to.be.ok;
        expect(post.every(({ type }) => type === 'people')).to.be.ok;
      });

      it('saves the new linkage to the database', async () => {
        const org = await Organization
          .findById(ORG_1_ID)
          .select('liaisons');

        expect(org.liaisons).to.have.lengthOf(2);
        expect(org.liaisons).to.include(PERSON_2_ID);
      });
    });

    describe("Re-adding an existing value", () => {
      let pre: any[];
      let post: any[];

      before(() => clearDatabase());
      before(() => loadFixtures(fixtures));

      before(async () => {
        const query = new AddToRelationshipQuery({
          type: 'organizations',
          id: ORG_1_ID,
          relationshipName: 'liaisons',
          returning: () => ({}),
          catch: () => ({}),
          linkage: [
            new ResourceIdentifier('people', PERSON_1_ID)
          ]
        });

        const {
          before: beforeRel,
          after: afterRel
        } = await adapter.addToRelationship(query);

        pre = beforeRel ? <any[]>beforeRel.toJSON({}).data : [];
        post = afterRel ? <any[]>afterRel.toJSON({}).data : [];
      });

      it("returns matching pre and post states", () => {
        expect(pre).to.deep.equal(post);
      });

      it("gives all relationship data the correct linkage type", () => {
        expect(pre.every(({ type }) => type === 'people')).to.be.ok;
        expect(post.every(({ type }) => type === 'people')).to.be.ok;
      });

      it('does not change the linkage in the database', async () => {
        const org = await Organization
          .findById(ORG_1_ID)
          .select('liaisons');

        expect(org.liaisons).to.have.lengthOf(1);
        expect(org.liaisons[0].toString()).to.equal(PERSON_1_ID);
      });
    });

    describe("Adding the same linkage multiple times in the same query", () => {
      let pre: any[];
      let post: any[];

      before(() => clearDatabase());
      before(() => loadFixtures(fixtures));

      before(async () => {
        const query = new AddToRelationshipQuery({
          type: 'organizations',
          id: ORG_1_ID,
          relationshipName: 'liaisons',
          returning: () => ({}),
          catch: () => ({}),
          linkage: [
            new ResourceIdentifier('people', PERSON_2_ID),
            new ResourceIdentifier('people', PERSON_2_ID)
          ]
        });

        const {
          before: beforeRel,
          after: afterRel
        } = await adapter.addToRelationship(query);

        pre = beforeRel ? <any[]>beforeRel.toJSON({}).data : [];
        post = afterRel ? <any[]>afterRel.toJSON({}).data : [];
      });

      it("returns pre and post states with only one copy of the linkage added", () => {
        expect(pre).to.have.lengthOf(1);
        expect(post).to.have.lengthOf(2);
      });

      it("returns the new linkage", () => {
        const newLinkage = post.find(
          candidate => !pre.find(existing => existing.id === candidate.id)
        );

        expect(newLinkage.id).equals(PERSON_2_ID);
      });

      it("gives all relationship data the correct linkage type", () => {
        expect(pre.every(({ type }) => type === 'people')).to.be.ok;
        expect(post.every(({ type }) => type === 'people')).to.be.ok;
      });

      it('saves the new linkage to the database', async () => {
        const org = await Organization
          .findById(ORG_1_ID)
          .select('liaisons');

        expect(org.liaisons).to.have.lengthOf(2);
        expect(org.liaisons).to.include(PERSON_2_ID);
      });
    });

    describe("Providing an empty linkage array", () => {
      let pre: any[];
      let post: any[];

      before(() => clearDatabase());
      before(() => loadFixtures(fixtures));

      before(async () => {
        const query = new AddToRelationshipQuery({
          type: 'organizations',
          id: ORG_1_ID,
          relationshipName: 'liaisons',
          returning: () => ({}),
          catch: () => ({}),
          linkage: []
        });

        const {
          before: beforeRel,
          after: afterRel
        } = await adapter.addToRelationship(query);

        pre = beforeRel ? <any[]>beforeRel.toJSON({}).data : [];
        post = afterRel ? <any[]>afterRel.toJSON({}).data : [];
      });

      it("returns matching pre and post states", () => {
        expect(pre).to.deep.equal(post);
      });

      it("gives all relationship data the correct linkage type", () => {
        expect(pre.every(({ type }) => type === 'people')).to.be.ok;
        expect(post.every(({ type }) => type === 'people')).to.be.ok;
      });

      it('does not change the linkage in the database', async () => {
        const org = await Organization
          .findById(ORG_1_ID)
          .select('liaisons');

        expect(org.liaisons).to.have.lengthOf(1);
      });
    });
  });

  // describe("removing from a to-many relationship at a relationship endpoint", () => {
  //   it("should work", () => {
  //     return modifyRelationship("DEL", VALID_ORG_RELATIONSHIP_PATCH, relationshipEndpointUrl).then(() => {
  //       return testRelationshipState(VALID_TO_MANY_RELATIONSHIP_EMPTY_PATCH, relationshipEndpointUrl);
  //     })
  //   });

  //   it("should be a no-op when removing an item that isn't in the relationship", () => {
  //     return modifyRelationship("DEL", VALID_ORG_RELATIONSHIP_PATCH, relationshipEndpointUrl).then(() => {
  //       return testRelationshipState(VALID_TO_MANY_RELATIONSHIP_EMPTY_PATCH, relationshipEndpointUrl);
  //     });
  //   });

  //   it("should ignore duplicates in linkage to remove", () => {
  //     return modifyRelationship("POST", VALID_ORG_RELATIONSHIP_PATCH, relationshipEndpointUrl)
  //       .then(() => modifyRelationship("DEL", duplicateLinkage, relationshipEndpointUrl))
  //       .then(() => testRelationshipState(VALID_TO_MANY_RELATIONSHIP_EMPTY_PATCH, relationshipEndpointUrl));
  //   });

  //   it("should do nothing when removing an empty linkage array", () => {
  //     return modifyRelationship("POST", VALID_ORG_RELATIONSHIP_PATCH, relationshipEndpointUrl)
  //       .then(() => modifyRelationship("DEL", VALID_TO_MANY_RELATIONSHIP_EMPTY_PATCH, relationshipEndpointUrl))
  //       .then(() => testRelationshipState(VALID_ORG_RELATIONSHIP_PATCH, relationshipEndpointUrl));
  //   });
  // });

  describe("Using POST or DELETE on a to-one relationship", () => {
    // TODO: implementing this requires adapters to provide more information
    // the library about the cardinality of model relationships. Rather than
    // hacking support for that onto the existing adapter interface, I'll implement
    // this when I clean up the general division of labor between the adapter
    // and the resource type descriptions.
    it.skip("should 405");
  });
});
