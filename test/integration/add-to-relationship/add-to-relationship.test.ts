import { expect } from "chai";
import { AddToRelationshipQuery, ResourceIdentifier } from 'json-api';
import { AddToRelationshipQueryOptions } from 'json-api/build/src/types/Query/AddToRelationshipQuery';

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

describe("Adding to a relationship at a relationship endpoint", () => {
  let adapter: MongooseAdapter;

  before(() => {
    adapter = new MongooseAdapter(mongoose.models);
  });

  const addToRel = async (linkage: AddToRelationshipQueryOptions['linkage']) => {
    const query = addToRelQuery(linkage);

    const {
      before: beforeRel,
      after: afterRel
    } = await adapter.addToRelationship(query);

    const pre = beforeRel ? <any[]>beforeRel.toJSON({}).data : [];
    const post = afterRel ? <any[]>afterRel.toJSON({}).data : [];

    return { pre, post };
  };

  const addToRelQuery = (linkage: AddToRelationshipQueryOptions['linkage']) => new AddToRelationshipQuery({
    type: 'organizations',
    id: ORG_1_ID,
    relationshipName: 'liaisons',
    returning: () => ({}),
    catch: () => ({}),
    linkage
  });

  const checkSavedLiaisons = async (people: string[]) => {
    const org = await Organization
      .findById(ORG_1_ID)
      .select('liaisons');

    const sortedActual = org.liaisons
      .map(l => l.toString())
      .sort();

    const sortedExpected = people.sort();

    expect(sortedActual).to.deep.equal(sortedExpected);
  };

  describe("Adding to a to-many relationship at a relationship endpoint", () => {
    describe("Adding a new value", () => {
      let results;

      before(() => clearDatabase());
      before(() => loadFixtures(fixtures));

      before(async () => {
        results = await addToRel([
          new ResourceIdentifier('people', PERSON_2_ID)
        ]);
      });

      it("returns pre and post states with new linkage added", () => {
        expect(results.pre).to.have.lengthOf(1);
        expect(results.post).to.have.lengthOf(2);
      });

      it("returns the new linkage", () => {
        const newLinkage = results.post.find(
          candidate => !results.pre.find(existing => existing.id === candidate.id)
        );

        expect(newLinkage.id).equals(PERSON_2_ID);
      });

      it("gives all relationship data the correct linkage type", () => {
        expect(results.pre.every(({ type }) => type === 'people')).to.be.ok;
        expect(results.post.every(({ type }) => type === 'people')).to.be.ok;
      });

      it('saves the new linkage to the database', async () => {
        await checkSavedLiaisons([ PERSON_1_ID, PERSON_2_ID ]);
      });
    });

    describe("Re-adding an existing value", () => {
      let results;

      before(() => clearDatabase());
      before(() => loadFixtures(fixtures));

      before(async () => {
        results = await addToRel([
          new ResourceIdentifier('people', PERSON_1_ID)
        ]);
      });

      it("returns matching pre and post states", () => {
        expect(results.pre).to.deep.equal(results.post);
      });

      it("gives all relationship data the correct linkage type", () => {
        expect(results.pre.every(({ type }) => type === 'people')).to.be.ok;
        expect(results.post.every(({ type }) => type === 'people')).to.be.ok;
      });

      it('does not change the linkage in the database', async () => {
        await checkSavedLiaisons([ PERSON_1_ID ]);
      });
    });

    describe("Adding the same linkage multiple times in the same query", () => {
      let results;

      before(() => clearDatabase());
      before(() => loadFixtures(fixtures));

      before(async () => {
        results = await addToRel([
          new ResourceIdentifier('people', PERSON_2_ID),
          new ResourceIdentifier('people', PERSON_2_ID)
        ]);
      });

      it("returns pre and post states with only one copy of the linkage added", () => {
        expect(results.pre).to.have.lengthOf(1);
        expect(results.post).to.have.lengthOf(2);
      });

      it("returns the new linkage", () => {
        const newLinkage = results.post.find(
          candidate => !results.pre.find(existing => existing.id === candidate.id)
        );

        expect(newLinkage.id).equals(PERSON_2_ID);
      });

      it("gives all relationship data the correct linkage type", () => {
        expect(results.pre.every(({ type }) => type === 'people')).to.be.ok;
        expect(results.post.every(({ type }) => type === 'people')).to.be.ok;
      });

      it('saves the new linkage to the database', async () => {
        await checkSavedLiaisons([ PERSON_1_ID, PERSON_2_ID ]);
      });
    });

    describe("Providing an empty linkage array", () => {
      let results;

      before(() => clearDatabase());
      before(() => loadFixtures(fixtures));

      before(async () => {
        results = await addToRel([]);
      });

      it("returns matching pre and post states", () => {
        expect(results.pre).to.deep.equal(results.post);
      });

      it("gives all relationship data the correct linkage type", () => {
        expect(results.pre.every(({ type }) => type === 'people')).to.be.ok;
        expect(results.post.every(({ type }) => type === 'people')).to.be.ok;
      });

      it('does not change the linkage in the database', async () => {
        await checkSavedLiaisons([ PERSON_1_ID ]);
      });
    });
  });
});
